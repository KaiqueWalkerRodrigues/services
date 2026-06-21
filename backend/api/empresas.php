<?php
require("api/api.php");

global $dadosUsuario;

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
        if (!eSuperAdmin($dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Sem Permissão"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"));
        echo json_encode($empresa->cadastrar($data->codigo_empresa, $data->nome));
        break;

    case 'PUT':
        if (!AuthHelper::usuarioTemPermissao("empresas.editar", $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Sem Permissão"]);
            exit;
        }
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
