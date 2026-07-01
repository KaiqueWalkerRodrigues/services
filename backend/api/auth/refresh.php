<?php
require("api/api.php");
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

$input = json_decode(file_get_contents("php://input"), true);
$oldRefreshToken = $_COOKIE['refresh_token'] ?? null;

$dadosUsuario = AuthHelper::validarRefreshToken($oldRefreshToken);

if (!$dadosUsuario || !$oldRefreshToken) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Sessão expirada."]);
    exit;
}

// Decide qual classe usar para renovar a sessão com base no tipo do token
$tipo = $dadosUsuario['tipo'] ?? null;
if (!$tipo) {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Tipo de usuário ausente no token."]);
    exit;
}

$resultado = null;
if ($tipo === 'colaborador') {
    $objSessao = new Colaborador();
    $resultado = $objSessao->renovarSessao($dadosUsuario['id'], $dadosUsuario['id_empresa'], $oldRefreshToken, 'web', $_SERVER['REMOTE_ADDR']);
} elseif ($tipo === 'cliente') {
    $objSessao = new Cliente();
    $resultado = $objSessao->renovarSessao($dadosUsuario['id'], $dadosUsuario['id_empresa'], $oldRefreshToken, 'web', $_SERVER['REMOTE_ADDR']);
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Tipo de usuário inválido: {$tipo}"]);
    exit;
}

if ($resultado['status'] === 'sucesso') {
    // 1. Gera um NOVO JWT (10 min) preservando os dados do payload anterior
    $secret = getenv('JWT_SECRET') ?: 'abc123';
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

    $payloadArr = is_array($dadosUsuario) ? $dadosUsuario : [];
    if ($tipo === 'colaborador' && empty($payloadArr['id_colaborador'])) {
        $payloadArr['id_colaborador'] = $dadosUsuario['id'];
    }
    if ($tipo === 'cliente' && empty($payloadArr['id_cliente'])) {
        $payloadArr['id_cliente'] = $dadosUsuario['id'];
    }
    unset($payloadArr['exp']);
    $payloadArr['exp'] = time() + (10 * 60);
    $payload = base64_encode(json_encode($payloadArr));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    $newJwt = "$header.$payload.$signature";

    // 2. Atualiza os Cookies no navegador do usuário
    setcookie("access_token", $newJwt, [
        'expires' => time() + (10 * 60),
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
