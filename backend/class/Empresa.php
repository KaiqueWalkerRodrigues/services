<?php

require_once __DIR__ . '/Conexao.php';

class Empresa
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function cadastrar($codigo_empresa, $nome)
    {
        try {
            $sql = "INSERT INTO empresas (codigo_empresa, nome, created_at, updated_at) 
                    VALUES (:codigo_empresa, :nome, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':codigo_empresa', $codigo_empresa);
            $stmt->bindParam(':nome', $nome);
            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Empresa cadastrada com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao cadastrar empresa: ' . $e->getMessage()
            ];
        }
    }

    public function editar($id_empresa, $codigo_empresa, $nome)
    {
        try {
            $sql = "UPDATE empresas 
                    SET codigo_empresa = :codigo_empresa, nome = :nome, updated_at = NOW() 
                    WHERE id_empresa = :id_empresa AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':codigo_empresa', $codigo_empresa);
            $stmt->bindParam(':nome', $nome);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Empresa atualizada com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Empresa não encontrada ou não houve alterações.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao atualizar empresa: ' . $e->getMessage()];
        }
    }

    public function deletar($id_empresa)
    {
        try {
            // Soft Delete
            $sql = "UPDATE empresas SET deleted_at = NOW() 
                    WHERE id_empresa = :id_empresa AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Empresa removida com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Empresa não encontrada ou já removida.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao deletar empresa: ' . $e->getMessage()];
        }
    }

    public function listar()
    {
        try {
            $sql = "SELECT * FROM empresas WHERE deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ['status' => 'sucesso', 'total' => count($dados), 'dados' => $dados];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar empresas: ' . $e->getMessage()];
        }
    }

    public function mostrar($id_empresa)
    {
        try {
            $sql = "SELECT * FROM empresas 
                    WHERE id_empresa = :id_empresa AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Empresa não encontrada.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar empresa: ' . $e->getMessage()];
        }
    }
}
