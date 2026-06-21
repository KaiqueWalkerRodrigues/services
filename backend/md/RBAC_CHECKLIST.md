# RBAC + Escopo de Dados - Checklist de Implementação

## ✅ Implementado no Backend

- [x] **Classe `Colaborador`** - Métodos para buscar dados de autorização:
  - [x] `obterPermissoesGrupo()` - Permissões do grupo
  - [x] `obterDadosGrupo()` - Flag is_sa + nome_grupo
  - [x] `obterEmpresasAcesso()` - Empresas de acesso (vinculacoes + fallback)

- [x] **Classe `AuthHelper`** - Funções de validação (sem BD):
  - [x] `usuarioTemPermissao()` - Valida permissão + Super Admin + wildcard
  - [x] `usuarioTemAcessoEmpresa()` - Valida escopo de empresa
  - [x] `usuarioTemAcessoTodasEmpresas()` - Múltiplas empresas
  - [x] `usuarioPodeAcessarRecurso()` - Permissão + Escopo combinado

- [x] **Arquivo `api.php`** - Funções auxiliares para endpoints:
  - [x] `validarAcessoRecurso()` - Uso em endpoints
  - [x] `validarPermissao()` - Só permissão
  - [x] `validarAcessoEmpresa()` - Só empresa

- [x] **Login `loginColaborador.php`** - JWT com dados completos:
  - [x] is_sa injetado
  - [x] permissões injetadas
  - [x] empresas_acesso injetadas
  - [x] Retorna dados na resposta

- [x] **JWT Payload** - Estrutura pronta:
  ```json
  {
    "sub": "id_colaborador",
    "tipo": "colaborador",
    "id_empresa": "empresa_principal",
    "id_grupo": "id_do_grupo",
    "nome_grupo": "nome_do_grupo",
    "is_sa": "boolean",
    "permissoes": "array de strings",
    "empresas_acesso": "array de integers",
    "exp": "timestamp"
  }
  ```

## ⚠️ Pendente no Backend

- [ ] Aplicar mesmo padrão ao `loginCliente.php`:
  - [ ] `obterPermissoesGrupo()` na classe `Cliente`
  - [ ] `obterDadosGrupo()` na classe `Cliente`
  - [ ] `obterEmpresasAcesso()` na classe `Cliente`
  - [ ] Refatorar login para injetar dados

- [ ] Atualizar endpoints para usar RBAC + Escopo:
  - [ ] `clientes.php` - Implementar validações em GET/POST/PUT/DELETE
  - [ ] `colaboradores.php` - Idem
  - [ ] `empresas.php` - Idem

- [ ] Métodos auxiliares nas classes:
  - [ ] `Cliente::listarPorEmpresas($idsEmpresas)` - Filtrar por escopo
  - [ ] `Colaborador::listarPorEmpresas($idsEmpresas)` - Filtrar por escopo
  - [ ] `Empresa::listarPorIds($idsEmpresas)` - Filtrar por escopo

- [ ] Endpoint de refresh token:
  - [ ] Reavalia permissões + empresas de acesso ao renovar
  - [ ] Invalida refresh token se credenciais foram alteradas

## 📋 Estrutura de Banco de Dados (Esperada)

### Tabela: `grupos`

```sql
CREATE TABLE grupos (
    id_grupo INT PRIMARY KEY AUTO_INCREMENT,
    nome_grupo VARCHAR(100) NOT NULL,
    is_sa BOOLEAN DEFAULT FALSE,  -- ← Flag de Super Admin
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `permissoes`

```sql
CREATE TABLE permissoes (
    id_permissao INT PRIMARY KEY AUTO_INCREMENT,
    nome_permissao VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `grupos_permissoes`

```sql
CREATE TABLE grupos_permissoes (
    id_grupo_permissao INT PRIMARY KEY AUTO_INCREMENT,
    id_grupo INT NOT NULL,
    id_permissao INT NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo),
    FOREIGN KEY (id_permissao) REFERENCES permissoes(id_permissao)
);
```

### Tabela: `vinculacoes` (Opcional - permite múltiplas empresas)

```sql
CREATE TABLE vinculacoes (
    id_vinculacao INT PRIMARY KEY AUTO_INCREMENT,
    id_colaborador INT NOT NULL,
    id_empresa INT NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
);
```

### Tabela: `colaboradores` (Atualizada)

```sql
CREATE TABLE colaboradores (
    id_colaborador INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa INT NOT NULL,
    id_grupo INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo)
);
```

## 🚀 Próximas Ações Recomendadas

### 1. Implementar nos Endpoints (Prioridade Alta)

```
Começar por: clientes.php
├─ GET / → Listar com escopo
├─ GET /:id → Validar escopo
├─ POST → Validar empresa + permissão
├─ PUT → Validar escopo + permissão
└─ DELETE → Validar escopo + permissão
```

### 2. Refatorar Classe Cliente (Prioridade Alta)

```php
// Adicionar métodos similares à Colaborador
$cliente->obterPermissoesGrupo($id_grupo);
$cliente->obterDadosGrupo($id_grupo);
$cliente->obterEmpresasAcesso($id_colaborador);
$cliente->listarPorEmpresas($idsEmpresas);
```

### 3. Frontend - Consumir dados do JWT (Prioridade Média)

```typescript
// Em auth.ts ou context
const dadosJWT = decodificarJWT(token);
console.log(dadosJWT.permissoes); // Array de permissões
console.log(dadosJWT.is_sa); // Boolean
console.log(dadosJWT.empresas_acesso); // Array de IDs
```

### 4. UI - Controlar visibilidade de botões (Prioridade Média)

```tsx
// Em componentes
{
  usuarioDados.is_sa && <AdminButton />;
}
{
  usuarioDados.permissoes.includes("delete_clientes") && <DeleteButton />;
}
```

## 🔒 Segurança - Checklist Final

- [x] Assinatura JWT com HMAC-SHA256
- [x] Expiração de token (10 minutos)
- [x] Refresh token com validade longa (30 dias)
- [x] Flag is_sa não pode ser forjada (JWT assinado)
- [x] Validação em memória (sem BD por requisição)
- [ ] Usar HTTPS em produção
- [ ] Cookie httponly + secure em produção
- [ ] Revogar refresh token ao logout
- [ ] Validar IP em refresh token (proteção adicional)

## 📚 Documentos de Referência

- `RBAC_ESCOPO_IMPLEMENTACAO.md` - Guia detalhado com exemplos práticos
- `/memories/repo/rbac-jwt-implementation.md` - Documentação técnica completa
- `EXEMPLO_RBAC.md` - Exemplos simples de uso

## 💬 Uso Comum em Endpoints

### Validar Permissão Simples

```php
if (!validarPermissao('edit_clientes', $dadosUsuario)) {
    http_response_code(403);
    echo json_encode(["erro" => "Sem permissão"]);
    exit;
}
```

### Validar Permissão + Escopo

```php
if (!validarAcessoRecurso('delete_clientes', $id_empresa_cliente, $dadosUsuario)) {
    http_response_code(403);
    echo json_encode(["erro" => "Sem acesso a este cliente"]);
    exit;
}
```

### Filtrar por Empresas de Acesso

```php
if ($dadosUsuario['is_sa']) {
    $dados = $cliente->listar(); // Todos
} else {
    $dados = $cliente->listarPorEmpresas($dadosUsuario['empresas_acesso']);
}
```
