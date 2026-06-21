# Integração Frontend - Usando RBAC com JWT

## 📱 Decodificar JWT no React/TypeScript

### 1. Função Auxiliar para Decodificar JWT

```typescript
// utils/jwt.ts

export interface DadosJWT {
  sub: number;
  tipo: string;
  id_empresa: number;
  id_grupo: number;
  nome_grupo: string;
  is_sa: boolean;
  permissoes: string[];
  empresas_acesso: number[];
  exp: number;
}

/**
 * Decodifica JWT manualmente (sem bibliotecas externas)
 * Nota: Não valida a assinatura (já foi validada no backend)
 */
export function decodificarJWT(token: string): DadosJWT | null {
  try {
    // JWT tem formato: header.payload.signature
    const partes = token.split(".");

    if (partes.length !== 3) {
      console.error("Token inválido");
      return null;
    }

    // Decodifica o payload (segunda parte)
    const payload = partes[1];

    // Base64url para Base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // Decodifica
    const jsonString = atob(base64);
    const dados = JSON.parse(jsonString);

    return dados as DadosJWT;
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

/**
 * Verifica se token está expirado
 */
export function tokenExpirado(token: string): boolean {
  const dados = decodificarJWT(token);

  if (!dados) return true;

  const agora = Math.floor(Date.now() / 1000);
  return dados.exp < agora;
}

/**
 * Retorna tempo até expiração em segundos
 */
export function tempoAteExpiracao(token: string): number {
  const dados = decodificarJWT(token);

  if (!dados) return 0;

  const agora = Math.floor(Date.now() / 1000);
  return Math.max(0, dados.exp - agora);
}
```

### 2. Context/Hook para Armazenar Dados do Usuário

```typescript
// context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DadosJWT, decodificarJWT } from '../utils/jwt';

interface AuthContextType {
  dadosUsuario: DadosJWT | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  temPermissao: (permissao: string) => boolean;
  temAcessoEmpresa: (idEmpresa: number) => boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [dadosUsuario, setDadosUsuario] = useState<DadosJWT | null>(null);

  // Carrega token do localStorage ao iniciar
  useEffect(() => {
    const tokenArmazenado = localStorage.getItem('access_token');
    if (tokenArmazenado) {
      const dados = decodificarJWT(tokenArmazenado);
      if (dados) {
        setTokenState(tokenArmazenado);
        setDadosUsuario(dados);
      }
    }
  }, []);

  const setToken = (novoToken: string | null) => {
    if (novoToken) {
      localStorage.setItem('access_token', novoToken);
      const dados = decodificarJWT(novoToken);
      setDadosUsuario(dados);
      setTokenState(novoToken);
    } else {
      localStorage.removeItem('access_token');
      setDadosUsuario(null);
      setTokenState(null);
    }
  };

  const logout = () => {
    setToken(null);
  };

  const temPermissao = (permissao: string): boolean => {
    if (!dadosUsuario) return false;

    // Super Admin tem tudo
    if (dadosUsuario.is_sa) return true;

    // Wildcard '*'
    if (dadosUsuario.permissoes.includes('*')) return true;

    // Permissão específica
    return dadosUsuario.permissoes.includes(permissao);
  };

  const temAcessoEmpresa = (idEmpresa: number): boolean => {
    if (!dadosUsuario) return false;

    // Super Admin acessa tudo
    if (dadosUsuario.is_sa) return true;

    // Verifica se empresa está no array de acesso
    return dadosUsuario.empresas_acesso.includes(idEmpresa);
  };

  const value: AuthContextType = {
    dadosUsuario,
    token,
    isAuthenticated: !!token && !!dadosUsuario,
    isSuperAdmin: dadosUsuario?.is_sa || false,
    temPermissao,
    temAcessoEmpresa,
    setToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
```

### 3. Usar em Componentes

```typescript
// components/Dashboard.tsx

import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const {
    dadosUsuario,
    isSuperAdmin,
    temPermissao,
    temAcessoEmpresa
  } = useAuth();

  if (!dadosUsuario) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {dadosUsuario.nome_grupo}!</h1>

      {isSuperAdmin && (
        <div className="admin-badge">
          🔒 Super Admin
        </div>
      )}

      <p>Permissões: {dadosUsuario.permissoes.join(', ')}</p>
      <p>Empresas de Acesso: {dadosUsuario.empresas_acesso.join(', ')}</p>

      {/* Mostrar botão só se tiver permissão */}
      {temPermissao('create_clientes') && (
        <button>➕ Criar Cliente</button>
      )}

      {/* Mostrar seção admin só para Super Admins */}
      {isSuperAdmin && (
        <section>
          <h2>Painel Administrativo</h2>
          <button>Gerenciar Permissões</button>
          <button>Gerenciar Grupos</button>
        </section>
      )}
    </div>
  );
}
```

## 🔐 Proteção de Rotas

```typescript
// components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredEmpresa?: number;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredEmpresa,
}: ProtectedRouteProps) {
  const { isAuthenticated, temPermissao, temAcessoEmpresa } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !temPermissao(requiredPermission)) {
    return <Navigate to="/access-denied" />;
  }

  if (requiredEmpresa && !temAcessoEmpresa(requiredEmpresa)) {
    return <Navigate to="/access-denied" />;
  }

  return <>{children}</>;
}
```

### Usar em Rotas

```typescript
// App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ListaClientes } from './pages/ListaClientes';
import { AdminPanel } from './pages/AdminPanel';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <ProtectedRoute requiredPermission="read_clientes">
              <ListaClientes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPermission="manage_permissoes">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

## 📤 Enviar Token em Requisições

```typescript
// services/api.ts

import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:81';

export function useApi() {
  const { token } = useAuth();

  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Adiciona token no header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.erro || 'Erro na requisição');
    }

    return response.json();
  };

  return { request };
}

// Uso em componentes
export function ListaClientes() {
  const { request } = useApi();
  const { temPermissao, temAcessoEmpresa } = useAuth();
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    if (!temPermissao('read_clientes')) {
      return; // Sem permissão
    }

    request('/api/clientes')
      .then(data => setClientes(data.dados))
      .catch(erro => console.error(erro));
  }, []);

  return (
    <ul>
      {clientes.map(cliente => (
        <li key={cliente.id_cliente}>
          {cliente.nome}

          {temAcessoEmpresa(cliente.id_empresa) && (
            <>
              {temPermissao('edit_clientes') && (
                <button>Editar</button>
              )}
              {temPermissao('delete_clientes') && (
                <button>Deletar</button>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
```

## 🎭 Componentes Condicionais por Permissão

```typescript
// components/Can.tsx

interface CanProps {
  do: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ do: permissoes, children, fallback }: CanProps) {
  const { temPermissao } = useAuth();

  const permissoesArray = Array.isArray(permissoes) ? permissoes : [permissoes];
  const temAcesso = permissoesArray.some(p => temPermissao(p));

  return temAcesso ? <>{children}</> : <>{fallback}</>;
}

// Uso
<Can do="create_clientes">
  <button>Criar Cliente</button>
  <span fallback="Sem permissão">
</Can>

// Múltiplas permissões (OU logic)
<Can do={['edit_clientes', 'delete_clientes']}>
  <div>Operações avançadas</div>
</Can>
```

## ⏰ Monitorar Expiração de Token

```typescript
// hooks/useTokenRefresh.ts

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tempoAteExpiracao } from '../utils/jwt';

export function useTokenRefresh() {
  const { token, setToken } = useAuth();

  useEffect(() => {
    if (!token) return;

    const verificarExpiracao = () => {
      const tempoRestante = tempoAteExpiracao(token);

      // Se faltam menos de 1 minuto, avisa ao usuário
      if (tempoRestante < 60 && tempoRestante > 0) {
        console.warn('Token expirando em breve. Faça refresh.');
        // Pode disparar um toast/notificação aqui
      }

      // Se expirou, faz logout
      if (tempoRestante <= 0) {
        setToken(null);
        window.location.href = '/login';
      }
    };

    // Verifica a cada 30 segundos
    const interval = setInterval(verificarExpiracao, 30000);

    return () => clearInterval(interval);
  }, [token, setToken]);
}

// Usar em App.tsx
export function App() {
  useTokenRefresh();

  return (
    // ... suas rotas
  );
}
```

## 🎯 Exemplo Completo: Página de Clientes

```typescript
// pages/Clientes.tsx

import { useAuth } from '../context/AuthContext';
import { useApi } from '../services/api';
import { Can } from '../components/Can';
import { useEffect, useState } from 'react';

export function Clientes() {
  const { temPermissao, temAcessoEmpresa } = useAuth();
  const { request } = useApi();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!temPermissao('read_clientes')) {
      setLoading(false);
      return;
    }

    request('/api/clientes')
      .then(res => {
        setClientes(res.dados || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  if (!temPermissao('read_clientes')) {
    return <div>❌ Sem permissão para ver clientes</div>;
  }

  return (
    <div>
      <h1>Clientes</h1>

      <Can do="create_clientes">
        <button onClick={() => {}}>➕ Novo Cliente</button>
      </Can>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Empresa</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id_cliente}>
              <td>{cliente.nome}</td>
              <td>{cliente.email}</td>
              <td>{cliente.id_empresa}</td>
              <td>
                {temAcessoEmpresa(cliente.id_empresa) && (
                  <>
                    <Can do="edit_clientes">
                      <button>Editar</button>
                    </Can>
                    <Can do="delete_clientes">
                      <button>Deletar</button>
                    </Can>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 📝 Checklist de Integração

- [ ] Criar arquivo `utils/jwt.ts`
- [ ] Criar `context/AuthContext.tsx`
- [ ] Atualizar `App.tsx` com `AuthProvider`
- [ ] Criar `components/ProtectedRoute.tsx`
- [ ] Atualizar serviço de API para adicionar token
- [ ] Testar login → verificar JWT no LocalStorage
- [ ] Testar proteção de rotas
- [ ] Testar visibilidade de botões por permissão
- [ ] Testar acesso por empresa

---

**Pronto para integrar RBAC no frontend!** 🚀
