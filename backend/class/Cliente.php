<?php

require_once __DIR__ . '/Conexao.php';

class Cliente
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::conexao();

        if (!$this->pdo) {
            throw new RuntimeException('Falha ao conectar ao banco de dados.');
        }
    }

    public function cadastrar($nome, $email, $senha, $celular = null)
    {
        try {
            $sql = "INSERT INTO clientes (nome, email, senha, celular, created_at, updated_at) 
                    VALUES (:nome, :email, :senha, :celular, NOW(), NOW())";

            $stmt = $this->pdo->prepare($sql);
            
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':senha', $senhaHash);
            $stmt->bindParam(':celular', $celular);

            $stmt->execute();

            return [
                'status' => 'sucesso',
                'mensagem' => 'Cliente cadastrado com sucesso!',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao cadastrar cliente: ' . $e->getMessage()];
        }
    }

    public function editar($id_cliente, $nome, $email, $celular = null, $senha = null)
    {
        try {
            if ($senha) {
                $sql = "UPDATE clientes 
                        SET nome = :nome, email = :email, celular = :celular, senha = :senha, updated_at = NOW() 
                        WHERE id_cliente = :id_cliente AND deleted_at IS NULL";
            } else {
                $sql = "UPDATE clientes 
                        SET nome = :nome, email = :email, celular = :celular, updated_at = NOW() 
                        WHERE id_cliente = :id_cliente AND deleted_at IS NULL";
            }

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':celular', $celular);
            $stmt->bindParam(':id_cliente', $id_cliente);

            if ($senha) {
                $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
                $stmt->bindParam(':senha', $senhaHash);
            }

            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Cliente atualizado com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Cliente não encontrado ou não houve alterações.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao atualizar cliente: ' . $e->getMessage()];
        }
    }

    public function deletar($id_cliente)
    {
        try {
            // Soft Delete
            $sql = "UPDATE clientes SET deleted_at = NOW() WHERE id_cliente = :id_cliente AND deleted_at IS NULL";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_cliente', $id_cliente);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['status' => 'sucesso', 'mensagem' => 'Cliente removido com sucesso!'];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Cliente não encontrado ou já removido.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao deletar cliente: ' . $e->getMessage()];
        }
    }

    public function listar()
    {
        try {
            $sql = "SELECT id_cliente, nome, email, celular, created_at, updated_at 
                    FROM clientes WHERE deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'total' => count($dados), 'dados' => $dados];
            } else {
                return ['status' => 'sucesso', 'total' => 0, 'dados' => [], 'mensagem' => 'Nenhum cliente encontrado.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar os clientes: ' . $e->getMessage()];
        }
    }

    public function mostrar($id_cliente)
    {
        try {
            $sql = "SELECT id_cliente, nome, email, celular, created_at, updated_at 
                    FROM clientes 
                    WHERE id_cliente = :id_cliente AND deleted_at IS NULL";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id_cliente', $id_cliente);
            $stmt->execute();
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($dados) {
                return ['status' => 'sucesso', 'dados' => $dados];
            } else {
                return ['status' => 'erro', 'mensagem' => 'Cliente não encontrado.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro ao buscar cliente: ' . $e->getMessage()];
        }
    }

    public function login($email, $senha, $origem, $ip_address = null)
    {
        try {
            $sql = "SELECT id_cliente, nome, email, senha, celular 
                    FROM clientes 
                    WHERE email = :email AND deleted_at IS NULL LIMIT 1";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($senha, $usuario['senha'])) {
                
                $refreshToken = bin2hex(random_bytes(32));
                
                // Inserindo na tabela vinculando ao id_cliente
                $sqlToken = "INSERT INTO acessos_tokens (id_cliente, refresh_token, origem, ip_address, expires_at, created_at) 
                             VALUES (:id_cliente, :refresh_token, :origem, :ip_address, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())";
                
                $stmtToken = $this->pdo->prepare($sqlToken);
                $stmtToken->bindParam(':id_cliente', $usuario['id_cliente']);
                $stmtToken->bindParam(':refresh_token', $refreshToken);
                $stmtToken->bindParam(':origem', $origem);
                $stmtToken->bindParam(':ip_address', $ip_address);
                $stmtToken->execute();

                unset($usuario['senha']);

                return [
                    'status' => 'sucesso',
                    'mensagem' => 'Login aprovado.',
                    'dados_usuario' => $usuario,
                    'refresh_token' => $refreshToken
                ];
            } else {
                return ['status' => 'erro', 'mensagem' => 'E-mail ou senha incorretos.'];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ['status' => 'erro', 'mensagem' => 'Erro interno ao realizar login: ' . $e->getMessage()];
        }
    }
}