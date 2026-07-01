"use client";
import { useAuth } from "../../hooks/useAuth";
import { useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { realizarLoginEmpresa } from "../../api/auth";
import apiFetch from "../../config/apiFetch";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

export default function LoginColaborador() {
  const [codigo, setCodigo] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const auth = useAuth(); // Agora não quebra

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Verificando acesso...");

    try {
      const data = await realizarLoginEmpresa(codigo, usuario, senha);

      // Antes de buscar /me, tenta renovar a sessão e garantir que os cookies foram atualizados.
      try {
        await apiFetch.post("/api/auth/refresh");
      } catch {
        // Se não renovar, não faz buscar /me para evitar 401 imediato.
      }

      const meRes = await apiFetch.get("/api/auth/me");
      if (meRes.data.sucesso) {
        auth?.login(meRes.data.dados); // { id_colaborador, nome }
      }

      toast.success("Acesso liberado!", { id: toastId });

      setTimeout(() => {
        navigate(data.usuario.path ?? "/404");
      }, 800);
    } catch (error: any) {
      toast.error(error.message || "Erro de conexão", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0a]">
      <Toaster position="top-right" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 40px)",
        }}
      />

      <div className="relative z-10 mb-8 text-center animate-[fadeDown_0.6s_cubic-bezier(.22,1,.36,1)_both]">
        <p className="text-xs tracking-[0.35em] uppercase font-medium text-[rgba(255,255,255,0.28)]">
          Sistema de Serviço
        </p>
        <div className="mt-2 mx-auto h-px w-16 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]" />
      </div>

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-8 animate-[cardIn_0.7s_0.05s_cubic-bezier(.22,1,.36,1)_both]"
        style={{
          background: "rgba(14,14,14,0.98)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.9)",
        }}
      >
        <div className="absolute bottom-0 left-10 right-10 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]" />

        <div className="mb-7 animate-[fadeUp_0.6s_0.12s_both]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-3xl font-semibold text-white tracking-[-0.02em]">
                Acesso Interno
              </h1>
              <p className="text-sm mt-1 text-[rgba(255,255,255,0.35)]">
                Área restrita a colaboradores
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg font-medium tracking-wide text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)]">
              STAFF
            </span>
          </div>
          <div className="h-px w-full bg-[rgba(255,255,255,0.07)]" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="animate-[fadeUp_0.6s_0.24s_both]">
            <label className="block text-xs font-medium mb-1.5 tracking-wide text-[rgba(255,255,255,0.4)]">
              Código de acesso
            </label>
            <input
              type="text"
              required
              placeholder="000-000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono text-white transition-all duration-150 border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] focus:border-[rgba(255,255,255,0.45)] focus:bg-[rgba(255,255,255,0.07)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
            />
          </div>

          <div className="animate-[fadeUp_0.6s_0.18s_both]">
            <label className="block text-xs font-medium mb-1.5 tracking-wide text-[rgba(255,255,255,0.4)]">
              Usuário
            </label>
            <input
              type="text"
              required
              placeholder="nome.sobrenome"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white transition-all duration-150 border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] focus:border-[rgba(255,255,255,0.45)] focus:bg-[rgba(255,255,255,0.07)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
            />
          </div>

          <div className="animate-[fadeUp_0.6s_0.3s_both]">
            <label className="block text-xs font-medium mb-1.5 tracking-wide text-[rgba(255,255,255,0.4)]">
              Senha
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white transition-all duration-150 border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] focus:border-[rgba(255,255,255,0.45)] focus:bg-[rgba(255,255,255,0.07)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide text-white border border-[rgba(255,255,255,0.18)] transition-all duration-150 hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.35)] animate-[fadeUp_0.6s_0.36s_both]"
          >
            Entrar
          </button>
        </form>
      </div>

      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
