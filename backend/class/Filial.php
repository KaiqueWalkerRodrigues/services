<?php

require_once __DIR__ . '/Conexao.php';

class Filial
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function cadastrar($id_empresa, $nome, $endereco, $bairro, $cidade, $uf)
    {
        try {
            $sql = "INSERT INTO filiais (id_empresa, nome, endereco, bairro, cidade, uf, created_at, updated_at) 
                    VALUES (:id_empresa, :nome, :endereco, :bairro, :cidade, :uf, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':endereco', $endereco);
            $stmt->bindParam(':bairro', $bairro);
            $stmt->bindParam(':cidade', $cidade);
            $stmt->bindParam(':uf', $uf);
            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Filial cadastrada com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao cadastrar filial: ' . $e->getMessage()
            ];
        }
    }

    public function editar($id_filial, $nome, $endereco, $bairro, $cidade, $uf)
    {
        try {
            $sql = "UPDATE filiais 
                    SET nome = :nome, endereco = :endereco, bairro = :bairro, cidade = :cidade, uf = :uf, updated_at = NOW() 
                    WHERE id_filial = :id_filial AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':endereco', $endereco);
            $stmt->bindParam(':bairro', $bairro);
            $stmt->bindParam(':cidade', $cidade);
            $stmt->bindParam(':uf', $uf);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Filial atualizada com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Filial não encontrada ou não houve alterações.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao atualizar filial: ' . $e->getMessage()];
        }
    }

    public function deletar($id_filial)
    {
        try {
            $sql = "UPDATE filiais SET deleted_at = NOW() 
                    WHERE id_filial = :id_filial AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Filial removida com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Filial não encontrada ou já removida.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao deletar filial: ' . $e->getMessage()];
        }
    }

    public function listar($id_empresa)
    {
        try {
            if (empty($id_empresa)) {
                http_response_code(400);
                return ['status' => 'erro', 'mensagem' => 'O ID da empresa é obrigatório para listar as filiais.'];
            }

            $sql = "SELECT * FROM filiais WHERE id_empresa = :id_empresa AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->execute();
            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ['status' => 'sucesso', 'total' => count($dados), 'dados' => $dados];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar filiais: ' . $e->getMessage()];
        }
    }

    public function mostrar($id_filial)
    {
        try {
            $sql = "SELECT * FROM filiais 
                    WHERE id_filial = :id_filial AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Filial não encontrada.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar filial: ' . $e->getMessage()];
        }
    }
}
