<?php
// Essa é a nossa "tabela virtual" contendo as contas da empresa para o teste
define('EMPRESA_USERS', [
    ['codigo' => '123-456', 'email' => 'colaborador@teste.com', 'senha' => '123456'],
    ['codigo' => '999-999', 'email' => 'dev@teste.com', 'senha' => '123456']
]);

// Garante que a requisição seja POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "erro", "mensagem" => "Método não permitido."]);
    exit;
}

// Obtém o conteúdo JSON enviado pelo Fetch do React
$input = json_decode(file_get_contents('php://input'), true);

$codigo = $input['codigo'] ?? '';
$email  = $input['email'] ?? ''; // O React envia o campo "usuario" mapeado aqui
$senha  = $input['senha'] ?? '';

// Validação: Exige que os três campos estejam preenchidos
if (empty($codigo) || empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(["status" => "erro", "mensagem" => "Preencha Código, Usuário e Senha."]);
    exit;
}

$loginSucesso = false;

// Percorre o array para validar se os TRÊS dados combinam perfeitamente
foreach (EMPRESA_USERS as $user) {
    if ($user['codigo'] === $codigo && $user['email'] === $email && $user['senha'] === $senha) {
        $_SESSION['logado'] = true;
        $_SESSION['email'] = $user['email'];
        $_SESSION['perfil'] = 'colaborador';
        
        $loginSucesso = true;
        break;
    }
}

// Responde ao React com os códigos HTTP corretos
if ($loginSucesso) {
    http_response_code(200);
    echo json_encode(["status" => "success", "mensagem" => "Acesso interno liberado!"]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "erro", "mensagem" => "Dados inválidos ou código incorreto."]);
}
exit;