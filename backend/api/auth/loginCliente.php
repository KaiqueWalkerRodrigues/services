<?php
require("api/api.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Lida com pre-flight requests do CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->email) && !empty($dados->senha)) {

    $origem = $dados->origem ?? 'web';
    $ip_address = $_SERVER['REMOTE_ADDR'];

    $cliente = new Cliente();
    $resultadoLogin = $cliente->login($dados->email, $dados->senha, $origem, $ip_address);

    if ($resultadoLogin['status'] === 'sucesso') {
        $usuario = $resultadoLogin['dados_usuario'];

        // --- GERAÇÃO DO JWT ---
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'sub' => $usuario['id_cliente'],
            'tipo' => 'cliente',
            'exp' => time() + (10 * 60)
        ]));

        $secret = getenv('JWT_SECRET') ?: 'abc123';
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        $token_jwt = "$header.$payload.$signature";

        // --- TRATATIVA PARA WEB (COOKIE) ---
        // Se for web, salvamos o JWT em um cookie seguro
        if ($origem === 'web') {
            // Cookie para o Access Token (10 minutos)
            setcookie("access_token", $token_jwt, [
                'expires' => time() + (10 * 60),
                'path' => '/',
                'secure' => false, // Mude para true se estiver usando HTTPS
                'httponly' => true,
                'samesite' => 'Strict'
            ]);

            // ADICIONE ESTA PARTE PARA O REFRESH TOKEN (30 dias)
            setcookie("refresh_token", $resultadoLogin['refresh_token'], [
                'expires' => time() + (30 * 24 * 60 * 60), // 30 dias
                'path' => '/',
                'secure' => false, // Mude para true se estiver usando HTTPS
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
        }

        http_response_code(200);
        echo json_encode([
            "sucesso" => true,
            // Mobile: lerá daqui. Web: lerá do Cookie.
            "access_token" => ($origem === 'mobile') ? $token_jwt : null,
            "refresh_token" => $resultadoLogin['refresh_token'],
            "usuario" => $usuario
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["sucesso" => false, "mensagem" => $resultadoLogin['mensagem']]);
    }
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}
