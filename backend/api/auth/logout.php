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
// 1. Tente buscar o refresh_token primeiro (é o mais garantido)
$refreshToken = $_COOKIE['refresh_token'] ?? null;
if (!$refreshToken) {
    $input = json_decode(file_get_contents("php://input"), true);
    $refreshToken = $input['refresh_token'] ?? null;
}

// 2. Se não tem refresh_token, não há o que invalidar no banco. 
// Apenas limpa os cookies e encerra.
if (!$refreshToken) {
    limparCookies(); // Função helper que criaremos abaixo
    echo json_encode(["sucesso" => true, "mensagem" => "Logout concluído (tokens inexistentes)."]);
    exit;
}

// 3. Valida o refresh_token no banco para descobrir quem é o usuário
// Usamos a função que criamos anteriormente
$dadosUsuario = AuthHelper::validarRefreshToken($refreshToken);

if (!$dadosUsuario) {
    // Se o refresh_token não existe no banco, alguém tentou deslogar com token inválido.
    // Limpamos os cookies de qualquer forma por segurança.
    limparCookies();
    echo json_encode(["sucesso" => true, "mensagem" => "Sessão já inexistente."]);
    exit;
}

// 4. Agora sim, com o ID e tipo vindos do banco, chamamos o logout
$tipo = $dadosUsuario['tipo'];
$id = $dadosUsuario['id'];

$sucesso = false;
if ($tipo === 'colaborador') {
    $sucesso = (new Colaborador())->logout($id, $refreshToken);
} elseif ($tipo === 'cliente') {
    $sucesso = (new Cliente())->logout($id, $refreshToken);
}

// 5. Finaliza
limparCookies();
echo json_encode(["sucesso" => $sucesso, "mensagem" => $sucesso ? "Logout realizado." : "Erro ao invalidar sessão."]);

// Função Helper para manter o código limpo
function limparCookies()
{
    setcookie("access_token", "", time() - 3600, "/");
    setcookie("refresh_token", "", time() - 3600, "/");
}
