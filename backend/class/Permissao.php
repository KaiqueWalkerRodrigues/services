<?php

require_once __DIR__ . '/Conexao.php';

class Permissao
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function listar()
    {
        try {
            $sql = "SELECT * 
                    FROM permissoes 
                    WHERE deleted_at IS NULL 
                    ORDER BY slug ASC";

            $stmt = $this->pdo->prepare($sql);
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
                'mensagem' => 'Erro ao buscar permissões: ' . $e->getMessage()
            ];
        }
    }

    public function mostrar($id_permissao)
    {
        try {
            $sql = "SELECT * 
                    FROM permisss 
                    WHERE id_permissao = :id_permissao 
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_permissao', $id_permissao);
            $stmt->execute();

            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return [
                    'status' => 'sucesso',
                    'dados' => $dados
                ];
            } else {
                return [
                    'status' => 'erro',
                    'mensagem' => 'Permissão não encontrada.'
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao buscar permissão: ' . $e->getMessage()
            ];
        }
    }
}
