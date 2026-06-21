<?php

/**
 * ===================================================================
 * EXEMPLO COMPLETO: Endpoint clientes.php com RBAC + Escopo
 * ===================================================================
 * 
 * Este arquivo demonstra como implementar todas as validações
 * combinando RBAC (permissões) com escopo de dados (empresas).
 * 
 * Estrutura:
 * - GET / → Lista com filtro de empresas
 * - GET /:id → Get com validação de escopo
 * - POST → Criar com validação de empresa
 * - PUT → Editar com validação de escopo
 * - DELETE → Deletar com validação de escopo
 */

require("api/api.php");

// ─── Headers CORS ────────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];
$apiSubpath = $_SERVER['API_SUBPATH'] ?? '';
$cliente = new Cliente();

// ─── ENDPOINTS ──────────────────────────────────────────────────

switch ($metodo) {
    // ═══════════════════════════════════════════════════════════════
    // GET - Listar clientes ou retornar um específico
    // ═══════════════════════════════════════════════════════════════
    case 'GET':
        // 1. Endpoint público: verificar se email existe
        if ($apiSubpath === 'consultar-email') {
            if (!isset($_GET['email'])) {
                http_response_code(400);
                echo json_encode(["erro" => "Parâmetro email é obrigatório"]);
                break;
            }

            echo json_encode(['existe' => $cliente->consultarEmail($_GET['email'])]);
            break;
        }

        // 2. GET um cliente específico: GET /api/clientes?id=123
        if (isset($_GET['id'])) {
            // ✅ Validação 1: Permissão
            if (!validarPermissao('read_clientes', $dadosUsuario)) {
                http_response_code(403);
                echo json_encode([
                    "erro" => "Permissão negada",
                    "mensagem" => "Você não tem permissão para ler clientes"
                ]);
                break;
            }

            $id_cliente = (int) $_GET['id'];

            // Busca cliente no BD
            $resultado = $cliente->mostrar($id_cliente);

            if ($resultado['status'] !== 'sucesso') {
                http_response_code(404);
                echo json_encode($resultado);
                break;
            }

            $clienteData = $resultado['dados'];
            $id_empresa_cliente = (int) $clienteData['id_empresa'];

            // ✅ Validação 2: Escopo (empresa do cliente)
            if (!validarAcessoRecurso('read_clientes', $id_empresa_cliente, $dadosUsuario)) {
                http_response_code(403);
                echo json_encode([
                    "erro" => "Acesso negado",
                    "mensagem" => "Você não pode acessar clientes desta empresa"
                ]);
                break;
            }

            // ✅ Autorizado: retorna cliente
            http_response_code(200);
            echo json_encode([
                "status" => "sucesso",
                "dados" => $clienteData
            ]);
            break;
        }

        // 3. GET lista de clientes: GET /api/clientes
        // ✅ Validação: Permissão
        if (!validarPermissao('read_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Permissão negada",
                "mensagem" => "Você não tem permissão para listar clientes"
            ]);
            break;
        }

        // Se Super Admin, retorna TODOS os clientes
        if ($dadosUsuario['is_sa']) {
            echo json_encode($cliente->listar());
            break;
        }

        // Caso contrário, retorna clientes apenas das empresas que acessa
        // (método listarPorEmpresas precisa ser implementado na classe Cliente)
        $empresas = $dadosUsuario['empresas_acesso'] ?? [];

        if (empty($empresas)) {
            // Usuário não tem acesso a nenhuma empresa
            http_response_code(200);
            echo json_encode([
                "status" => "sucesso",
                "total" => 0,
                "dados" => [],
                "mensagem" => "Você não tem acesso a nenhuma empresa"
            ]);
            break;
        }

        echo json_encode($cliente->listarPorEmpresas($empresas));
        break;

    // ═══════════════════════════════════════════════════════════════
    // POST - Criar novo cliente
    // ═══════════════════════════════════════════════════════════════
    case 'POST':
        // ✅ Validação 1: Permissão
        if (!validarPermissao('create_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Permissão negada",
                "mensagem" => "Você não tem permissão para criar clientes"
            ]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        // Validação de dados obrigatórios
        if (empty($data->nome) || empty($data->email) || empty($data->senha)) {
            http_response_code(400);
            echo json_encode([
                "erro" => "Dados incompletos",
                "campos_obrigatorios" => ["nome", "email", "senha"]
            ]);
            break;
        }

        // ✅ Validação 2: Empresa (obrigatória)
        if (!isset($data->id_empresa)) {
            http_response_code(400);
            echo json_encode([
                "erro" => "id_empresa é obrigatório"
            ]);
            break;
        }

        $id_empresa = (int) $data->id_empresa;

        // ✅ Validação 3: Escopo (empresa destino)
        if (!validarAcessoEmpresa($id_empresa, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Acesso negado",
                "mensagem" => "Você não pode criar clientes para esta empresa"
            ]);
            break;
        }

        // ✅ Autorizado: cria cliente
        echo json_encode($cliente->cadastrar(
            $data->nome,
            $data->email,
            $data->senha,
            $data->celular ?? null,
            $id_empresa
        ));
        break;

    // ═══════════════════════════════════════════════════════════════
    // PUT - Editar cliente existente
    // ═══════════════════════════════════════════════════════════════
    case 'PUT':
        // ✅ Validação 1: Permissão
        if (!validarPermissao('edit_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Permissão negada",
                "mensagem" => "Você não tem permissão para editar clientes"
            ]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id_cliente)) {
            http_response_code(400);
            echo json_encode(["erro" => "id_cliente é obrigatório"]);
            break;
        }

        $id_cliente = (int) $data->id_cliente;

        // Busca cliente para validar empresa
        $resultado = $cliente->mostrar($id_cliente);

        if ($resultado['status'] !== 'sucesso') {
            http_response_code(404);
            echo json_encode($resultado);
            break;
        }

        $id_empresa_cliente = (int) $resultado['dados']['id_empresa'];

        // ✅ Validação 2: Escopo (empresa do cliente)
        if (!validarAcessoRecurso('edit_clientes', $id_empresa_cliente, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Acesso negado",
                "mensagem" => "Você não pode editar clientes desta empresa"
            ]);
            break;
        }

        // ✅ Autorizado: edita cliente
        echo json_encode($cliente->editar(
            $id_cliente,
            $data->nome ?? null,
            $data->email ?? null,
            $data->celular ?? null,
            $data->senha ?? null
        ));
        break;

    // ═══════════════════════════════════════════════════════════════
    // DELETE - Deletar cliente
    // ═══════════════════════════════════════════════════════════════
    case 'DELETE':
        // ✅ Validação 1: Permissão
        if (!validarPermissao('delete_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Permissão negada",
                "mensagem" => "Você não tem permissão para deletar clientes"
            ]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id_cliente)) {
            http_response_code(400);
            echo json_encode(["erro" => "id_cliente é obrigatório"]);
            break;
        }

        $id_cliente = (int) $data->id_cliente;

        // Busca cliente para validar empresa
        $resultado = $cliente->mostrar($id_cliente);

        if ($resultado['status'] !== 'sucesso') {
            http_response_code(404);
            echo json_encode($resultado);
            break;
        }

        $id_empresa_cliente = (int) $resultado['dados']['id_empresa'];

        // ✅ Validação 2: Escopo (empresa do cliente)
        if (!validarAcessoRecurso('delete_clientes', $id_empresa_cliente, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode([
                "erro" => "Acesso negado",
                "mensagem" => "Você não pode deletar clientes desta empresa"
            ]);
            break;
        }

        // ✅ Autorizado: deleta cliente
        echo json_encode($cliente->deletar($id_cliente));
        break;

    default:
        http_response_code(405);
        echo json_encode(["erro" => "Método não permitido"]);
        break;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * NOTAS IMPORTANTES SOBRE A IMPLEMENTAÇÃO
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 1. $dadosUsuario é injetado automaticamente pelo index.php
 *    Contém: sub, tipo, id_empresa, id_grupo, nome_grupo, is_sa,
 *            permissoes, empresas_acesso, exp
 * 
 * 2. validarPermissao($permissao, $dadosUsuario)
 *    - Retorna true se: is_sa=true OU permissão '*' OU tem a permissão
 *    - Sem consulta ao BD (memória)
 * 
 * 3. validarAcessoRecurso($permissao, $empresa, $dadosUsuario)
 *    - Combina: permissão + escopo
 *    - Retorna true se ambos são válidos
 * 
 * 4. validarAcessoEmpresa($empresa, $dadosUsuario)
 *    - Valida se empresa está em empresas_acesso
 *    - True se: is_sa=true OU empresa no array
 * 
 * 5. Super Admin (is_sa=true)
 *    - Automaticamente autorizado em tudo
 *    - Pode ignorar validações específicas
 * 
 * 6. Permissões recomendadas:
 *    read_clientes, create_clientes, edit_clientes, delete_clientes
 * 
 * ═══════════════════════════════════════════════════════════════════
 */
