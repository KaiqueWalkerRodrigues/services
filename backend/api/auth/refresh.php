<?php
// CORS headers for refresh endpoint
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if ($origin && $origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'class/classes.php';

$input = json_decode(file_get_contents("php://input"), true);
$oldRefreshToken = $input['refresh_token'] ?? $_COOKIE['refresh_token'] ?? null;
$tokenJwt = $input['access_token'] ?? $_COOKIE['access_token'] ?? null;

$dadosUsuario = AuthHelper::validarTokenSemExp($tokenJwt);

if (!$dadosUsuario || !$oldRefreshToken) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Sessão expirada."]);
    exit;
}

$colaborador = new Colaborador();
$resultado = $colaborador->renovarSessao($dadosUsuario['sub'], $oldRefreshToken, 'web', $_SERVER['REMOTE_ADDR']);

if ($resultado['status'] === 'sucesso') {
    // 1. Gera um NOVO JWT (15 min)
    $secret = getenv('JWT_SECRET') ?: 'abc123';
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'sub' => $dadosUsuario['sub'],
        'tipo' => 'colaborador',
        'id_empresa' => $dadosUsuario['id_empresa'],
        'exp' => time() + (15 * 60)
    ]));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    $newJwt = "$header.$payload.$signature";

    // 2. Atualiza os Cookies no navegador do usuário
    setcookie("access_token", $newJwt, [
        'expires' => time() + (15 * 60),
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    setcookie("refresh_token", $resultado['refresh_token'], [
        'expires' => time() + (30 * 24 * 60 * 60),
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    echo json_encode(["sucesso" => true, "mensagem" => "Tokens renovados."]);
} else {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => $resultado['mensagem']]);
}
