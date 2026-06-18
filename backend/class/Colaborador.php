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

    public function cadastrar($id_empresa, $id_grupo, $nome, $login, $senha)
    {
        try {
            $sql = "INSERT INTO colaboradores (id_empresa, id_grupo, nome, login, senha, created_at, updated_at) 
                    VALUES (:id_empresa, :id_grupo, :nome, :login, :senha, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);

            // Hash seguro para a senha
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':id_grupo', $id_grupo);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':login', $login);
            $stmt->bindParam(':senha', $senhaHash);

            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Colaborador cadastrado com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao cadastrar colaborador: ' . $e->getMessage()
            ];
        }
    }

    public function editar($id_colaborador, $id_empresa, $id_grupo, $nome, $login, $senha = null)
    {
        try {
            if ($senha) {
                $sql = "UPDATE colaboradores 
                        SET id_empresa = :id_empresa, id_grupo = :id_grupo, nome = :nome, login = :login, senha = :senha, updated_at = NOW() 
                        WHERE id_colaborador = :id_colaborador AND deleted_at IS NULL";
            } else {
                $sql = "UPDATE colaboradores 
                        SET id_empresa = :id_empresa, id_grupo = :id_grupo, nome = :nome, login = :login, updated_at = NOW() 
                        WHERE id_colaborador = :id_colaborador AND deleted_at IS NULL";
            }

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':id_grupo', $id_grupo);
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
            // Soft Delete
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
            $sql = "SELECT id_colaborador, id_empresa, id_grupo, nome, login, created_at, updated_at 
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
            $sql = "SELECT id_colaborador, id_empresa, id_grupo, nome, login, created_at, updated_at 
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

    public function login($login, $senha, $origem, $ip_address = null)
    {
        try {
            // 1. Busca o colaborador pelo login
            $sql = "SELECT id_colaborador, id_empresa, id_grupo, login, senha 
                    FROM colaboradores 
                    WHERE login = :login AND deleted_at IS NULL LIMIT 1";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':login', $login);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            // 2. Valida se o usuário existe e se a senha está correta
            if ($usuario && password_verify($senha, $usuario['senha'])) {

                // 3. Gera um Refresh Token seguro (64 caracteres)
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
                $sqlToken = "INSERT INTO acessos_tokens (id_colaborador, refresh_token, origem, ip_address, expires_at, created_at) 
                             VALUES (:id_colaborador, :refresh_token, :origem, :ip_address, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())";

                $stmtToken = $this->pdo->prepare($sqlToken);
                $stmtToken->bindParam(':id_colaborador', $usuario['id_colaborador']);
                $stmtToken->bindParam(':refresh_token', $refreshToken);
                $stmtToken->bindParam(':origem', $origem);
                $stmtToken->bindParam(':ip_address', $ip_address);
                $stmtToken->execute();

                // 6. Remove a senha do array antes de retornar para não expor dados sensíveis
                unset($usuario['senha']);

                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Login aprovado.',
                    'dados_usuario' => $usuario,
                    'refresh_token' => $refreshToken
                ];
            } else {
                return [
                    'status' => 'erro',
                    'mensagem' => 'Login ou senha incorretos.'
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'status' => 'erro',
                'mensagem' => 'Erro interno ao realizar login: ' . $e->getMessage()
            ];
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

    public function renovarSessao($idColaborador, $oldRefreshToken, $origem, $ip_address)
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

            $sqlInsert = "INSERT INTO acessos_tokens (id_colaborador, refresh_token, origem, ip_address, expires_at, created_at) 
                          VALUES (:id, :token, :origem, :ip, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())";

            $stmtInsert = $this->pdo->prepare($sqlInsert);
            $stmtInsert->execute([
                ':id' => $idColaborador,
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
}
