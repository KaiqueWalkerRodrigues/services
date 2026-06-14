<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require_once 'class/classes.php';

$colaborador = new Colaborador();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        // Se passar um ID na URL: api/colaboradores.php?id=1
        if (isset($_GET['id'])) {
            echo json_encode($colaborador->mostrar($_GET['id']));
        } else {
            echo json_encode($colaborador->listar());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($colaborador->cadastrar($data->id_empresa, $data->id_grupo, $data->nome, $data->login, $data->senha));
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($colaborador->editar($data->id_colaborador, $data->id_empresa, $data->id_grupo, $data->nome, $data->login, $data->senha ?? null));
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($colaborador->deletar($data->id_colaborador));
        break;

    default:
        http_response_code(405);
        echo json_encode(["mensagem" => "Método não permitido"]);
        break;
}