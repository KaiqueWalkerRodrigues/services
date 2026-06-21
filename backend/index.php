<?php
session_start();

// Definições e Constantes
// include_once('const.php'); // Descomente caso use arquivo de constantes
define('BASE_DIR', __DIR__ . '/api/');

// Configura o cabeçalho para respostas JSON (padrão de API)
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/class/classes.php';

/**
 * Verifica se o usuário possui pelo menos um dos grupos necessários.
 */
function verificarSetor(array $grupos_necessarios)
{
    if (!isset($_SESSION['id_grupos']) || !is_array($_SESSION['id_grupos'])) {
        return false;
    }

    foreach ($_SESSION['id_grupos'] as $setor_usuario) {
        if (in_array($setor_usuario, $grupos_necessarios)) {
            return true;
        }
    }
    return false;
}

/**
 * Retorna todos os headers da requisição.
 */
function obterHeaders()
{
    if (function_exists('getallheaders')) {
        return getallheaders();
    }

    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (str_starts_with($name, 'HTTP_')) {
            $headerName = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
            $headers[$headerName] = $value;
        }
    }
    return $headers;
}

/**
 * Retorna o token Bearer ou o token do cookie.
 */
function obterTokenJwt()
{
    $headers = obterHeaders();
    $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    if ($authorization) {
        return preg_replace('/^Bearer\s+/i', '', trim($authorization));
    }

    return $_COOKIE['access_token'] ?? null;
}

/**
 * Verifica se a rota exige autenticação para o método HTTP atual.
 */
function rotaExigeLogin($loginConfig, $metodo)
{
    if (is_array($loginConfig)) {
        return $loginConfig[$metodo] ?? $loginConfig['default'] ?? false;
    }
    return (bool) $loginConfig;
}

// 1. Captura e limpeza da URL requisitada
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = trim($requestUri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// 2. Tabela de Rotas
// Formato: 'caminho/na/url' => ['file' => 'arquivo.php', 'login' => bool|array, 'grupos' => array|null]
$rotas = [
    // auth
    'api/auth/loginCliente' => [
        'file' => 'auth/loginCliente.php',
        'login' => false,
        'grupos' => null
    ],
    'api/auth/loginColaborador' => [
        'file' => 'auth/loginColaborador.php',
        'login' => false,
        'grupos' => null
    ],
    'api/auth/refresh' => [
        'file' => 'auth/refresh.php',
        'login' => false,
        'grupos' => null
    ],
    'api/auth/logout' => [
        'file' => 'auth/logout.php',
        'login' => true,
        'grupos' => null
    ],

    // colaboradores
    'api/colaboradores' => [
        'file' => 'colaboradores.php',
        'login' => [
            'GET' => true,
            'PUT' => true,
            'DELETE' => true,
            'POST' => false,
            'default' => true
        ],
        'grupos' => null
    ],

    // clientes
    'api/clientes' => [
        'file' => 'clientes.php',
        'login' => [
            'GET' => false,
            'PUT' => true,
            'DELETE' => true,
            'POST' => false,
            'default' => true
        ],
        'grupos' => null
    ],

    // empresas
    'api/empresas' => [
        'file' => 'empresas.php',
        'login' => [
            'GET' => true,
            'PUT' => true,
            'DELETE' => true,
            'POST' => true,
            'default' => true
        ],
        'grupos' => null
    ],
];

// 3. Processamento da Rota
$matchedRoute = null;
if (array_key_exists($route, $rotas)) {
    $matchedRoute = $route;
    $configRota = $rotas[$route];
    $file = $configRota['file'];
    $requiredLogin = $configRota['login'];
    $requiredSectors = $configRota['grupos'];
} else {
    $configRota = null;
    foreach ($rotas as $rotaBase => $config) {
        if ($rotaBase !== '' && str_starts_with($route, $rotaBase . '/')) {
            $matchedRoute = $rotaBase;
            $configRota = $config;
            $file = $config['file'];
            $requiredLogin = $config['login'];
            $requiredSectors = $config['grupos'];
            break;
        }
    }

    if ($configRota === null) {
        http_response_code(404);
        echo json_encode(["status" => "erro", "mensagem" => "Endpoint não encontrado (404)."]);
        exit;
    }
}

$apiSubpath = '';
if ($matchedRoute !== null && $matchedRoute !== $route) {
    $apiSubpath = substr($route, strlen($matchedRoute) + 1);
}
$_SERVER['API_ROUTE_BASE'] = $matchedRoute;
$_SERVER['API_SUBPATH'] = $apiSubpath;

// 4. Validação de Login
if (rotaExigeLogin($requiredLogin, $method)) {
    $token = obterTokenJwt();
    $dadosUsuario = $token ? AuthHelper::validarToken($token) : false;

    if (!$dadosUsuario) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Não autorizado. Faça login (401)."]);
        exit;
    }
}

// 5. Validação de grupos (Grupos)
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
    include $filePath;
} else {
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Arquivo interno ausente: {$file}"]);
    exit;
}
