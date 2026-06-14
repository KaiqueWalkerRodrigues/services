<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once 'class/classes.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->login) && !empty($dados->senha)) {
    
    // Captura a origem (ex: React_Web ou React_Native) e o IP do usuário
    $origem = $dados->origem ?? 'Desconhecida';
    $ip_address = $_SERVER['REMOTE_ADDR'];

    $colaborador = new Colaborador();
    
    // Chama o novo método que faz validação e insere no banco
    $resultadoLogin = $colaborador->login($dados->login, $dados->senha, $origem, $ip_address);
    
    if ($resultadoLogin['status'] === 'sucesso') {
        $usuario = $resultadoLogin['dados_usuario'];
        
        // --- GERAÇÃO DO JWT (Access Token) ---
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'sub' => $usuario['id_colaborador'],
            'tipo' => 'colaborador',
            'id_empresa' => $usuario['id_empresa'],
            'id_cargo' => $usuario['id_cargo'],
            'exp' => time() + (15 * 60) // JWT Expira em 15 minutos
        ]));
        
        $secret = getenv('JWT_SECRET') ?: 'sua_chave_secreta_aqui';
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        $token_jwt = "$header.$payload.$signature";
        
        // Retorna o JWT e o Refresh Token (já salvo no banco)
        http_response_code(200);
        echo json_encode([
            "sucesso" => true,
            "access_token" => $token_jwt,
            "refresh_token" => $resultadoLogin['refresh_token'],
            "usuario" => $usuario
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["sucesso" => false, "mensagem" => $resultadoLogin['mensagem']]);
    }
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Informe login e senha."]);
}