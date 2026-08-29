<?php

require_once __DIR__ . '/Conexao.php';

class ParametrosFilial
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function mostrar($id_filial)
    {
        try {
            if (empty($id_filial)) {
                http_response_code(400);
                return ['status' => 'erro', 'mensagem' => 'O ID da filial é obrigatório para buscar os parâmetros.'];
            }

            $sql = "SELECT id_parametro_filial, id_filial, tempo_agendamento, tempo_intervalo, created_at, updated_at 
                    FROM parametros_filiais 
                    WHERE id_filial = :id_filial AND deleted_at IS NULL 
                    LIMIT 1";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_filial', $id_filial);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'sucesso', 'dados' => [
                    'id_filial' => $id_filial,
                    'tempo_agendamento' => '',
                    'tempo_intervalo' => ''
                ]];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar parâmetros: ' . $e->getMessage()];
        }
    }

    public function Salvar($id_filial, $tempo_agendamento, $tempo_intervalo)
    {
        try {
            if (empty($id_filial)) {
                http_response_code(400);
                return ['status' => 'erro', 'mensagem' => 'O ID da filial é obrigatório.'];
            }

            $sqlCheck = "SELECT id_parametro_filial FROM parametros_filiais WHERE id_filial = :id_filial AND deleted_at IS NULL LIMIT 1";
            $stmtCheck = $this->pdo->prepare($sqlCheck);
            $stmtCheck->bindParam(':id_filial', $id_filial);
            $stmtCheck->execute();
            $existe = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($existe) {
                $sql = "UPDATE parametros_filiais 
                        SET tempo_agendamento = :tempo_agendamento, 
                            tempo_intervalo = :tempo_intervalo, 
                            updated_at = NOW() 
                        WHERE id_filial = :id_filial AND deleted_at IS NULL";

                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':tempo_agendamento', $tempo_agendamento);
                $stmt->bindParam(':tempo_intervalo', $tempo_intervalo);
                $stmt->bindParam(':id_filial', $id_filial);
                $stmt->execute();

                return ['status' => 'sucesso', 'mensagem' => 'Parâmetros atualizados com sucesso!'];
            } else {
                $sql = "INSERT INTO parametros_filiais (id_filial, tempo_agendamento, tempo_intervalo, created_at, updated_at) 
                        VALUES (:id_filial, :tempo_agendamento, :tempo_intervalo, NOW(), NOW())";

                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':id_filial', $id_filial);
                $stmt->bindParam(':tempo_agendamento', $tempo_agendamento);
                $stmt->bindParam(':tempo_intervalo', $tempo_intervalo);
                $stmt->execute();

                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Parâmetros cadastrados com sucesso!',
                    'id' => $this->pdo->lastInsertId()
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao salvar parâmetros: ' . $e->getMessage()];
        }
    }
}
