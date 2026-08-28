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

$filial = new Filial();

switch ($metodo) {
    case 'GET':
        // Se passar um ID na URL: api/filiais.php?id=1
        if (isset($_GET['id'])) {
            if ($loginValido) {
                echo json_encode($filial->mostrar($_GET['id']));
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
                echo json_encode(['exists' => $filial->listar($_GET['empresa'])]);
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        if ($_GET == null) {
            if ($loginValido) {
                // Como o listar obrigatoriamente exige id_empresa, se não for passado via GET, podemos retornar erro ou listar geral se aplicável. 
                // Seguindo a regra solicitada ("no listar faça pedir o id_empresa obrigatoriamente"), exigimos o parâmetro.
                http_response_code(400);
                echo json_encode(["mensagem" => "Parâmetro empresa é obrigatório"]);
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
        // Cadastro de filial: id_empresa, nome, endereco, bairro, cidade, uf
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($filial->cadastrar(
            $data->id_empresa ?? null,
            $data->nome ?? null,
            $data->endereco ?? null,
            $data->bairro ?? null,
            $data->cidade ?? null,
            $data->uf ?? null
        ));
        break;

    case 'PUT':
        // Edição de filial: id_filial, nome, endereco, bairro, cidade, uf
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($filial->editar(
            $data->id_filial ?? null,
            $data->nome ?? null,
            $data->endereco ?? null,
            $data->bairro ?? null,
            $data->cidade ?? null,
            $data->uf ?? null
        ));
        break;

    case 'DELETE':
        // Deleção via JSON body
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($filial->deletar($data->id_filial ?? null));
        break;

    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}
