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

$grupo = new Grupo();

switch ($metodo) {

    // =========================================================
    // GET
    // =========================================================

    case 'GET':

        // Listar permissões de um grupo via subpath: api/grupos/listarPermissoes?id_grupo=1
        // ou via query string: api/grupos.php?listarPermissoes=1&id_grupo=1
        if ($subpath === 'listarPermissoes' || isset($_GET['listarPermissoes'])) {

            if (!isset($_GET['id_grupo']) || empty($_GET['id_grupo'])) {

                http_response_code(400);

                echo json_encode([
                    "mensagem" => "Parâmetro id_grupo é obrigatório"
                ]);

                break;
            }

            if ($loginValido) {

                echo json_encode(
                    $grupo->listarPermissoes($_GET['id_grupo'])
                );
            } else {

                http_response_code(401);

                echo json_encode([
                    "mensagem" => "Não autorizado"
                ]);
            }

            break;
        }

        // Buscar um grupo específico
        // Exemplo: api/grupos.php?id=1

        if (isset($_GET['id'])) {

            if ($loginValido) {

                echo json_encode(
                    $grupo->mostrar($_GET['id'])
                );
            } else {

                http_response_code(401);

                echo json_encode([
                    "mensagem" => "Não autorizado"
                ]);
            }

            break;
        }

        // Listar grupos por empresa
        // Exemplo: api/grupos.php?empresa=1
        // ou: api/grupos/listarPorEmpresa?empresa=1

        if ($subpath === 'listarPorEmpresa' || isset($_GET['empresa'])) {

            if (!isset($_GET['empresa']) || empty($_GET['empresa'])) {

                http_response_code(400);

                echo json_encode([
                    "mensagem" => "Parâmetro empresa é obrigatório"
                ]);

                break;
            }

            if ($loginValido) {

                echo json_encode(
                    $grupo->listar($_GET['empresa'])
                );
            } else {

                http_response_code(401);

                echo json_encode([
                    "mensagem" => "Não autorizado"
                ]);
            }

            break;
        }

        // GET sem parâmetros
        // O listar exige obrigatoriamente o id_empresa

        if ($_GET == null) {

            if ($loginValido) {

                http_response_code(400);

                echo json_encode([
                    "mensagem" => "Parâmetro empresa é obrigatório"
                ]);
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
    // POST
    // =========================================================

    case 'POST':

        if (!$loginValido) {

            http_response_code(401);

            echo json_encode([
                "mensagem" => "Não autorizado"
            ]);

            break;
        }

        $data = json_decode(
            file_get_contents("php://input")
        );

        if (!$data) {

            http_response_code(400);

            echo json_encode([
                "mensagem" => "Dados inválidos ou JSON malformado"
            ]);

            break;
        }

        // Adicionar permissão ao grupo via subpath: api/grupos/adicionarPermissao
        if ($subpath === 'adicionarPermissao') {

            echo json_encode(
                $grupo->adicionarPermissao(
                    $data->id_grupo ?? null,
                    $data->id_permissao ?? null
                )
            );

            break;
        }

        // Cadastro padrão de grupo:
        // id_empresa, nome

        echo json_encode(
            $grupo->cadastrar(
                $data->id_empresa ?? null,
                $data->nome ?? null
            )
        );

        break;


    // =========================================================
    // PUT
    // =========================================================

    case 'PUT':

        // Edição de grupo:
        // id_grupo, nome

        if (!$loginValido) {

            http_response_code(401);

            echo json_encode([
                "mensagem" => "Não autorizado"
            ]);

            break;
        }

        $data = json_decode(
            file_get_contents("php://input")
        );

        if (!$data) {

            http_response_code(400);

            echo json_encode([
                "mensagem" => "Dados inválidos ou JSON malformado"
            ]);

            break;
        }

        echo json_encode(
            $grupo->editar(
                $data->id_grupo ?? null,
                $data->nome ?? null
            )
        );

        break;


    // =========================================================
    // DELETE
    // =========================================================

    case 'DELETE':

        if (!$loginValido) {

            http_response_code(401);

            echo json_encode([
                "mensagem" => "Não autorizado"
            ]);

            break;
        }

        $data = json_decode(
            file_get_contents("php://input")
        );

        if (!$data) {

            http_response_code(400);

            echo json_encode([
                "mensagem" => "Dados inválidos ou JSON malformado"
            ]);

            break;
        }

        // Remover permissão do grupo via subpath: api/grupos/removerPermissao
        if ($subpath === 'removerPermissao') {

            echo json_encode(
                $grupo->removerPermissao(
                    $data->id_grupo ?? null,
                    $data->id_permissao ?? null
                )
            );

            break;
        }

        // Deleção padrão de grupo via JSON body:
        // id_grupo

        echo json_encode(
            $grupo->deletar(
                $data->id_grupo ?? null
            )
        );

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
