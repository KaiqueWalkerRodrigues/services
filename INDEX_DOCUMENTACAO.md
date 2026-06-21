# 📚 Índice de Documentação - RBAC com Escopo de Dados

## 🚀 Começar Aqui

1. **[RBAC_VISUAL_SUMMARY.md](./RBAC_VISUAL_SUMMARY.md)** - Sumário visual da arquitetura (5 min)
2. **[README_RBAC.md](./backend/README_RBAC.md)** - Resumo executivo (10 min)
3. **[RBAC_CHECKLIST.md](./backend/RBAC_CHECKLIST.md)** - Checklist de implementação

## 📖 Documentação Técnica

### Backend

| Arquivo                                                                        | Conteúdo                                         | Público |
| ------------------------------------------------------------------------------ | ------------------------------------------------ | ------- |
| [backend/RBAC_ESCOPO_IMPLEMENTACAO.md](./backend/RBAC_ESCOPO_IMPLEMENTACAO.md) | Guia completo com exemplos práticos em endpoints | ✅      |
| [backend/RBAC_CHECKLIST.md](./backend/RBAC_CHECKLIST.md)                       | Checklist, estrutura BD, próximas ações          | ✅      |
| [backend/api/CLIENTES_EXEMPLO.php](./backend/api/CLIENTES_EXEMPLO.php)         | Implementação completa de endpoint               | ✅      |
| [backend/EXEMPLO_RBAC.md](./backend/EXEMPLO_RBAC.md)                           | Exemplos simples de uso                          | ✅      |
| [backend/README_RBAC.md](./backend/README_RBAC.md)                             | Quick start + recursos principais                | ✅      |

### Frontend

| Arquivo                                                                          | Conteúdo                                     | Público |
| -------------------------------------------------------------------------------- | -------------------------------------------- | ------- |
| [frontend/RBAC_FRONTEND_INTEGRATION.md](./frontend/RBAC_FRONTEND_INTEGRATION.md) | Guia completo de integração React/TypeScript | ✅      |

## 🔧 Implementação por Camada

### Backend - Classes Modificadas

#### `backend/class/Colaborador.php`

**Novos métodos para buscar dados de RBAC:**

```php
// Permissões do grupo
$permissoes = $colaborador->obterPermissoesGrupo($id_grupo);

// Flag is_sa + nome do grupo
$dados = $colaborador->obterDadosGrupo($id_grupo);
// Returns: ['is_sa' => bool, 'nome_grupo' => string]

// Empresas que colaborador acessa
$empresas = $colaborador->obterEmpresasAcesso($id_colaborador);
// Returns: [5, 7, 9]
```

#### `backend/class/AuthHelper.php`

**Funções de autorização em memória:**

```php
// Valida permissão (+ Super Admin + wildcard)
AuthHelper::usuarioTemPermissao($permissao, $dadosUsuario);

// Valida acesso a empresa
AuthHelper::usuarioTemAcessoEmpresa($idEmpresa, $dadosUsuario);

// Valida múltiplas empresas
AuthHelper::usuarioTemAcessoTodasEmpresas($idsEmpresas, $dadosUsuario);

// Combinado: permissão + escopo
AuthHelper::usuarioPodeAcessarRecurso($permissao, $idEmpresa, $dadosUsuario);
```

#### `backend/api/api.php`

**Funções auxiliares para endpoints:**

```php
// Usar em endpoints
validarPermissao('edit_clientes', $dadosUsuario);
validarAcessoEmpresa(5, $dadosUsuario);
validarAcessoRecurso('delete_clientes', $id_empresa_cliente, $dadosUsuario);
```

### Backend - Arquivos Modificados

#### `backend/api/auth/loginColaborador.php`

**Injeção de dados no JWT:**

```json
{
  "sub": 1,
  "tipo": "colaborador",
  "id_empresa": 5,
  "id_grupo": 2,
  "nome_grupo": "Gerente",
  "is_sa": false,
  "permissoes": ["read_clientes", "edit_clientes"],
  "empresas_acesso": [5, 7, 9],
  "exp": 1234567890
}
```

## 📋 Exemplos de Uso por Cenário

### 1. Validar Permissão Simples

```php
if (!validarPermissao('create_clientes', $dadosUsuario)) {
    http_response_code(403);
    echo json_encode(["erro" => "Sem permissão"]);
    exit;
}
```

**Arquivo:** [backend/RBAC_ESCOPO_IMPLEMENTACAO.md](./backend/RBAC_ESCOPO_IMPLEMENTACAO.md) → Seção "Casos de Uso"

### 2. Validar Permissão + Escopo

```php
if (!validarAcessoRecurso('edit_clientes', $id_empresa_cliente, $dadosUsuario)) {
    http_response_code(403);
    echo json_encode(["erro" => "Sem acesso"]);
    exit;
}
```

**Arquivo:** [backend/RBAC_ESCOPO_IMPLEMENTACAO.md](./backend/RBAC_ESCOPO_IMPLEMENTACAO.md) → Exemplo 1 & 2

### 3. Filtrar Lista por Empresas

```php
if ($dadosUsuario['is_sa']) {
    $dados = $cliente->listar();
} else {
    $dados = $cliente->listarPorEmpresas($dadosUsuario['empresas_acesso']);
}
```

**Arquivo:** [backend/RBAC_ESCOPO_IMPLEMENTACAO.md](./backend/RBAC_ESCOPO_IMPLEMENTACAO.md) → Seção "Filtrar Lista"

### 4. Implementar Endpoint Completo

Veja exemplo prático de clientes.php:

**Arquivo:** [backend/api/CLIENTES_EXEMPLO.php](./backend/api/CLIENTES_EXEMPLO.php)

### 5. Frontend - Decodificar JWT

```typescript
const dados = decodificarJWT(token);
console.log(dados.permissoes); // ["read_clientes", ...]
console.log(dados.is_sa); // false
console.log(dados.empresas_acesso); // [5, 7, 9]
```

**Arquivo:** [frontend/RBAC_FRONTEND_INTEGRATION.md](./frontend/RBAC_FRONTEND_INTEGRATION.md) → Seção 1

### 6. Frontend - Proteger Rota

```typescript
<ProtectedRoute requiredPermission="create_clientes">
  <NovosClientes />
</ProtectedRoute>
```

**Arquivo:** [frontend/RBAC_FRONTEND_INTEGRATION.md](./frontend/RBAC_FRONTEND_INTEGRATION.md) → Seção 2

### 7. Frontend - Componente Condicional

```typescript
<Can do="delete_clientes">
  <button>Deletar</button>
</Can>
```

**Arquivo:** [frontend/RBAC_FRONTEND_INTEGRATION.md](./frontend/RBAC_FRONTEND_INTEGRATION.md) → Seção "Componentes Condicionais"

## 🗂️ Estrutura Esperada do Banco de Dados

**Arquivo:** [backend/RBAC_CHECKLIST.md](./backend/RBAC_CHECKLIST.md) → Seção "Estrutura de Banco de Dados"

```sql
-- Grupos (com flag Super Admin)
CREATE TABLE grupos (
    id_grupo INT PRIMARY KEY,
    nome_grupo VARCHAR(100),
    is_sa BOOLEAN DEFAULT FALSE
);

-- Permissões
CREATE TABLE permissoes (
    id_permissao INT PRIMARY KEY,
    nome_permissao VARCHAR(100) UNIQUE
);

-- Vinculação de permissões a grupos
CREATE TABLE grupos_permissoes (
    id_grupo INT,
    id_permissao INT,
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo),
    FOREIGN KEY (id_permissao) REFERENCES permissoes(id_permissao)
);

-- Vinculação de colaboradores a empresas (opcional)
CREATE TABLE vinculacoes (
    id_colaborador INT,
    id_empresa INT,
    FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
);
```

## 🎯 Guias por Função

### Para Arquitetos/Tech Leads

1. [RBAC_VISUAL_SUMMARY.md](./RBAC_VISUAL_SUMMARY.md) - Arquitetura visual
2. [README_RBAC.md](./backend/README_RBAC.md) - Visão geral
3. [memory repo](./backend/RBAC_CHECKLIST.md) - Estrutura BD

### Para Desenvolvedores Backend

1. [RBAC_ESCOPO_IMPLEMENTACAO.md](./backend/RBAC_ESCOPO_IMPLEMENTACAO.md) - Exemplos práticos
2. [api/CLIENTES_EXEMPLO.php](./backend/api/CLIENTES_EXEMPLO.php) - Endpoint completo
3. [EXEMPLO_RBAC.md](./backend/EXEMPLO_RBAC.md) - Quick reference

### Para Desenvolvedores Frontend

1. [RBAC_FRONTEND_INTEGRATION.md](./frontend/RBAC_FRONTEND_INTEGRATION.md) - Guia completo React/TS
2. [README_RBAC.md](./backend/README_RBAC.md) - Entender o fluxo backend

### Para DevOps/Security

1. [RBAC_VISUAL_SUMMARY.md](./RBAC_VISUAL_SUMMARY.md) → Seção "Segurança"
2. [README_RBAC.md](./backend/README_RBAC.md) → Seção "Segurança"

## 🔍 Matriz de Referência Rápida

| Preciso de...             | Vou em...                                       |
| ------------------------- | ----------------------------------------------- |
| Entender a arquitetura    | RBAC_VISUAL_SUMMARY.md                          |
| Implementar um endpoint   | api/CLIENTES_EXEMPLO.php                        |
| Usar funções de validação | RBAC_ESCOPO_IMPLEMENTACAO.md → Casos de Uso     |
| Integrar no frontend      | frontend/RBAC_FRONTEND_INTEGRATION.md           |
| Proteger uma rota         | frontend/RBAC_FRONTEND_INTEGRATION.md → Seção 2 |
| Estruturar o BD           | RBAC_CHECKLIST.md → Estrutura BD                |
| Checklist completo        | RBAC_CHECKLIST.md                               |
| Exemplo simples           | EXEMPLO_RBAC.md                                 |
| Tudo rapidinho            | README_RBAC.md                                  |

## 📊 Gráfico de Interconexões

```
RBAC_VISUAL_SUMMARY.md (início)
    ├─ architecture diagram
    ├─ security layers
    └─ performance comparison
         ↓
README_RBAC.md (visão geral)
    ├─ quick start
    ├─ como usar
    └─ próximas ações
         ↓
    ┌─────────────────────────────────┬──────────────────────────┐
    ↓                                 ↓                          ↓
BACKEND                          FRONTEND              DATABASE
    │                                │                      │
RBAC_ESCOPO_...md          RBAC_FRONTEND...md      RBAC_CHECKLIST.md
    │                                │                      │
api/CLIENTES_EXEMPLO.php    (TypeScript + React)    (SQL + Schema)
    │                                │
EXEMPLO_RBAC.md            (Context + Hooks)
```

## ✅ Checklist de Leitura

### Dia 1: Entender

- [ ] Ler RBAC_VISUAL_SUMMARY.md (15 min)
- [ ] Ler README_RBAC.md (20 min)

### Dia 2: Implementar Backend

- [ ] Ler RBAC_ESCOPO_IMPLEMENTACAO.md (30 min)
- [ ] Estudar api/CLIENTES_EXEMPLO.php (20 min)
- [ ] Refatorar clientes.php (1h)
- [ ] Testar fluxo completo (30 min)

### Dia 3: Implementar Frontend

- [ ] Ler frontend/RBAC_FRONTEND_INTEGRATION.md (30 min)
- [ ] Criar utils/jwt.ts (15 min)
- [ ] Criar context/AuthContext.tsx (30 min)
- [ ] Testar integração (1h)

### Dia 4: Testes & Segurança

- [ ] Testar Super Admin (15 min)
- [ ] Testar múltiplas empresas (15 min)
- [ ] Testar casos de erro (30 min)
- [ ] Validar segurança (30 min)

## 🚀 Próximas Ações

**Imediato:**

- [ ] Refatorar endpoints com RBAC
- [ ] Integrar frontend
- [ ] Testar fluxo completo

**Curto Prazo:**

- [ ] Aplicar a loginCliente.php
- [ ] Refresh token com reavaliação
- [ ] Endpoint de gerenciamento de permissões

**Longo Prazo:**

- [ ] Auditoria de acessos
- [ ] Dashboard administrativo
- [ ] IP whitelisting

---

**Boa sorte com a implementação! 🎉**
