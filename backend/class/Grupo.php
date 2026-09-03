<?php

require_once __DIR__ . '/Conexao.php';

class Grupo
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function cadastrar($id_empresa, $nome, $prestador = false)
    {
        try {
            $sql = "INSERT INTO grupos
                    (id_empresa, nome, prestador, created_at, updated_at)
                    VALUES (:id_empresa, :nome, :prestador, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_empresa', $id_empresa);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindValue(':prestador', $prestador ? 1 : 0, PDO::PARAM_INT);

            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Grupo cadastrado com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao cadastrar grupo: ' . $e->getMessage()
            ];
        }
    }

    public function editar($id_grupo, $nome, $prestador = false)
    {
        try {
            $sql = "UPDATE grupos 
                    SET nome = :nome,
                        prestador = :prestador,
                        updated_at = NOW() 
                    WHERE id_grupo = :id_grupo 
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_grupo', $id_grupo);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindValue(':prestador', $prestador ? 1 : 0, PDO::PARAM_INT);

            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Grupo atualizado com sucesso!'
                ];
            } else {
                return [
                    'status' => 'erro',
                    'mensagem' => 'Grupo não encontrado ou não houve alterações.'
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao atualizar grupo: ' . $e->getMessage()
            ];
        }
    }

    public function deletar($id_grupo)
    {
        try {
            $sql = "UPDATE grupos 
                    SET deleted_at = NOW() 
                    WHERE id_grupo = :id_grupo 
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_grupo', $id_grupo);

            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Grupo removido com sucesso!'
                ];
            } else {
                return [
                    'status' => 'erro',
                    'mensagem' => 'Grupo não encontrado ou já removido.'
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao deletar grupo: ' . $e->getMessage()
            ];
        }
    }

    public function listar($id_empresa)
    {
        try {
            if (empty($id_empresa)) {
                http_response_code(400);

                return [
                    'status' => 'erro',
                    'mensagem' => 'O ID da empresa é obrigatório para listar os grupos.'
                ];
            }

            $sql = "SELECT * 
                    FROM grupos 
                    WHERE id_empresa = :id_empresa 
                    AND deleted_at IS NULL
                    ORDER BY nome ASC";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_empresa', $id_empresa);

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
                'mensagem' => 'Erro ao buscar grupos: ' . $e->getMessage()
            ];
        }
    }

    public function mostrar($id_grupo)
    {
        try {
            $sql = "SELECT * 
                    FROM grupos 
                    WHERE id_grupo = :id_grupo 
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':id_grupo', $id_grupo);

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
                    'mensagem' => 'Grupo não encontrado.'
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao buscar grupo: ' . $e->getMessage()
            ];
        }
    }

    public function adicionarPermissao($id_grupo, $id_permissao)
    {
        try {
            // Verifica se a permissão já está vinculada e ativa para o grupo
            $sqlVerifica = "SELECT id_grupo_permissao 
                            FROM grupo_permissoes 
                            WHERE id_grupo = :id_grupo 
                            AND id_permissao = :id_permissao 
                            AND deleted_at IS NULL";

            $stmtVerifica = $this->pdo->prepare($sqlVerifica);
            $stmtVerifica->bindParam(':id_grupo', $id_grupo);
            $stmtVerifica->bindParam(':id_permissao', $id_permissao);
            $stmtVerifica->execute();

            if ($stmtVerifica->rowCount() > 0) {
                return [
                    'status' => 'erro',
                    'mensagem' => 'Esta permissão já está vinculada a este grupo.'
                ];
            }

            // Insere o vínculo
            $sql = "INSERT INTO grupo_permissoes 
                    (id_grupo, id_permissao, created_at) 
                    VALUES (:id_grupo, :id_permissao, NOW())";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_grupo', $id_grupo);
            $stmt->bindParam(':id_permissao', $id_permissao);
            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Permissão adicionada ao grupo com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao adicionar permissão ao grupo: ' . $e->getMessage()
            ];
        }
    }

    public function removerPermissao($id_grupo, $id_permissao)
    {
        try {
            // Soft delete na tabela de relacionamento
            $sql = "UPDATE grupo_permissoes 
                    SET deleted_at = NOW() 
                    WHERE id_grupo = :id_grupo 
                    AND id_permissao = :id_permissao 
                    AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_grupo', $id_grupo);
            $stmt->bindParam(':id_permissao', $id_permissao);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Permissão removida do grupo com sucesso!'
                ];
            } else {
                return [
                    'status' => 'erro',
                    'mensagem' => 'Vínculo de permissão não encontrado ou já removido.'
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);

            return [
                'status' => 'erro',
                'mensagem' => 'Erro ao remover permissão do grupo: ' . $e->getMessage()
            ];
        }
    }

    public function listarPermissoes($id_grupo)
    {
        try {
            if (empty($id_grupo)) {
                http_response_code(400);

                return [
                    'status' => 'erro',
                    'mensagem' => 'O ID do grupo é obrigatório para listar as permissões.'
                ];
            }

            $sql = "SELECT p.*, gp.id_grupo_permissao, gp.created_at as vinculado_em 
                    FROM grupo_permissoes gp
                    INNER JOIN permissoes p ON gp.id_permissao = p.id_permissao
                    WHERE gp.id_grupo = :id_grupo 
                    AND gp.deleted_at IS NULL
                    AND p.deleted_at IS NULL
                    ORDER BY p.slug ASC";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_grupo', $id_grupo);
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
                'mensagem' => 'Erro ao buscar permissões do grupo: ' . $e->getMessage()
            ];
        }
    }
}
