<?php

// CORS headers (allow the requesting origin and required headers)

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

if ($origin && $origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require("api/api.php");

$metodo = $_SERVER['REQUEST_METHOD'];
$subpath = $_SERVER['API_SUBPATH'] ?? '';

$token = AuthHelper::obterTokenJwt();
$dadosUsuario = $token ? AuthHelper::validarToken($token) : false;
$loginValido = (bool) $dadosUsuario;

$permissao = new Permissao();

switch ($metodo) {

    // =========================================================
    // GET
    // =========================================================

    case 'GET':

        // Buscar uma permissão específica
        // Exemplo: api/permissoes.php?id=1

        if (isset($_GET['id'])) {

            if ($loginValido) {

                echo json_encode(
                    $permissao->mostrar($_GET['id'])
                );
            } else {

                http_response_code(401);

                echo json_encode([
                    "mensagem" => "Não autorizado"
                ]);
            }

            break;
        }

        // Listar todas as permissões
        // Exemplo: api/permissoes.php
        // ou: api/permissoes/listar

        if ($_GET == null || $subpath === 'listar') {

            if ($loginValido) {

                echo json_encode(
                    $permissao->listar()
                );
            } else {

                http_response_code(401);

                echo json_encode([
                    "mensagem" => "Não autorizado"
                ]);
            }

            break;
        }

        http_response_code(405);

        echo json_encode([
            "mensagem" => "Método não permitido"
        ]);

        break;


    // =========================================================
    // MÉTODO NÃO PERMITIDO
    // =========================================================

    default:

        http_response_code(405);

        echo json_encode([
            "mensagem" => "Método não permitido"
        ]);

        break;
}
