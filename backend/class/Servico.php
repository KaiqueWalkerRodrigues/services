<?php

require_once __DIR__ . '/Conexao.php';

class Servico
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function cadastrar($id_empresa, $nome, $descricao)
    {
        try {
            if (empty($id_empresa)) {
                http_response_code(400);
                return ['status' => 'erro', 'mensagem' => 'O ID da empresa é obrigatório.'];
            }

            $sql = "INSERT INTO servicos (id_empresa, nome, descricao, created_at, updated_at) 
                    VALUES (:id_empresa, :nome, :descricao, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':descricao', $descricao);
            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Serviço cadastrado com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao cadastrar serviço: ' . $e->getMessage()
            ];
        }
    }

    public function editar($id_servico, $nome, $descricao)
    {
        try {
            $sql = "UPDATE servicos 
                    SET nome = :nome, descricao = :descricao, updated_at = NOW() 
                    WHERE id_servico = :id_servico AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':descricao', $descricao);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Serviço atualizado com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Serviço não encontrado ou não houve alterações.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao atualizar serviço: ' . $e->getMessage()];
        }
    }

    public function deletar($id_servico)
    {
        try {
            $sql = "UPDATE servicos SET deleted_at = NOW() 
                    WHERE id_servico = :id_servico AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Serviço removido com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Serviço não encontrado ou já removido.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao deletar serviço: ' . $e->getMessage()];
        }
    }

    public function listar($id_empresa = null)
    {
        try {
            $sql = "SELECT s.*
                FROM servicos s
                WHERE s.deleted_at IS NULL";

            if (!empty($id_empresa)) {
                $sql .= " AND s.id_empresa = :id_empresa";
            }

            $stmt = $this->pdo->prepare($sql);

            if (!empty($id_empresa)) {
                $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
            }

            $stmt->execute();

            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'status' => 'sucesso',
                'total' => count($dados),
                'dados' => $dados
            ];
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao buscar serviços: ' . $e->getMessage()
            ];
        }
    }

    public function mostrar($id_servico)
    {
        try {
            $sql = "SELECT * FROM servicos 
                    WHERE id_servico = :id_servico AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                // Buscar filiais vinculadas a este serviço
                $sqlFiliais = "SELECT id_filial FROM servicos_filiais
                                WHERE id_servico = :id_servico AND deleted_at IS NULL";
                $stmtFiliais = $this->pdo->prepare($sqlFiliais);
                $stmtFiliais->bindParam(':id_servico', $id_servico);
                $stmtFiliais->execute();
                $filiaisVinculadas = $stmtFiliais->fetchAll(PDO::FETCH_COLUMN);

                $dados['filiais'] = $filiaisVinculadas;

                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Serviço não encontrado.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar serviço: ' . $e->getMessage()];
        }
    }

    public function adicionarFilial($id_servico, $id_filial)
    {
        try {
            $sqlCheck = "SELECT id_servico_filial FROM servicos_filiais 
                         WHERE id_servico = :id_servico AND id_filial = :id_filial
                         AND deleted_at IS NULL";
            $stmtCheck = $this->pdo->prepare($sqlCheck);
            $stmtCheck->bindParam(':id_servico', $id_servico);
            $stmtCheck->bindParam(':id_filial', $id_filial);
            $stmtCheck->execute();

            if ($stmtCheck->rowCount() > 0) {
                return ['status' => 'erro', 'mensagem' => 'Este serviço já está vinculado a esta filial.'];
            }

            $sqlReativar = "UPDATE servicos_filiais SET deleted_at = NULL
                            WHERE id_servico = :id_servico AND id_filial = :id_filial
                            AND deleted_at IS NOT NULL";
            $stmtReativar = $this->pdo->prepare($sqlReativar);
            $stmtReativar->bindParam(':id_servico', $id_servico);
            $stmtReativar->bindParam(':id_filial', $id_filial);
            $stmtReativar->execute();

            if ($stmtReativar->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Filial vinculada ao serviço com sucesso!'];
            }

            $sql = "INSERT INTO servicos_filiais (id_servico, id_filial, created_at, updated_at)
                    VALUES (:id_servico, :id_filial, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Filial vinculada ao serviço com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao vincular filial ao serviço: ' . $e->getMessage()];
        }
    }

    public function removerFilial($id_servico, $id_filial)
    {
        try {
            $sql = "UPDATE servicos_filiais SET deleted_at = NOW()
                    WHERE id_servico = :id_servico AND id_filial = :id_filial
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Vínculo da filial com o serviço removido com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Vínculo não encontrado entre o serviço e a filial.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao remover vínculo da filial: ' . $e->getMessage()];
        }
    }

    public function obterConfiguracaoFilial($id_servico, $id_filial)
    {
        try {
            $sql = "SELECT id_servico_filial, id_servico, id_filial, valor, ativo,
                           duracao, buffer_antes, buffer_depois, created_at
                    FROM servicos_filiais
                    WHERE id_servico = :id_servico AND id_filial = :id_filial
                      AND deleted_at IS NULL";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();

            return ['status' => 'sucesso', 'dados' => $stmt->fetch(PDO::FETCH_ASSOC) ?: null];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar configuração do serviço: ' . $e->getMessage()];
        }
    }

    public function salvarConfiguracaoFilial($id_servico, $id_filial, $valor, $ativo, $duracao, $buffer_antes, $buffer_depois)
    {
        try {
            $this->pdo->beginTransaction();

            $sql = "SELECT id_servico_filial FROM servicos_filiais
                    WHERE id_servico = :id_servico AND id_filial = :id_filial
                    ORDER BY deleted_at IS NULL DESC, id_servico_filial DESC LIMIT 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_servico', $id_servico);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();
            $vinculo = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($vinculo) {
                $sql = "UPDATE servicos_filiais
                        SET valor = :valor, ativo = :ativo, duracao = :duracao,
                            buffer_antes = :buffer_antes, buffer_depois = :buffer_depois, updated_at = NOW(),
                            deleted_at = NULL
                        WHERE id_servico_filial = :id_servico_filial";
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindValue(':id_servico_filial', $vinculo['id_servico_filial'], PDO::PARAM_INT);
            } else {
                $sql = "INSERT INTO servicos_filiais
                            (id_servico, id_filial, valor, ativo, duracao, buffer_antes, buffer_depois, created_at, updated_at)
                        VALUES (:id_servico, :id_filial, :valor, :ativo, :duracao,
                                :buffer_antes, :buffer_depois, NOW(), NOW())";
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindValue(':id_servico', $id_servico, PDO::PARAM_INT);
                $stmt->bindValue(':id_filial', $id_filial, PDO::PARAM_INT);
            }

            $stmt->bindValue(':valor', $valor);
            $stmt->bindValue(':ativo', $ativo ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':duracao', $duracao);
            $stmt->bindValue(':buffer_antes', $buffer_antes, PDO::PARAM_INT);
            $stmt->bindValue(':buffer_depois', $buffer_depois, PDO::PARAM_INT);
            $stmt->execute();
            $this->pdo->commit();

            return ['status' => 'sucesso', 'mensagem' => 'Configuração salva com sucesso!'];
        } catch (PDOException $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao salvar configuração do serviço: ' . $e->getMessage()];
        }
    }
}
