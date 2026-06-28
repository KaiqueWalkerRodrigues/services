import { useState, useEffect, type ReactNode } from "react";
import { type Usuario } from "../types/auth";
import { Outlet } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  // context/AuthProvider.tsx
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        // Tenta com o access_token atual
        let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        // Se expirou, tenta renovar com o refresh_token
        if (response.status === 401) {
          const refresh = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          if (refresh.ok) {
            // Tenta /me de novo com o novo access_token
            response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              credentials: "include",
            });
          }
        }

        const data = await response.json();
        if (data.sucesso) setUsuario(data.dados);
      } catch {
        // sem sessão
      } finally {
        setCarregando(false);
      }
    };

    verificarSessao();
  }, []);

  const login = (userData: Usuario) => {
    setUsuario(userData);
  };

  const logout = () => {
    setUsuario(null);
    // opcional: chamar endpoint de logout para limpar cookies
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children ?? <Outlet />}
    </AuthContext.Provider>
  );
}
