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

$servico = new Servico();

switch ($metodo) {
    case 'GET':
        // Se passar um ID na URL: api/servicos.php?id=1
        if (isset($_GET['id'])) {
            if ($loginValido) {
                echo json_encode($servico->mostrar($_GET['id']));
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        if ($subpath === 'listarPorEmpresa') {
            if (!isset($_GET['empresa'])) {
                http_response_code(400);
                echo json_encode(["mensagem" => "Parâmetro empresa é obrigatório"]);
                break;
            }
            if ($loginValido) {
                echo json_encode(['exists' => $servico->listar($_GET['empresa'])]);
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        if ($_GET == null || $subpath === '') {
            if ($loginValido) {
                echo json_encode($servico->listar());
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if ($subpath === 'adicionarFilial') {
            if ($loginValido) {
                echo json_encode($servico->adicionarFilial(
                    $data->id_servico ?? null,
                    $data->id_filial ?? null
                ));
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        // Cadastro padrão de serviço: nome, peso, valor
        if ($loginValido) {
            echo json_encode($servico->cadastrar(
                $data->id_empresa ?? null,
                $data->nome ?? null,
                $data->peso ?? null,
                $data->valor ?? null
            ));
        } else {
            http_response_code(401);
            echo json_encode(["mensagem" => "Não autorizado"]);
        }
        break;

    case 'PUT':
        // Edição de serviço: id_servico, nome, peso, valor
        $data = json_decode(file_get_contents("php://input"));
        if ($loginValido) {
            echo json_encode($servico->editar(
                $data->id_servico ?? null,
                $data->nome ?? null,
                $data->peso ?? null,
                $data->valor ?? null
            ));
        } else {
            http_response_code(401);
            echo json_encode(["mensagem" => "Não autorizado"]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));

        if ($subpath === 'removerFilial') {
            if ($loginValido) {
                echo json_encode($servico->removerFilial(
                    $data->id_servico ?? null,
                    $data->id_filial ?? null
                ));
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        // Deleção padrão via JSON body
        if ($loginValido) {
            echo json_encode($servico->deletar($data->id_servico ?? null));
        } else {
            http_response_code(401);
            echo json_encode(["mensagem" => "Não autorizado"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}
