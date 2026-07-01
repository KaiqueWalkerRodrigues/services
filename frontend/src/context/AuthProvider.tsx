import { useState, useEffect, useCallback, useRef } from "react";
import { type Usuario } from "../types/auth";
import { Outlet, useNavigate } from "react-router-dom";
import apiFetch from "../config/apiFetch";
import { AuthContext } from "./AuthContext";

export function AuthProvider() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const navigate = useNavigate();
  const initialFetchRef = useRef(false);

  const deslogar = useCallback(() => {
    setUsuario(null);
    navigate("/loginColaborador");
  }, [navigate]);

  const renovarSessao = useCallback(async (): Promise<boolean> => {
    try {
      await apiFetch.post("/api/auth/refresh");
      return true;
    } catch {
      return false;
    }
  }, []);

  const buscarUsuario = useCallback(async (): Promise<void> => {
    try {
      const response = await apiFetch.get("/api/auth/me");
      if (response.data.sucesso) {
        setUsuario(response.data.dados);
      }
    } catch {
      setUsuario(null);
    }
  }, []);

  // Inicialização segura
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;

    (async () => {
      const renovado = await renovarSessao();
      if (renovado) {
        await buscarUsuario();
      } else {
        setUsuario(null);
      }
      setCarregando(false);
    })();
  }, [buscarUsuario, renovarSessao]);

  // Mantemos o intervalo apenas como um "keep-alive" preventivo
  useEffect(() => {
    if (!usuario) return;

    const interval = setInterval(
      async () => {
        try {
          await apiFetch.post("/api/auth/refresh");
        } catch {
          deslogar();
        }
      },
      9 * 60 * 1000,
    ); // 9 minutos

    return () => clearInterval(interval);
  }, [usuario, deslogar]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        Carregando...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        login: (u) => setUsuario(u),
        logout: deslogar,
      }}
    >
      <Outlet />
    </AuthContext.Provider>
  );
}
