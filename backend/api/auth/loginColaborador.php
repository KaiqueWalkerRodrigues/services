<?php
require("api/api.php");

// 1. Mantenha os headers (se não migrou para api.php ainda)
header("Access-Control-Allow-Origin: *");
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
    $resultadoLogin = $colaborador->login($dados->login, $dados->senha, $origem, $ip_address);

    if ($resultadoLogin['status'] === 'sucesso') {
        $usuario = $resultadoLogin['dados_usuario'];

        // --- PROTEÇÃO: Use coalescência nula (??) para evitar Undefined Index ---
        $id_grupo_usuario = $usuario['id_grupo'] ?? null;

        // Se id_grupo for null, busca os grupos através da tabela de relacionamento
        if (!$id_grupo_usuario) {
            $grupos = $colaborador->obterGruposColaborador($usuario['id_colaborador']);
            $id_grupo_usuario = !empty($grupos) ? $grupos[0]['id_grupo'] : null;
        }

        // --- BUSCA DE DADOS DE RBAC E ESCOPO ---
        // Agora usamos o $id_grupo_usuario que garantimos existir
        $dadosGrupo = $id_grupo_usuario ? $colaborador->obterDadosGrupo($id_grupo_usuario) : ['is_sa' => false, 'nome_grupo' => null];

        $is_sa = $usuario['is_sa'] ?? $dadosGrupo['is_sa']; // Prioriza o is_sa do usuário, senão do grupo
        $nome_grupo = $dadosGrupo['nome_grupo'];

        $permissoes = $id_grupo_usuario ? $colaborador->obterPermissoesGrupo($id_grupo_usuario) : [];
        $empresas_acesso = $colaborador->obterEmpresasAcesso($usuario['id_colaborador']);

        // --- GERAÇÃO DO JWT ---
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payloadArray = [
            'sub' => (int)$usuario['id_colaborador'],
            'tipo' => 'colaborador',
            'id_empresa' => (int)$usuario['id_empresa'],
            'id_grupo' => (int)$id_grupo_usuario,
            'nome_grupo' => $nome_grupo,
            'is_sa' => (bool)$is_sa,
            'permissoes' => $permissoes,
            'empresas_acesso' => $empresas_acesso,
            'exp' => time() + (10 * 60)
        ];

        $payload = base64_encode(json_encode($payloadArray));
        $secret = getenv('JWT_SECRET') ?: 'abc123';
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        $token_jwt = "$header.$payload.$signature";

        // --- COOKIES (Removidos warnings antes disso) ---
        if ($origem === 'web') {
            setcookie("access_token", $token_jwt, [
                'expires' => time() + (10 * 60),
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            setcookie("refresh_token", $resultadoLogin['refresh_token'], [
                'expires' => time() + (30 * 24 * 60 * 60),
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
        }

        http_response_code(200);
        echo json_encode([
            "sucesso" => true,
            "access_token" => ($origem === 'mobile') ? $token_jwt : null,
            "refresh_token" => $resultadoLogin['refresh_token'],
            "usuario" => [
                "id_colaborador" => $usuario['id_colaborador'],
                "id_empresa" => $usuario['id_empresa'],
                "login" => $usuario['login']
            ],
            "rbac" => [
                "is_sa" => (bool)$is_sa,
                "grupos" => $grupos,
                "permissoes" => $permissoes,
                "empresas_acesso" => $empresas_acesso
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
