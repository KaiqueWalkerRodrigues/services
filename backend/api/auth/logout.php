<?php
require("api/api.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Lida com pre-flight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Pega o token do header ou cookie
$headers = getallheaders();
$tokenJwt = $headers['Authorization'] ?? $_COOKIE['access_token'] ?? null;
$tokenJwt = str_replace('Bearer ', '', $tokenJwt);

// 2. Valida o token (ignora expiração para poder identificar o usuário ao deslogar)
$dadosUsuario = AuthHelper::validarTokenSemExp($tokenJwt);

if (!$dadosUsuario) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Token inválido."]);
    exit;
}

// 3. Pega o refresh_token enviado no corpo da requisição (necessário para deletar do banco)
$refreshToken = $_COOKIE['refresh_token'] ?? null;

// Se não houver cookie, tente buscar do corpo (para garantir compatibilidade)
if (!$refreshToken) {
    $input = json_decode(file_get_contents("php://input"), true);
    $refreshToken = $input['refresh_token'] ?? null;
}

if (!$refreshToken) {
    // Opcional: Se quiser permitir logout mesmo sem refresh token, 
    // apenas limpe os cookies e responda sucesso.
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Token de atualização não encontrado."]);
    exit;
}

// 4. Executa o logout na classe correta conforme o tipo do usuário
$tipo = $dadosUsuario['tipo'] ?? null;

if (!$tipo) {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Tipo de usuário desconhecido no token."]);
    exit;
}

$sucesso = false;
if ($tipo === 'colaborador') {
    $colaborador = new Colaborador();
    $sucesso = $colaborador->logout($dadosUsuario['id_colaborador'], $refreshToken);
} elseif ($tipo === 'cliente') {
    $cliente = new Cliente();
    $sucesso = $cliente->logout($dadosUsuario['id_colaborador'], $refreshToken);
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Tipo de usuário inválido: {$tipo}"]);
    exit;
}

// 5. Remove o cookie do lado do servidor (se for web)
// 5. Remove os cookies do lado do servidor (se for web)
if (isset($_COOKIE['access_token'])) {
    setcookie("access_token", "", time() - 3600, "/");
}
if (isset($_COOKIE['refresh_token'])) {
    setcookie("refresh_token", "", time() - 3600, "/");
}

if ($sucesso) {
    echo json_encode(["sucesso" => true, "mensagem" => "Logout realizado com sucesso."]);
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao processar logout."]);
}
