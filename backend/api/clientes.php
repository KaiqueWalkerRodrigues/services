<?php
require("api/api.php");

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

$metodo = $_SERVER['REQUEST_METHOD'];

$token = AuthHelper::obterTokenJwt();
$dadosUsuario = $token ? AuthHelper::validarToken($token) : false;
$loginValido = (bool) $dadosUsuario;

$cliente = new Cliente();

switch ($metodo) {
    case 'GET':
        // Se passar um ID na URL: api/clientes.php?id=1
        if (isset($_GET['id'])) {
            if ($loginValido) {
                echo json_encode($cliente->mostrar($_GET['id']));
            } else {
                http_response_code(401);
                echo json_encode(["mensagem" => "Não autorizado"]);
            }
            break;
        }

        if (isset($_GET['email'])) {
            echo json_encode(['exists' => $cliente->consultarEmail($_GET['email'])]);
            break;
        }

        if ($loginValido) {
            echo json_encode($cliente->listar());
        } else {
            http_response_code(401);
            echo json_encode(["mensagem" => "Não autorizado"]);
        }
        break;

    case 'POST':
        // Cadastro de cliente: nome, email, senha, celular
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($cliente->cadastrar(
            $data->nome,
            $data->email,
            $data->senha,
            $data->celular ?? null
        ));
        break;

    case 'PUT':
        // Edição de cliente: id, nome, email, celular, senha (opcional)
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($cliente->editar(
            $data->id_cliente,
            $data->nome,
            $data->email,
            $data->celular ?? null,
            $data->senha ?? null
        ));
        break;

    case 'DELETE':
        // Deleção via JSON body
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($cliente->deletar($data->id_cliente));
        break;

    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}
