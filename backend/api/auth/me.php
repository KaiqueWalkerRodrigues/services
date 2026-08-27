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
$payload = AuthHelper::validarToken($token);
if (!$payload) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Token inválido ou expirado"]);
    exit;
}

$idColaborador = $payload['id_colaborador'] ?? $payload['id'] ?? null;
if (!$idColaborador) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Token inválido ou sem colaborador"]);
    exit;
}

// Busca dados atualizados do colaborador para manter compatibilidade com o frontend
$colaborador = new Colaborador();
$resultado = $colaborador->mostrar($idColaborador);

$dadosResposta = [
    "id_colaborador" => (int) $idColaborador,
    "tipo" => $payload['tipo'] ?? null,
    "is_sa" => (bool) ($payload['is_sa'] ?? false),
    "grupos" => $payload['grupos'] ?? [],
    "permissoes" => $payload['permissoes'] ?? [],
    "id_empresa" => $payload['id_empresa'] ?? [],
    "empresas_acesso" => $payload['empresas_acesso'] ?? []
];

if ($resultado['status'] === 'sucesso') {
    $usuario = $resultado['dados'];
    $dadosResposta['nome'] = $usuario['nome'] ?? null;
}

http_response_code(200);
echo json_encode([
    "sucesso" => true,
    "dados" => $dadosResposta
]);
