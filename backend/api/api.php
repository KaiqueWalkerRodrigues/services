<?php

header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// 2. Handle preflight (opcional, mas recomendado aqui)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!defined('BASE_DIR')) {
    http_response_code(403);
    exit('Acesso restrito.');
}

require_once __DIR__ . '/../class/classes.php';

/**
 * Valida se o usuário pode acessar um recurso específico.
 * Combina verificação de permissão + escopo de dados.
 * 
 * Uso em um endpoint:
 * if (!validarAcessoRecurso('edit_clientes', $id_empresa_do_cliente, $dadosUsuario)) {
 *     http_response_code(403);
 *     echo json_encode(['erro' => 'Acesso negado']);
 *     exit;
 * }
 * 
 * @param string|array $permissao - Permissão requerida (ex: 'edit_clientes')
 * @param int $idEmpresaRecurso - ID da empresa do recurso
 * @param array $dadosUsuario - Dados decodificados do JWT
 * @return bool
 */
function validarAcessoRecurso($permissao, $idEmpresaRecurso, $dadosUsuario)
{
    if (!$dadosUsuario) {
        return false;
    }

    return AuthHelper::usuarioPodeAcessarRecurso($permissao, $idEmpresaRecurso, $dadosUsuario);
}

/**
 * Garante que o usuário tem permissão, sem validar escopo.
 * Útil para operações que não dependem de empresa.
 * 
 * @param string|array $permissao
 * @param array $dadosUsuario
 * @return bool
 */
function validarPermissao($permissao, $dadosUsuario)
{
    if (!$dadosUsuario) {
        return false;
    }

    return AuthHelper::usuarioTemPermissao($permissao, $dadosUsuario);
}

/**
 * Garante que o usuário tem acesso à empresa específica.
 * Útil para listar/filtrar dados de uma empresa.
 * 
 * @param int $idEmpresa
 * @param array $dadosUsuario
 * @return bool
 */
function validarAcessoEmpresa($idEmpresa, $dadosUsuario)
{
    if (!$dadosUsuario) {
        return false;
    }

    return AuthHelper::usuarioTemAcessoEmpresa($idEmpresa, $dadosUsuario);
}

function eSuperAdmin($dadosUsuario)
{
    return AuthHelper::eSuperAdmin($dadosUsuario);
}
