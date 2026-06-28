import { useState, useEffect, type ReactNode } from "react";
import { type Usuario } from "../types/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        // Tentar renovar token se o primeiro falhar
        if (response.status === 401) {
          const refresh = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (!refresh.ok) {
            setCarregando(false);
            return;
          }

          response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: "include",
          });
        }

        if (!response.ok) {
          setCarregando(false);
          return;
        }

        const data = await response.json();
        if (data.sucesso) {
          setUsuario(data.dados);
        }
      } catch {
        // Erro na conexão
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
    navigate("/loginColaborador");
  };

  if (carregando) {
    // Você pode substituir por um componente de loading centralizado
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        Carregando...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      <Outlet />
    </AuthContext.Provider>
  );
}
