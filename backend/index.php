<?php
session_start();

// Definições e Constantes
// include_once('const.php'); // Descomente caso use arquivo de constantes
define('BASE_DIR', __DIR__ . '/api/');

// Configura o cabeçalho para respostas JSON (padrão de API)
header('Content-Type: application/json; charset=utf-8');

/**
 * Verifica se o usuário possui pelo menos um dos setores necessários.
 */
function verificarSetor(array $setores_necessarios)
{
    // Garante que a sessão possui os setores em formato de array
    if (!isset($_SESSION['id_setores']) || !is_array($_SESSION['id_setores'])) {
        return false;
    }

    foreach ($_SESSION['id_setores'] as $setor_usuario) {
        if (in_array($setor_usuario, $setores_necessarios)) {
            return true;
        }
    }
    return false;
}

// 1. Captura e limpeza da URL requisitada
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = trim($requestUri, '/'); // Ex: 'api/login'

// 2. Tabela de Rotas
// Formato: 'caminho/na/url' => ['file' => 'arquivo.php', 'login' => bool, 'setores' => array|null]
$rotas = [
    //auth
    'api/auth/logout' => [
        'file' => 'auth/logout.php',
        'login' => false,
        'setores' => null
    ],
    'api/auth/refresh' => [
        'file' => 'auth/refresh.php',
        'login' => false,
        'setores' => null
    ],
    'api/auth/loginEmpresa' => [
        'file' => 'auth/loginEmpresa.php',
        'login' => false,
        'setores' => null
    ],
    'api/auth/logout' => [
        'file' => 'auth/logout.php',
        'login' => false,
        'setores' => null
    ],

    //colaboradores
    'api/colaboradores' => [
        'file' => 'colaboradores.php',
        'login' => false,
        'setores' => null
    ],
    //clientes
    'api/clientes' => [
        'file' => 'clientes.php',
        'login' => false,
        'setores' => null
    ],
];

// 3. Processamento da Rota
if (array_key_exists($route, $rotas)) {
    $configRota = $rotas[$route];
    $file = $configRota['file'];
    $requiredLogin = $configRota['login'];
    $requiredSectors = $configRota['setores'];
} else {
    // Rota não registrada
    http_response_code(404);
    echo json_encode(["status" => "erro", "mensagem" => "Endpoint não encontrado (404)."]);
    exit;
}

// 4. Validação de Login
if ($requiredLogin && empty($_SESSION['logado'])) {
    http_response_code(401);
    echo json_encode(["status" => "erro", "mensagem" => "Não autorizado. Faça login (401)."]);
    exit;
}

// 5. Validação de Setores (Grupos)
if ($requiredSectors !== null) {
    if (!verificarSetor($requiredSectors)) {
        http_response_code(403);
        echo json_encode(["status" => "erro", "mensagem" => "Acesso negado para o seu setor (403)."]);
        exit;
    }
}

// 6. Inclusão do Arquivo Responsável
$filePath = BASE_DIR . $file;

if (file_exists($filePath)) {
    // O arquivo incluído (ex: api/login.php) deve fazer os echos finais (ex: json_encode dos dados)
    include $filePath;
} else {
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Arquivo interno ausente: {$file}"]);
    exit;
}
