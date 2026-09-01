<?php
require("api/api.php");

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if ($origin && $origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

global $dadosUsuario;

$metodo = $_SERVER['REQUEST_METHOD'];
$subpath = $_SERVER['API_SUBPATH'] ?? '';

$loginValido = (bool) $dadosUsuario;

// 2. Lógica da API protegida
$colaborador = new Colaborador();

switch ($metodo) {
    case 'GET':
        if ($subpath === 'listarPorEmpresa') {
            if (!isset($_GET['empresa'])) {
                http_response_code(400);
                echo json_encode(["mensagem" => "Parâmetro empresa é obrigatório"]);
                break;
            }
            if ($loginValido) {
                echo json_encode(['exists' => $colaborador->listarPorEmpresa($_GET['empresa'])]);
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        } elseif ($subpath === 'listarFiliais') {
            if (!isset($_GET['id_colaborador'])) {
                http_response_code(400);
                echo json_encode(["status" => "erro", "mensagem" => "O parâmetro id_colaborador é obrigatório"]);
                break;
            }
            if ($loginValido) {
                echo json_encode($colaborador->listarFiliais($_GET['id_colaborador']));
            } else {
                http_response_code(401);
                echo json_encode(["status" => "erro", "mensagem" => "Não autorizado"]);
            }
            break;
        } elseif ($subpath === 'listarGruposColaborador') {
            if (!isset($_GET['id_colaborador'])) {
                http_response_code(400);
                echo json_encode(["status" => "erro", "mensagem" => "O parâmetro id_colaborador é obrigatório"]);
                break;
            }
            if ($loginValido) {
                echo json_encode($colaborador->listarGruposColaborador($_GET['id_colaborador']));
            } else {
                http_response_code(401);
                echo json_encode(["status" => "erro", "mensagem" => "Não autorizado"]);
            }
            break;
        } else {
            if (isset($_GET['id'])) {
                echo json_encode($colaborador->mostrar($_GET['id']));
            } else {
                echo json_encode($colaborador->listar());
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if ($subpath === 'adicionarEmpresa' && isset($data->id_empresa) && isset($data->id_colaborador)) {
            echo json_encode($colaborador->adicionarEmpresa($data->id_colaborador, $data->id_empresa));
        } elseif ($subpath === 'adicionarFilial' && isset($data->id_filial) && isset($data->id_colaborador)) {
            echo json_encode($colaborador->adicionarFilial($data->id_colaborador, $data->id_filial));
        } elseif ($subpath === 'adicionarGrupo' && isset($data->id_grupo) && isset($data->id_colaborador)) {
            echo json_encode($colaborador->adicionarGrupo($data->id_colaborador, $data->id_grupo));
        } else {
            echo json_encode($colaborador->cadastrar($data->id_empresa ?? null, $data->nome, $data->login, $data->senha));
        }
        break;

    case 'PATCH':
        $data = json_decode(file_get_contents("php://input"));

        if ($subpath === 'trocarSenhaAdmin') {
            if (!eSuperAdmin($dadosUsuario)) {
                http_response_code(403);
                echo json_encode(["erro" => "Sem Permissão"]);
                exit;
            }
            echo json_encode(
                $colaborador->trocarSenhaAdmin(
                    $data->id_colaborador,
                    $data->senha
                )
            );
        } else {
            http_response_code(404);
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Rota não encontrada."
            ]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($colaborador->editar($data->id_colaborador, $data->nome, $data->login, $data->senha ?? null, $data->id_empresa ?? null));
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));

        if ($subpath === 'removerEmpresa' && isset($data->id_empresa) && isset($data->id_colaborador)) {
            echo json_encode($colaborador->removerEmpresa($data->id_colaborador, $data->id_empresa));
        } elseif ($subpath === 'removerFilial' && isset($data->id_filial) && isset($data->id_colaborador)) {
            echo json_encode($colaborador->removerFilial($data->id_colaborador, $data->id_filial));
        } elseif ($subpath === 'removerGrupo' && isset($data->id_grupo) && isset($data->id_colaborador)) {
            echo json_encode($colaborador->removerGrupo($data->id_colaborador, $data->id_grupo));
        } else {
            echo json_encode($colaborador->deletar($data->id_colaborador ?? null));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}
