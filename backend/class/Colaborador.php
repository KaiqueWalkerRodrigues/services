<?php

require_once __DIR__ . '/Conexao.php';

class Colaborador
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function cadastrar($id_empresa, $nome, $login, $senha)
    {
        try {
            $sql = "INSERT INTO colaboradores (nome, login, senha, created_at, updated_at) 
                    VALUES (:nome, :login, :senha, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);

            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':login', $login);
            $stmt->bindParam(':senha', $senhaHash);

            $stmt->execute();

            $id_colaborador = $this->pdo->lastInsertId();

            $sql = "INSERT INTO colaboradores_empresas (id_empresa, id_colaborador, created_at) VALUES (:id_empresa, :id_colaborador, NOW());";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':id_colaborador', $id_colaborador);

            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Colaborador cadastrado com sucesso!',
                'id' => $id_colaborador
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao cadastrar colaborador: ' . $e->getMessage()
            ];
        }
    }

    public function editar($id_colaborador, $nome, $login, $senha = null)
    {
        try {
            if ($senha) {
                $sql = "UPDATE colaboradores 
                        SET nome = :nome, login = :login, senha = :senha, updated_at = NOW() 
                        WHERE id_colaborador = :id_colaborador AND deleted_at IS NULL";
            } else {
                $sql = "UPDATE colaboradores 
                        SET nome = :nome, login = :login, updated_at = NOW() 
                        WHERE id_colaborador = :id_colaborador AND deleted_at IS NULL";
            }

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':login', $login);
            $stmt->bindParam(':id_colaborador', $id_colaborador);

            if ($senha) {
                $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
                $stmt->bindParam(':senha', $senhaHash);
            }

            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Colaborador atualizado com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Colaborador não encontrado ou não houve alterações.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao atualizar colaborador: ' . $e->getMessage()];
        }
    }

    public function deletar($id_colaborador)
    {
        try {
            $sql = "UPDATE colaboradores SET deleted_at = NOW() WHERE id_colaborador = :id_colaborador AND deleted_at IS NULL";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_colaborador', $id_colaborador);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Colaborador removido com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Colaborador não encontrado ou já removido.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao deletar colaborador: ' . $e->getMessage()];
        }
    }

    public function listar()
    {
        try {
            $sql = "SELECT id_colaborador, nome, login, created_at, updated_at 
                    FROM colaboradores WHERE deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'total' => count($dados), 'dados' => $dados];
            } else {
                return ['status' => 'sucesso', 'total' => 0, 'dados' => [], 'mensagem' => 'Nenhum colaborador encontrado.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar os colaboradores: ' . $e->getMessage()];
        }
    }

    public function mostrar($id_colaborador)
    {
        try {
            $sql = "SELECT id_colaborador, nome, login, created_at, updated_at 
                    FROM colaboradores 
                    WHERE id_colaborador = :id_colaborador AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_colaborador', $id_colaborador);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Colaborador não encontrado.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar colaborador: ' . $e->getMessage()];
        }
    }

    public function login($login, $senha, $id_empresa, $origem, $ip_address = null)
    {
        try {
            // 1. Busca colaborador
            $sql = "SELECT 
                        c.id_colaborador, 
                        c.login, 
                        c.senha, 
                        c.is_sa 
                    FROM colaboradores AS c
                    INNER JOIN colaboradores_empresas AS ce 
                        ON c.id_colaborador = ce.id_colaborador
                    WHERE c.login = :login 
                    AND ce.id_empresa = :id_empresa
                    AND c.deleted_at IS NULL 
                    LIMIT 1;";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':login', $login);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($senha, $usuario['senha'])) {
                unset($usuario['senha']);

                // 2. Converta is_sa para booleano real
                $usuario['is_sa'] = (bool) ($usuario['is_sa'] ?? false);

                // 3. Obtém todos os grupos (Múltiplos grupos)
                $grupos = $this->obterGruposColaborador($usuario['id_colaborador']);
                $ids_grupos = array_column($grupos, 'id_grupo');

                // 4. Obtém permissões agregadas de todos os grupos
                // Se for Super Admin, ganha '*' automaticamente
                $permissoes = $usuario['is_sa'] ? ['*'] : $this->obterPermissoesGrupos($ids_grupos);

                // 5. Obtém todas as empresas vinculadas
                $empresas_acesso = $this->obterEmpresasAcesso($usuario['id_colaborador']);

                // 6. Gera Refresh Token
                $refreshToken = bin2hex(random_bytes(32));

                // 4. Limpar sessoes da mesma origem ativa
                $sqlLimpar = "DELETE FROM acessos_tokens 
                    WHERE id_colaborador = :id_colaborador 
                    AND origem = :origem";

                $stmtLimpar = $this->pdo->prepare($sqlLimpar);
                $stmtLimpar->execute([
                    ':id_colaborador' => $usuario['id_colaborador'],
                    ':origem' => $origem
                ]);

                // 5. Insere o token na tabela acessos_tokens (Validade de 30 dias)
                $sqlToken = "INSERT INTO acessos_tokens (id_colaborador, id_empresa, refresh_token, origem, ip_address, expires_at, created_at) 
                             VALUES (:id_colaborador, :id_empresa, :refresh_token, :origem, :ip_address, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())";

                $stmtToken = $this->pdo->prepare($sqlToken);
                $stmtToken->bindParam(':id_colaborador', $usuario['id_colaborador']);
                $stmtToken->bindParam(':id_empresa', $id_empresa);
                $stmtToken->bindParam(':refresh_token', $refreshToken);
                $stmtToken->bindParam(':origem', $origem);
                $stmtToken->bindParam(':ip_address', $ip_address);
                $stmtToken->execute();

                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Login aprovado.',
                    'dados_usuario' => $usuario,
                    'refresh_token' => $refreshToken,
                    'is_sa' => $usuario['is_sa'],
                    'grupos' => $grupos,
                    'permissoes' => $permissoes,
                    'empresas_acesso' => $empresas_acesso
                ];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Login ou senha incorretos.'];
            }
        } catch (PDOException $e) {
            return ['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()];
        }
    }

    public function logout($id_colaborador, $refreshToken)
    {
        // Deleta o refresh_token do banco de dados para que ele não possa mais ser usado
        $sql = "DELETE FROM acessos_tokens WHERE id_colaborador = :id AND refresh_token = :token";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id_colaborador, ':token' => $refreshToken]);

        return $stmt->rowCount() > 0;
    }

    public function renovarSessao($idColaborador, $id_empresa, $oldRefreshToken, $origem, $ip_address)
    {
        try {
            // 1. Verifica se o token existe e ainda é válido
            $sql = "SELECT id_token FROM acessos_tokens 
                    WHERE id_colaborador = :id 
                    AND refresh_token = :token 
                    AND expires_at > NOW()";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => $idColaborador, ':token' => $oldRefreshToken]);

            if (!$stmt->fetch()) {
                return ['status' => 'erro', 'mensagem' => 'Token inválido ou expirado.'];
            }

            // 2. Rotaciona: Deleta o velho e gera um novo
            $this->logout($idColaborador, $oldRefreshToken);

            $newRefreshToken = bin2hex(random_bytes(32));

            $sqlInsert = "INSERT INTO acessos_tokens (id_colaborador, id_empresa, refresh_token, origem, ip_address, expires_at, created_at) 
                          VALUES (:id, :id_empresa, :token, :origem, :ip, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())";

            $stmtInsert = $this->pdo->prepare($sqlInsert);
            $stmtInsert->execute([
                ':id' => $idColaborador,
                ':id_empresa' => $id_empresa,
                ':token' => $newRefreshToken,
                ':origem' => $origem,
                ':ip' => $ip_address
            ]);

            return [
                'status' => 'sucesso',
                'refresh_token' => $newRefreshToken
            ];
        } catch (PDOException $e) {
            return ['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()];
        }
    }

    /**
     * Obtém as permissões de um grupo específico.
     * Retorna um array com os nomes de permissões (strings).
     */
    /**
     * Obtém as permissões de um grupo específico.
     * Retorna um array com os nomes de permissões (strings).
     */
    public function obterPermissoesGrupo($id_grupo)
    {
        try {
            $sql = "SELECT p.slug 
                FROM permissoes p
                INNER JOIN grupos_permissoes gp ON p.id_permissao = gp.id_permissao
                WHERE gp.id_grupo = :id_grupo 
                AND gp.deleted_at IS NULL
                AND p.deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_grupo', $id_grupo);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
        } catch (PDOException $e) {
            error_log('Erro ao obter permissões do grupo: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtém as permissões agregadas de múltiplos grupos.
     * Retorna um array com os nomes de permissões (strings) de todos os grupos.
     */
    public function obterPermissoesGrupos(array $ids_grupos)
    {
        if (empty($ids_grupos)) {
            return [];
        }

        try {
            $placeholders = implode(',', array_fill(0, count($ids_grupos), '?'));
            // A estrutura de JOIN permanece funcional mesmo com a nova PK
            $sql = "SELECT DISTINCT p.slug 
                FROM permissoes p
                INNER JOIN grupos_permissoes gp ON p.id_permissao = gp.id_permissao
                WHERE gp.id_grupo IN ($placeholders)
                AND gp.deleted_at IS NULL
                AND p.deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            foreach (array_values($ids_grupos) as $index => $id_grupo) {
                $stmt->bindValue($index + 1, $id_grupo, PDO::PARAM_INT);
            }
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
        } catch (PDOException $e) {
            error_log('Erro ao obter permissões dos grupos: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtém todos os grupos do colaborador.
     * Tenta primeiro a tabela colaboradores_grupos, depois fallback para grupos via colaboradores.id_grupo.
     */
    public function obterGruposColaborador($id_colaborador)
    {
        try {
            $sql = "SELECT g.id_grupo, g.nome as nome_grupo 
                FROM colaboradores_grupos cg
                INNER JOIN grupos g ON cg.id_grupo = g.id_grupo
                WHERE cg.id_colaborador = :id_colaborador
                AND cg.deleted_at IS NULL
                AND g.deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_colaborador', $id_colaborador);
            $stmt->execute();

            $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($grupos)) {
                return $grupos;
            }

            $sqlFallback = "SELECT g.id_grupo, g.nome_grupo \
                            FROM grupos g
                            INNER JOIN colaboradores c ON c.id_grupo = g.id_grupo
                            WHERE c.id_colaborador = :id_colaborador
                            AND c.deleted_at IS NULL
                            AND g.deleted_at IS NULL";

            $stmtFallback = $this->pdo->prepare($sqlFallback);
            $stmtFallback->bindParam(':id_colaborador', $id_colaborador);
            $stmtFallback->execute();
            $resultado = $stmtFallback->fetch(PDO::FETCH_ASSOC);

            return $resultado ? [$resultado] : [];
        } catch (PDOException $e) {
            error_log('Erro ao obter grupos do colaborador: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtém o flag 'is_sa' (Super Admin) e o nome do grupo de um colaborador.
     * Retorna array: ['is_sa' => bool, 'nome_grupo' => string]
     */
    public function obterDadosGrupo($id_grupo)
    {
        try {
            $sql = "SELECT is_sa, nome_grupo FROM grupos WHERE id_grupo = :id_grupo AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_grupo', $id_grupo);
            $stmt->execute();

            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($resultado) {
                return [
                    'is_sa' => (bool) $resultado['is_sa'],
                    'nome_grupo' => $resultado['nome_grupo']
                ];
            }

            return ['is_sa' => false, 'nome_grupo' => null];
        } catch (PDOException $e) {
            error_log('Erro ao obter dados do grupo: ' . $e->getMessage());
            return ['is_sa' => false, 'nome_grupo' => null];
        }
    }

    /**
     * Obtém o array de IDs das empresas às quais o colaborador tem acesso.
     * Consulta a tabela de relacionamento colaboradores_empresas.
     * * @param int $id_colaborador
     * @return int[] Array de IDs das empresas
     */
    public function obterEmpresasAcesso($id_colaborador)
    {
        try {
            // Buscamos diretamente na tabela de relacionamento
            $sql = "SELECT DISTINCT id_empresa 
                    FROM colaboradores_empresas 
                    WHERE id_colaborador = :id_colaborador 
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_colaborador', $id_colaborador, PDO::PARAM_INT);
            $stmt->execute();

            // fetchAll(PDO::FETCH_COLUMN) retorna um array simples com os valores da coluna
            $empresas = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Garantimos que todos os retornos sejam inteiros
            return array_map('intval', $empresas);
        } catch (PDOException $e) {
            error_log('Erro ao obter empresas de acesso: ' . $e->getMessage());
            return [];
        }
    }
}
