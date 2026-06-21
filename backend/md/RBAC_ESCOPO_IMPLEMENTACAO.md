# RBAC com Escopo de Dados - Guia Prático de Implementação

## 📋 Resumo da Arquitetura

```
LOGIN
├─ Busca flag is_sa do grupo
├─ Busca permissões do grupo
├─ Busca empresas de acesso (vinculacoes ou id_empresa)
└─ Injeta tudo no JWT

REQUISIÇÃO SUBSEQUENTE
├─ Decodifica JWT (em memória, sem BD)
├─ Verifica permissão (com suporte a Super Admin)
├─ Valida escopo de dados (empresa)
└─ Autoriza/Nega acesso (sem BD)
```

## 🔐 Estrutura do JWT após Login

```json
{
  "sub": 1,
  "tipo": "colaborador",
  "id_empresa": 5,
  "id_grupo": 2,
  "nome_grupo": "Gerente",
  "is_sa": false,
  "permissoes": ["read_clientes", "edit_clientes", "delete_clientes"],
  "empresas_acesso": [5, 7, 9],
  "exp": 1234567890
}
```

## 🚀 Exemplo 1: Endpoint de Clientes com RBAC+Escopo

### File: `backend/api/clientes.php`

```php
<?php
require("api/api.php");

// Headers CORS
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

// $dadosUsuario já está disponível do index.php (se rota requeria login)
$cliente = new Cliente();

switch ($metodo) {
    case 'GET':
        if ($apiSubpath === 'consultar-email') {
            // ✅ Endpoint público
            if (!isset($_GET['email'])) {
                http_response_code(400);
                echo json_encode(["mensagem" => "Parâmetro email é obrigatório"]);
                break;
            }
            echo json_encode(['exists' => $cliente->consultarEmail($_GET['email'])]);
            break;
        }

        if (isset($_GET['id'])) {
            // ✅ GET um cliente específico - requer permissão + escopo
            $id_cliente = (int) $_GET['id'];

            if (!validarPermissao('read_clientes', $dadosUsuario)) {
                http_response_code(403);
                echo json_encode(["erro" => "Permissão negada para ler clientes"]);
                break;
            }

            // Busca dados do cliente no BD
            $clienteData = $cliente->mostrar($id_cliente);

            if ($clienteData['status'] !== 'sucesso') {
                http_response_code(404);
                echo json_encode($clienteData);
                break;
            }

            // Valida escopo: cliente deve estar em uma empresa que o usuário acessa
            $id_empresa_cliente = (int) $clienteData['dados']['id_empresa'];

            if (!validarAcessoRecurso('read_clientes', $id_empresa_cliente, $dadosUsuario)) {
                http_response_code(403);
                echo json_encode(["erro" => "Acesso negado a este cliente"]);
                break;
            }

            echo json_encode($clienteData);
            break;
        }

        // ✅ GET todos os clientes - retorna apenas dos quais tem acesso
        if (!validarPermissao('read_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Permissão negada para ler clientes"]);
            break;
        }

        // Se Super Admin, retorna todos
        if ($dadosUsuario['is_sa']) {
            echo json_encode($cliente->listar());
            break;
        }

        // Caso contrário, retorna apenas dos clientes da empresa que acessa
        echo json_encode($cliente->listarPorEmpresas($dadosUsuario['empresas_acesso']));
        break;

    case 'POST':
        // ✅ POST - criar novo cliente
        if (!validarPermissao('create_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Permissão negada para criar clientes"]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        // Valida se a empresa do novo cliente está no escopo do usuário
        if (!isset($data->id_empresa)) {
            http_response_code(400);
            echo json_encode(["erro" => "id_empresa é obrigatório"]);
            break;
        }

        if (!validarAcessoEmpresa((int) $data->id_empresa, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Você não pode criar clientes para esta empresa"]);
            break;
        }

        echo json_encode($cliente->cadastrar(
            $data->nome,
            $data->email,
            $data->senha,
            $data->celular ?? null,
            $data->id_empresa
        ));
        break;

    case 'PUT':
        // ✅ PUT - editar cliente
        if (!validarPermissao('edit_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Permissão negada para editar clientes"]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));
        $id_cliente = (int) $data->id_cliente;

        // Busca cliente para validar empresa
        $clienteData = $cliente->mostrar($id_cliente);

        if ($clienteData['status'] !== 'sucesso') {
            http_response_code(404);
            echo json_encode($clienteData);
            break;
        }

        $id_empresa = (int) $clienteData['dados']['id_empresa'];

        // Valida escopo
        if (!validarAcessoRecurso('edit_clientes', $id_empresa, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Você não pode editar este cliente"]);
            break;
        }

        echo json_encode($cliente->editar(
            $data->id_cliente,
            $data->nome,
            $data->email,
            $data->celular ?? null,
            $data->senha ?? null
        ));
        break;

    case 'DELETE':
        // ✅ DELETE - deletar cliente
        if (!validarPermissao('delete_clientes', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Permissão negada para deletar clientes"]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));
        $id_cliente = (int) $data->id_cliente;

        // Busca cliente para validar empresa
        $clienteData = $cliente->mostrar($id_cliente);

        if ($clienteData['status'] !== 'sucesso') {
            http_response_code(404);
            echo json_encode($clienteData);
            break;
        }

        $id_empresa = (int) $clienteData['dados']['id_empresa'];

        // Valida escopo
        if (!validarAcessoRecurso('delete_clientes', $id_empresa, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Você não pode deletar este cliente"]);
            break;
        }

        echo json_encode($cliente->deletar($id_cliente));
        break;

    default:
        http_response_code(405);
        echo json_encode(["erro" => "Método não permitido"]);
        break;
}
```

## 🔧 Exemplo 2: Endpoint de Colaboradores com RBAC+Escopo

```php
<?php
require("api/api.php");

// Headers...
header("Access-Control-Allow-Origin: *");
// ... resto dos headers

$metodo = $_SERVER['REQUEST_METHOD'];
$apiSubpath = $_SERVER['API_SUBPATH'] ?? '';
$colaborador = new Colaborador();

switch ($metodo) {
    case 'GET':
        // ✅ Listar apenas colaboradores das empresas que acessa
        if (!validarPermissao('read_colaboradores', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Permissão negada"]);
            break;
        }

        if ($dadosUsuario['is_sa']) {
            // Super Admin vê todos
            echo json_encode($colaborador->listar());
        } else {
            // Filtra por empresas de acesso
            echo json_encode($colaborador->listarPorEmpresas($dadosUsuario['empresas_acesso']));
        }
        break;

    case 'POST':
        // ✅ Criar novo colaborador
        if (!validarPermissao('create_colaboradores', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Sem permissão"]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        // Valida se pode criar colaborador nesta empresa
        if (!validarAcessoEmpresa((int) $data->id_empresa, $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Sem acesso a esta empresa"]);
            break;
        }

        echo json_encode($colaborador->cadastrar(
            $data->id_empresa,
            $data->id_grupo,
            $data->nome,
            $data->login,
            $data->senha
        ));
        break;

    case 'DELETE':
        // ✅ Deletar colaborador
        if (!validarPermissao('delete_colaboradores', $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Sem permissão"]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));
        $id_colab = (int) $data->id_colaborador;

        // Busca para validar empresa
        $colab = $colaborador->mostrar($id_colab);

        if ($colab['status'] !== 'sucesso') {
            http_response_code(404);
            echo json_encode($colab);
            break;
        }

        // Valida escopo
        if (!validarAcessoRecurso('delete_colaboradores', (int) $colab['dados']['id_empresa'], $dadosUsuario)) {
            http_response_code(403);
            echo json_encode(["erro" => "Sem acesso a este colaborador"]);
            break;
        }

        echo json_encode($colaborador->deletar($id_colab));
        break;
}
```

## 📊 Estrutura de Permissões Recomendada

```
CLIENTES:
- read_clientes
- create_clientes
- edit_clientes
- delete_clientes

COLABORADORES:
- read_colaboradores
- create_colaboradores
- edit_colaboradores
- delete_colaboradores

EMPRESAS:
- read_empresas
- create_empresas
- edit_empresas
- delete_empresas

ADMIN:
- manage_grupos
- manage_permissoes
- view_logs
```

## 💡 Casos de Uso Comuns

### Caso 1: Verificar se usuário pode fazer algo

```php
if (!validarPermissao('edit_clientes', $dadosUsuario)) {
    http_response_code(403);
    echo json_encode(["erro" => "Sem permissão"]);
    exit;
}
```

### Caso 2: Verificar se pode acessar recurso de empresa específica

```php
if (!validarAcessoRecurso('delete_clientes', $id_empresa_cliente, $dadosUsuario)) {
    http_response_code(403);
    echo json_encode(["erro" => "Sem acesso a esta empresa"]);
    exit;
}
```

### Caso 3: Super Admin automático

```php
// Não precisa fazer nada! O sistema detecta automaticamente:
// - Super Admin (is_sa=true) ✅
// - Permissão '*' (wildcard) ✅
// - Permissão específica ✅
```

### Caso 4: Filtrar lista por empresas de acesso

```php
if ($dadosUsuario['is_sa']) {
    $clientes = $cliente->listar(); // Todos
} else {
    $clientes = $cliente->listarPorEmpresas($dadosUsuario['empresas_acesso']);
}
```

## 🔍 Debug e Troubleshooting

Se precisar verificar o payload do JWT decodificado:

```php
// Em qualquer endpoint, logo após index.php:
error_log("JWT Decodificado: " . json_encode($dadosUsuario, JSON_PRETTY_PRINT));

// Verá algo como:
// {
//   "sub": 1,
//   "tipo": "colaborador",
//   "id_empresa": 5,
//   "id_grupo": 2,
//   "nome_grupo": "Gerente",
//   "is_sa": false,
//   "permissoes": ["read_clientes", "edit_clientes"],
//   "empresas_acesso": [5, 7],
//   "exp": 1234567890
// }
```

## 🎯 Performance

✅ **Todas as validações em memória**

- Sem queries ao BD durante validação de rotas
- Apenas 1 query ao BD no login (para buscar permissões, empresas, grupo)
- Consultas dentro dos endpoints são para obter dados do recurso (necessárias)

## 🔒 Segurança

✅ **Verificação de assinatura JWT** - Detecta tokens alterados
✅ **Expiração de token** - Token expira em 10 minutos (refresh necessário)
✅ **Escopo de dados** - Usuário não pode acessar registros de empresas que não é vinculado
✅ **Super Admin** - Flag `is_sa` não pode ser forjada (assinatura JWT)
✅ **Wildcard `*`** - Apenas Super Admins têm permissão '\*'

## ⚠️ Considerações

1. **Mudança de permissões**: Se alterar permissões de um grupo, usuários logados só verão mudanças após refresh de token
2. **Novos acessos**: Se vincular um colaborador a uma empresa, precisa renovar token
3. **Revogação**: Sempre use refresh_token para validar (você pode revogar no BD)
4. **HTTPS em Produção**: Use `secure: true` nos cookies
