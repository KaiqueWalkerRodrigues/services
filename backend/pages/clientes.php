<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require_once 'class/classes.php';

$cliente = new Cliente();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        // Se passar um ID na URL: api/clientes.php?id=1
        if (isset($_GET['id'])) {
            echo json_encode($cliente->mostrar($_GET['id']));
        } else {
            echo json_encode($cliente->listar());
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
