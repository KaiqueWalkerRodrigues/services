<?php

// Inclui o arquivo da sua classe de conexão
require_once __DIR__ . '/Conexao.php';

class Empresas
{
    private $pdo;

    public function __construct()
    {
        // Instancia a conexão PDO assim que a classe Empresas é criada
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function listar()
    {
        try {
            // Cria a query SQL (ajuste o nome da tabela conforme o seu banco)
            $sql = "SELECT * FROM empresas";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Verifica se encontrou registros e monta o array de retorno
            if ($dados) {
                return [
                    'status' => 'sucesso',
                    'total'  => count($dados),
                    'dados'  => $dados
                ];
            } else {
                return [
                    'status' => 'sucesso',
                    'total'  => 0,
                    'dados'  => [],
                    'mensagem' => 'Nenhuma empresa encontrada.'
                ];
            }
        } catch (PDOException $e) {
            // Em caso de erro, altera o status HTTP e retorna a mensagem
            http_response_code(500);
            return [
                'status'   => 'erro',
                'mensagem' => 'Erro ao buscar as empresas: ' . $e->getMessage()
            ];
        }
    }
}
