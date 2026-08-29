<?php

require_once __DIR__ . '/Conexao.php';

class ParametrosEmpresa
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function mostrar($id_empresa)
    {
        try {
            if (empty($id_empresa)) {
                http_response_code(400);
                return ['status' => 'erro', 'mensagem' => 'O ID da empresa é obrigatório para buscar os parâmetros.'];
            }

            $sql = "SELECT id_parametro_empresa, id_empresa, tempo_agendamento, tempo_intervalo, created_at, updated_at 
                    FROM parametros_empresas 
                    WHERE id_empresa = :id_empresa AND deleted_at IS NULL 
                    LIMIT 1";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'sucesso', 'dados' => [
                    'id_empresa' => $id_empresa,
                    'tempo_agendamento' => '',
                    'tempo_intervalo' => ''
                ]];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar parâmetros: ' . $e->getMessage()];
        }
    }

    public function Salvar($id_empresa, $tempo_agendamento, $tempo_intervalo)
    {
        try {
            if (empty($id_empresa)) {
                http_response_code(400);
                return ['status' => 'erro', 'mensagem' => 'O ID da empresa é obrigatório.'];
            }

            $sqlCheck = "SELECT id_parametro_empresa FROM parametros_empresas WHERE id_empresa = :id_empresa AND deleted_at IS NULL LIMIT 1";
            $stmtCheck = $this->pdo->prepare($sqlCheck);
            $stmtCheck->bindParam(':id_empresa', $id_empresa);
            $stmtCheck->execute();
            $existe = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($existe) {
                $sql = "UPDATE parametros_empresas 
                        SET tempo_agendamento = :tempo_agendamento, 
                            tempo_intervalo = :tempo_intervalo, 
                            updated_at = NOW() 
                        WHERE id_empresa = :id_empresa AND deleted_at IS NULL";

                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':tempo_agendamento', $tempo_agendamento);
                $stmt->bindParam(':tempo_intervalo', $tempo_intervalo);
                $stmt->bindParam(':id_empresa', $id_empresa);
                $stmt->execute();

                return ['status' => 'sucesso', 'mensagem' => 'Parâmetros atualizados com sucesso!'];
            } else {
                $sql = "INSERT INTO parametros_empresas (id_empresa, tempo_agendamento, tempo_intervalo, created_at, updated_at) 
                        VALUES (:id_empresa, :tempo_agendamento, :tempo_intervalo, NOW(), NOW())";

                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':id_empresa', $id_empresa);
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
