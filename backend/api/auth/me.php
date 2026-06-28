<?php
require("api/api.php");

header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

$token = $_COOKIE['access_token'] ?? null;

if (!$token) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Não autenticado"]);
    exit;
}

// Valida o JWT
$partes = explode('.', $token);
if (count($partes) !== 3) {
    http_response_code(401);
    echo json_encode(["sucesso" => false]);
    exit;
}

$payload = json_decode(base64_decode($partes[1]), true);
$secret  = getenv('JWT_SECRET') ?: 'abc123';

$assinatura_esperada = base64_encode(
    hash_hmac('sha256', "{$partes[0]}.{$partes[1]}", $secret, true)
);

if ($assinatura_esperada !== $partes[2]) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Token inválido"]);
    exit;
}

if ($payload['exp'] < time()) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Token expirado"]);
    exit;
}

// Busca dados atualizados do colaborador
$colaborador = new Colaborador();
$resultado = $colaborador->mostrar($payload['id_colaborador']);

if ($resultado['status'] === 'sucesso') {
    $usuario = $resultado['dados'];

    http_response_code(200);
    echo json_encode([
        "sucesso" => true,
        "dados" => [
            "id_colaborador" => $usuario['id_colaborador'],
            "nome"           => $usuario['nome']
        ]
    ]);
} else {
    http_response_code(404);
    echo json_encode(["sucesso" => false, "mensagem" => $resultado['mensagem']]);
}
