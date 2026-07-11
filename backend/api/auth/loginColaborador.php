<?php
require("api/api.php");

header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->login) && !empty($dados->senha)) {
    $origem = $dados->origem ?? 'web';
    $ip_address = $_SERVER['REMOTE_ADDR'];

    $colaborador = new Colaborador();
    $resultadoLogin = $colaborador->login($dados->login, $dados->senha, $dados->id_empresa, $origem, $ip_address);

    if ($resultadoLogin['status'] === 'sucesso') {
        $usuario = $resultadoLogin['dados_usuario'];

        $grupos = $colaborador->obterGruposColaborador($usuario['id_colaborador']);
        $ids_grupos = array_column($grupos, 'id_grupo');

        $is_sa = $usuario['is_sa'];

        $permissoes = $is_sa ? ['*'] : $colaborador->obterPermissoesGrupos($ids_grupos);

        $empresas_acesso = $colaborador->obterEmpresasAcesso($usuario['id_colaborador']);

        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payloadArray = [
            'id_colaborador' => (int)$usuario['id_colaborador'],
            'tipo' => 'colaborador',
            'is_sa' => (bool)$is_sa,
            'grupos' => $ids_grupos,
            'permissoes' => $permissoes,
            'empresas_acesso' => $empresas_acesso,
            'exp' => time() + (10 * 60)
        ];

        $payload = base64_encode(json_encode($payloadArray));
        $secret = getenv('JWT_SECRET') ?: 'abc123';
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        $token_jwt = "$header.$payload.$signature";

        $path = null;
        if ((bool)$is_sa == true) {
            $path = "/admin/dashboards";
        } else {
            $path = "/home";
        }

        // --- COOKIES E RESPOSTA ---
        if ($origem === 'web') {
            setcookie("access_token", $token_jwt, ['expires' => time() + (10 * 60), 'path' => '/', 'httponly' => true, 'samesite' => 'Strict']);
            setcookie("refresh_token", $resultadoLogin['refresh_token'], ['expires' => time() + (30 * 24 * 60 * 60), 'path' => '/', 'httponly' => true, 'samesite' => 'Strict']);
        }

        http_response_code(200);
        echo json_encode([
            "sucesso" => true,
            "access_token" => ($origem === 'mobile') ? $token_jwt : null,
            "refresh_token" => $resultadoLogin['refresh_token'],
            "usuario" => [
                "id_colaborador" => (int)$usuario['id_colaborador'],
                "path" => $path,
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["sucesso" => false, "mensagem" => $resultadoLogin['mensagem']]);
    }
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}
