<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

require_once 'class/classes.php';

// Lida com pre-flight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Pega o token do header ou cookie
$headers = getallheaders();
$tokenJwt = $headers['Authorization'] ?? $_COOKIE['access_token'] ?? null;
$tokenJwt = str_replace('Bearer ', '', $tokenJwt);

// 2. Valida o token para saber quem é o usuário
$dadosUsuario = AuthHelper::validarToken($tokenJwt);

if (!$dadosUsuario) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Token inválido ou já expirado."]);
    exit;
}

// 3. Pega o refresh_token enviado no corpo da requisição (necessário para deletar do banco)
$input = json_decode(file_get_contents("php://input"), true);
$refreshToken = $input['refresh_token'] ?? null;

if (!$refreshToken) {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Refresh token não fornecido."]);
    exit;
}

// 4. Executa o logout na classe Colaborador
$colaborador = new Colaborador();
$sucesso = $colaborador->logout($dadosUsuario['sub'], $refreshToken);

// 5. Remove o cookie do lado do servidor (se for web)
if (isset($_COOKIE['access_token'])) {
    setcookie("access_token", "", time() - 3600, "/");
}

if ($sucesso) {
    echo json_encode(["sucesso" => true, "mensagem" => "Logout realizado com sucesso."]);
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao processar logout."]);
}
