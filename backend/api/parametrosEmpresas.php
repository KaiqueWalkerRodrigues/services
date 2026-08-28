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
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require("api/api.php");

$metodo = $_SERVER['REQUEST_METHOD'];

$token = AuthHelper::obterTokenJwt();
$dadosUsuario = $token ? AuthHelper::validarToken($token) : false;
$loginValido = (bool) $dadosUsuario;

$parametros = new ParametrosEmpresas();

switch ($metodo) {
    case 'GET':
        if (!isset($_GET['id_empresa'])) {
            http_response_code(400);
            echo json_encode(["status" => "erro", "mensagem" => "O parâmetro id_empresa é obrigatório"]);
            break;
        }

        if ($loginValido) {
            echo json_encode($parametros->mostrar($_GET['id_empresa']));
        } else {
            http_response_code(401);
            echo json_encode(["status" => "erro", "mensagem" => "Não autorizado"]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));

        if ($loginValido) {
            echo json_encode($parametros->Salvar(
                $data->id_empresa ?? null,
                $data->tempo_agendamento ?? null,
                $data->tempo_intervalo ?? null
            ));
        } else {
            http_response_code(401);
            echo json_encode(["status" => "erro", "mensagem" => "Não autorizado"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "erro", "mensagem" => "Método não permitido"]);
        break;
}
