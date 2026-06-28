"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;
    // Dentro do useEffect no Logout.tsx
    const realizarLogout = async () => {
      const toastId = toast.loading("Encerrando sessão...");

      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include", // Isso envia os cookies automaticamente para o PHP
          headers: {
            "Content-Type": "application/json",
          },
          // Se o seu PHP não precisa mais de nada no body, pode remover o JSON.stringify
          body: JSON.stringify({
            refresh_token: document.cookie.includes("refresh_token")
              ? "excluir"
              : null,
          }),
        });

        logout();
        toast.success("Sessão encerrada!", { id: toastId });
      } catch (error) {
        logout();
        toast.error("Erro ao encerrar sessão", { id: toastId });
      }
    };

    realizarLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <Toaster position="top-right" />
      <div className="text-center">
        <p className="animate-pulse">Encerrando...</p>
      </div>
    </div>
  );
}
