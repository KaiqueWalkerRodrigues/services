<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

// Definições e Constantes
// include_once('const.php'); // Descomente caso use arquivo de constantes
define('BASE_DIR', __DIR__ . '/api/');

// Configura o cabeçalho para respostas JSON (padrão de API)
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/class/classes.php';

/**
 * Verifica se o usuário possui as permissões necessárias (baseado no JWT).
 * Suporta tanto a verificação por permissões quanto a compatibilidade com a antiga lógica de grupos.
 */
function verificarPermissoes($permissoesRequeridas, $dadosUsuario)
{
    if ($permissoesRequeridas === null) {
        return true; // Sem requerimento de permissão
    }

    if (!$dadosUsuario) {
        return false;
    }

    return AuthHelper::usuarioTemPermissao($permissoesRequeridas, $dadosUsuario);
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
// Formato: 'caminho/na/url' => ['file' => 'arquivo.php', 'login' => bool|array, 'permissoes' => array|null]
// 'login' pode ser: false (aberto), true (requer login), ou array com métodos específicos
// 'permissoes' é um array de strings com nomes de permissões requeridas (ex: ['create_user', 'edit_user'])
$rotas = [
    // auth
    'api/auth/loginCliente' => [
        'file' => 'auth/loginCliente.php',
        'login' => false,
        'permissoes' => null
    ],
    'api/auth/loginColaborador' => [
        'file' => 'auth/loginColaborador.php',
        'login' => false,
        'permissoes' => null
    ],
    'api/auth/me' => [
        'file' => 'auth/me.php',
        'login' => true,
        'permissoes' => null
    ],
    'api/auth/refresh' => [
        'file' => 'auth/refresh.php',
        'login' => false,
        'permissoes' => null
    ],
    'api/auth/logout' => [
        'file' => 'auth/logout.php',
        'login' => true,
        'permissoes' => null
    ],

    // colaboradores
    'api/colaboradores' => [
        'file' => 'colaboradores.php',
        'login' => [
            'GET' => true,
            'PUT' => true,
            'PATCH' => true,
            'DELETE' => true,
            'POST' => false,
            'default' => true
        ],
        'permissoes' => null
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
        'permissoes' => null
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
        'permissoes' => null
    ],
];

// 3. Processamento da Rota
$matchedRoute = null;
if (array_key_exists($route, $rotas)) {
    $matchedRoute = $route;
    $configRota = $rotas[$route];
    $file = $configRota['file'];
    $requiredLogin = $configRota['login'];
    $requiredPermissoes = $configRota['permissoes'];
} else {
    $configRota = null;
    foreach ($rotas as $rotaBase => $config) {
        if ($rotaBase !== '' && str_starts_with($route, $rotaBase . '/')) {
            $matchedRoute = $rotaBase;
            $configRota = $config;
            $file = $config['file'];
            $requiredLogin = $config['login'];
            $requiredPermissoes = $config['permissoes'];
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
$dadosUsuario = null;

if (rotaExigeLogin($requiredLogin, $method)) {
    $token = AuthHelper::obterTokenJwt();
    $dadosUsuario = $token ? AuthHelper::validarToken($token) : false;

    if (!$dadosUsuario) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Não autorizado. Faça login (401)."]);
        exit;
    }

    $refreshToken = $_COOKIE['refresh_token'] ?? null;
    $sessaoValida = AuthHelper::validarRefreshToken($refreshToken);

    if (!$sessaoValida) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Sessão encerrada pelo servidor (401)."]);
        exit;
    }
} else {
    // Rota pública, mas tentamos ler dados se houver token
    $token = AuthHelper::obterTokenJwt();
    if ($token) {
        $dadosUsuario = AuthHelper::validarToken($token);
    }
}

// 5. Validação de Permissões (RBAC baseado em JWT)
if ($requiredPermissoes !== null && $dadosUsuario) {
    if (!verificarPermissoes($requiredPermissoes, $dadosUsuario)) {
        http_response_code(403);
        echo json_encode(["status" => "erro", "mensagem" => "Acesso negado. Permissões insuficientes (403)."]);
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
