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
                $sqlFiliais = "SELECT id_filial FROM servicos_filiais WHERE id_servico = :id_servico";
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
                         WHERE id_servico = :id_servico AND id_filial = :id_filial";
            $stmtCheck = $this->pdo->prepare($sqlCheck);
            $stmtCheck->bindParam(':id_servico', $id_servico);
            $stmtCheck->bindParam(':id_filial', $id_filial);
            $stmtCheck->execute();

            if ($stmtCheck->rowCount() > 0) {
                return ['status' => 'erro', 'mensagem' => 'Este serviço já está vinculado a esta filial.'];
            }

            $sql = "INSERT INTO servicos_filiais (id_servico, id_filial, created_at) 
                    VALUES (:id_servico, :id_filial, NOW())";

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
            $sql = "DELETE FROM servicos_filiais 
                    WHERE id_servico = :id_servico AND id_filial = :id_filial";

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
}
