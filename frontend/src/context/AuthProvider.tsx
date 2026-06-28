// AuthProvider.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { type Usuario } from "../types/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const navigate = useNavigate();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const deslogar = useCallback(() => {
    setUsuario(null);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    navigate("/loginColaborador");
  }, [navigate]);

  const tentarRenovar = useCallback(async (): Promise<boolean> => {
    const refresh = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return refresh.ok;
  }, []);

  const buscarUsuario = useCallback(async (): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: "include",
    });

    if (response.status === 401) {
      const renovado = await tentarRenovar();
      if (!renovado) return false;

      const retry = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (!retry.ok) return false;

      const data = await retry.json();
      if (data.sucesso) setUsuario(data.dados);
      return true;
    }

    if (!response.ok) return false;

    const data = await response.json();
    if (data.sucesso) setUsuario(data.dados);
    return true;
  }, [tentarRenovar]);

  // Verificação inicial
  useEffect(() => {
    buscarUsuario().finally(() => setCarregando(false));
  }, [buscarUsuario]);

  // Renovação automática a cada 9 minutos enquanto estiver logado
  useEffect(() => {
    if (!usuario) return;

    refreshIntervalRef.current = setInterval(
      async () => {
        const renovado = await tentarRenovar();
        if (!renovado) deslogar();
      },
      9 * 60 * 1000,
    );

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [usuario, tentarRenovar, deslogar]);

  const login = useCallback((userData: Usuario) => {
    setUsuario(userData);
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        Carregando...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, login, logout: deslogar }}
    >
      <Outlet />
    </AuthContext.Provider>
  );
}
