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
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// 2. Lógica da API protegida
$empresa = new Empresa();

switch ($metodo) {
    case 'GET':
        if (isset($_GET['id'])) {
            echo json_encode($empresa->mostrar($_GET['id']));
        } else {
            echo json_encode($empresa->listar());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($empresa->cadastrar($data->codigo_empresa, $data->nome));
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($empresa->editar($data->id_empresa, $data->codigo_empresa, $data->nome));
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($empresa->deletar($data->id_empresa));
        break;

    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}
