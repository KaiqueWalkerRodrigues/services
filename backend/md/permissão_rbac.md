# Exemplo Prático: Usando RBAC com JWT

## Cenário: Controlar acesso em um endpoint específico

### 1. Registrar a rota no `index.php` com permissões

```php
$rotas = [
    'api/usuarios' => [
        'file' => 'usuarios.php',
        'login' => [
            'GET' => true,    // Requer login
            'POST' => true,   // Requer login
            'PUT' => true,
            'DELETE' => true,
            'default' => true
        ],
        'permissoes' => ['manage_users']  // Requer esta permissão
    ],
];
```

### 2. No seu handler (`backend/api/usuarios.php`)

Você terá acesso às informações do usuário via variáveis do `index.php`:

```php
<?php
require("api/api.php");

// Variáveis disponíveis do index.php:
// - $_SERVER['API_SUBPATH']: parte da URL após a rota base
// - $dadosUsuario: array decodificado do JWT com:
//   - 'sub': ID do usuário
//   - 'tipo': tipo de usuário ('colaborador', 'cliente')
//   - 'id_empresa': empresa do usuário
//   - 'id_grupo': grupo do usuário
//   - 'permissoes': array de strings com as permissões

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        if ($_SERVER['API_SUBPATH'] === '123/permissoes') {
            // Endpoint customizado: GET /api/usuarios/123/permissoes
            echo json_encode(['permissoes' => $dadosUsuario['permissoes']]);
            break;
        }

        // GET padrão: listar todos os usuários
        echo json_encode(['usuarios' => getAllUsers()]);
        break;

    case 'POST':
        // Criar novo usuário (já validou permissão 'manage_users' no index.php)
        $data = json_decode(file_get_contents("php://input"));
        createUser($data);
        break;

    case 'DELETE':
        // Deletar usuário
        $data = json_decode(file_get_contents("php://input"));
        deleteUser($data->id);
        break;
}
```

## 3. Validações Granulares Dentro do Handler

Se você precisar de validações mais específicas dentro do handler:

```php
<?php
// Você já tem acesso a $dadosUsuario (extraído do JWT pelo index.php)

// Validar uma permissão específica
if (in_array('admin_access', $dadosUsuario['permissoes'], true)) {
    // Usuário tem acesso a admin
}

// Usar AuthHelper para validações mais complexas
if (AuthHelper::usuarioPossuiAlgumaPermissao($dadosUsuario, ['delete_users', 'delete_all'])) {
    // Pode deletar
}

if (AuthHelper::usuarioPossuiTodasPermissoes($dadosUsuario, ['create_users', 'edit_users'])) {
    // Pode fazer operações avançadas
}
```

## 4. Exemplo Completo: Endpoint com Lógica RBAC

```php
<?php
require("api/api.php");

$metodo = $_SERVER['REQUEST_METHOD'];
$subpath = $_SERVER['API_SUBPATH'] ?? '';

switch ($metodo) {
    case 'GET':
        if (strpos($subpath, 'perfil/') === 0) {
            $userId = str_replace('perfil/', '', $subpath);

            // Validar se pode acessar o perfil de outro usuário
            if ($userId !== $dadosUsuario['sub'] &&
                !in_array('view_users', $dadosUsuario['permissoes'], true)) {
                http_response_code(403);
                echo json_encode(['erro' => 'Sem permissão para ver outros perfis']);
                exit;
            }

            echo json_encode(getUserProfile($userId));
        }
        break;

    case 'PUT':
        // Validação já ocorreu em index.php, mas você pode refinar aqui
        $data = json_decode(file_get_contents("php://input"));

        if ($data->id !== $dadosUsuario['sub'] &&
            !in_array('edit_users', $dadosUsuario['permissoes'], true)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Só pode editar sua conta']);
            exit;
        }

        updateUser($data->id, $data);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));

        if (!AuthHelper::usuarioPossuiPermissao($dadosUsuario, 'delete_users')) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para deletar']);
            exit;
        }

        deleteUser($data->id);
        break;
}
```

## 5. Estrutura de Permissões Recomendada

```
# Permissões de Usuários
- create_users
- read_users
- update_users
- delete_users

# Permissões de Relatórios
- create_reports
- read_reports
- export_reports

# Permissões de Sistema
- admin_access
- view_logs
- manage_groups
- manage_permissions
```

## Resumo

- ✅ Permissões são injetadas UMA VEZ no login
- ✅ Cada requisição verifica permissões SEM acessar BD
- ✅ Comparação é feita em memória (rápido)
- ✅ Pode fazer validações extras dentro do handler se precisar
- ⚠️ Lembre-se: token é válido até expiração, mudanças de permissão só refletem após refresh
