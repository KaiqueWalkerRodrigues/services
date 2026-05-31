<?php

/**
 * Conexão com o banco de dados
 */
// definir o fuso horário do php para São Paulo
date_default_timezone_set('America/Sao_Paulo');
class Conexao
{
    # Variável que guarda a conexão PDO.
    protected static $db;
    private const MAX_CONNECT_ATTEMPTS = 5;
    private const CONNECT_RETRY_SECONDS = 2;

    private static function connect()
    {
        # Informações sobre o banco de dados:
        $db_host    = getenv('DB_HOST') ?: getenv('MYSQL_HOST') ?: 'mysql';
        $db_nome    = getenv('DB_DATABASE') ?: getenv('MYSQL_DATABASE') ?: 'barb';
        $db_usuario = getenv('DB_USERNAME') ?: getenv('MYSQL_USER') ?: 'service-user';
        $db_senha   = getenv('DB_PASSWORD') ?: getenv('MYSQL_PASSWORD') ?: 'password';
        $db_driver  = getenv('DB_DRIVER') ?: 'mysql';
        $db_porta   = getenv('DB_PORT') ?: getenv('MYSQL_PORT') ?: '3306';

        $attempt = 0;
        do {
            try {
                # Atribui o objeto PDO à variável $db.
                self::$db = new PDO(
                    "$db_driver:host=$db_host;port=$db_porta;dbname=$db_nome;charset=utf8mb4",
                    $db_usuario,
                    $db_senha,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
                return;
            } catch (PDOException $e) {
                $attempt++;
                if ($attempt >= self::MAX_CONNECT_ATTEMPTS) {
                    throw new PDOException('Falha na conexão: ' . $e->getMessage(), (int)$e->getCode(), $e);
                }
                sleep(self::CONNECT_RETRY_SECONDS);
            }
        } while ($attempt < self::MAX_CONNECT_ATTEMPTS);
    }

    # Método estático - acessível sem instanciação.
    # Conexao::conexao();
    public static function conexao()
    {
        # Garante uma única instância. Se não existe uma conexão, criamos uma nova.
        if (!self::$db) {
            self::connect();
        }
        # Retorna a conexão.
        return self::$db;
    }
}
