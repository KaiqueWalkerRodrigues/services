<?php
// Configuração das credenciais de teste
define('USERS', [
    ['email' => 'admin@teste.com', 'senha' => '123456'],
    ['email' => 'dev@teste.com', 'senha' => '123456'],
    ['email' => 'user@teste.com', 'senha' => '123456']
]);

// Garante que a requisição seja POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "erro", "mensagem" => "Método não permitido."]);
    exit;
}

// Obtém o conteúdo da requisição (JSON vindo do Fetch/Axios)
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$senha = $input['senha'] ?? '';

$loginSucesso = false;

// Validação simples
foreach (USERS as $user) {
    if ($user['email'] === $email && $user['senha'] === $senha) {
        // Sucesso: Configura a sessão
        $_SESSION['logado'] = true;
        $_SESSION['email'] = $user['email'];
        $_SESSION['id_setores'] = $user['id_setores'];

        $loginSucesso = true;
        break;
    }
}

if ($loginSucesso) {
    http_response_code(200);
    echo json_encode(["status" => "success", "mensagem" => "Login realizado com sucesso!"]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "erro", "mensagem" => "Email ou senha incorretos."]);
}
exit;
