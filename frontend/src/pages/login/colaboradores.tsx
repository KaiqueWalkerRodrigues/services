"use client";

import { useEffect, useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { realizarLoginEmpresa } from "../../services/auth";
import { Button } from "../../components/Button";

// ─── Theme tokens ────────────────────────────────────────────────────────────
type ThemeName = "dark" | "light";

const themes: Record<
  ThemeName,
  {
    bg: string;
    bgPattern: string;
    card: string;
    cardBorder: string;
    cardShadow: string;
    accentLine: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    label: string;
    inputBg: string;
    inputBorder: string;
    inputColor: string;
    inputPlaceholder: string;
    inputFocusBorder: string;
    inputFocusBg: string;
    inputFocusShadow: string;
    forgotColor: string;
    forgotHover: string;
    btnBg: string;
    btnColor: string;
    btnBorder: string;
    btnShadow: string;
    btnHoverShadow: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    footerText: string;
    footerLink: string;
  }
> = {
  dark: {
    bg: "#0a0a0a",
    bgPattern:
      "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 70%)",
    card: "rgba(14,14,14,0.98)",
    cardBorder: "rgba(255,255,255,0.07)",
    cardShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.9)",
    accentLine:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    eyebrow: "rgba(255,255,255,0.28)",
    title: "#ffffff",
    subtitle: "rgba(255,255,255,0.35)",
    label: "rgba(255,255,255,0.4)",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.09)",
    inputColor: "#ffffff",
    inputPlaceholder: "rgba(255,255,255,0.18)",
    inputFocusBorder: "rgba(255,255,255,0.45)",
    inputFocusBg: "rgba(255,255,255,0.07)",
    inputFocusShadow: "0 0 0 3px rgba(255,255,255,0.05)",
    forgotColor: "rgba(255,255,255,0.28)",
    forgotHover: "rgba(255,255,255,0.65)",
    btnBg: "transparent",
    btnColor: "#ffffff",
    btnBorder: "rgba(255,255,255,0.18)",
    btnShadow: "none",
    btnHoverShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
    badgeBg: "rgba(255,255,255,0.06)",
    badgeBorder: "rgba(255,255,255,0.1)",
    badgeText: "rgba(255,255,255,0.4)",
    footerText: "rgba(255,255,255,0.22)",
    footerLink: "rgba(255,255,255,0.5)",
  },
  light: {
    bg: "#f0f0f0",
    bgPattern:
      "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(0,0,0,0.03) 0%, transparent 70%)",
    card: "rgba(255,255,255,0.98)",
    cardBorder: "rgba(0,0,0,0.07)",
    cardShadow: "0 0 0 1px rgba(0,0,0,0.03), 0 40px 80px rgba(0,0,0,0.1)",
    accentLine:
      "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)",
    eyebrow: "rgba(0,0,0,0.3)",
    title: "#0a0a0a",
    subtitle: "rgba(0,0,0,0.35)",
    label: "rgba(0,0,0,0.4)",
    inputBg: "rgba(0,0,0,0.03)",
    inputBorder: "rgba(0,0,0,0.09)",
    inputColor: "#0a0a0a",
    inputPlaceholder: "rgba(0,0,0,0.2)",
    inputFocusBorder: "rgba(0,0,0,0.45)",
    inputFocusBg: "rgba(0,0,0,0.04)",
    inputFocusShadow: "0 0 0 3px rgba(0,0,0,0.05)",
    forgotColor: "rgba(0,0,0,0.28)",
    forgotHover: "rgba(0,0,0,0.65)",
    btnBg: "transparent",
    btnColor: "#0a0a0a",
    btnBorder: "rgba(0,0,0,0.18)",
    btnShadow: "none",
    btnHoverShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)",
    badgeBg: "rgba(0,0,0,0.04)",
    badgeBorder: "rgba(0,0,0,0.08)",
    badgeText: "rgba(0,0,0,0.38)",
    footerText: "rgba(0,0,0,0.25)",
    footerLink: "rgba(0,0,0,0.5)",
  },
};

const THEME: ThemeName = "dark"; // ← mude aqui para trocar o tema
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginColaborador() {
  const t = themes[THEME];
  
  // Estados para controlar a exibição condicional e os dados digitados
  const [mostrarCodigo, setMostrarCodigo] = useState(true);
  const [codigo, setCodigo] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("cod")) setMostrarCodigo(false);
  }, []);

  // Função que dispara o POST para o Backend
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Verificando acesso interno...');

    try {
      // Passa o usuário (ex: nome.sobrenome) no primeiro parâmetro esperado pela API
      const dados = await realizarLoginEmpresa(codigo, usuario, senha);
      
      toast.success(dados.mensagem || 'Acesso liberado!', { id: toastId });
      
      // setTimeout(() => {
      //   window.location.href = '/dashboard-empresa'; 
      // }, 1500);

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: t.bg }}
    >
      <Toaster position="top-right" />

      {/* Bottom glow — diferente do cliente (que tem o glow no topo) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: t.bgPattern }}
      />

      {/* Vertical lines texture — diferencia do dot grid do cliente */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            ${THEME === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)"} 0px,
            ${THEME === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)"} 1px,
            transparent 1px,
            transparent 40px
          )`,
          opacity: 0.6,
        }}
      />

      {/* System label top */}
      <div
        className="relative z-10 mb-8 text-center"
        style={{ animation: "fadeDown 0.6s cubic-bezier(.22,1,.36,1) both" }}
      >
        <p
          className="text-xs tracking-[0.35em] uppercase font-medium"
          style={{ color: t.eyebrow }}
        >
          Sistema de Serviço
        </p>
        <div
          className="mt-2 mx-auto h-px w-16"
          style={{ background: t.accentLine }}
        />
      </div>

      {/* Card — layout lateral diferente: badge de acesso no canto */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-8"
        style={{
          background: t.card,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: t.cardShadow,
          animation: "cardIn 0.7s 0.05s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Bottom accent — invertido em relação ao card de cliente */}
        <div
          className="absolute bottom-0 left-10 right-10 h-px"
          style={{ background: t.accentLine }}
        />

        {/* Header com badge de "Colaborador" */}
        <div className="mb-7" style={{ animation: "fadeUp 0.6s 0.12s both" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1
                className="text-3xl font-semibold"
                style={{ color: t.title, letterSpacing: "-0.02em" }}
              >
                Acesso Interno
              </h1>
              <p className="text-sm mt-1" style={{ color: t.subtitle }}>
                Área restrita a colaboradores
              </p>
            </div>
            {/* Badge diferenciador */}
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-medium tracking-wide mt-1"
              style={{
                background: t.badgeBg,
                border: `1px solid ${t.badgeBorder}`,
                color: t.badgeText,
                whiteSpace: "nowrap",
              }}
            >
              STAFF
            </span>
          </div>
          {/* Linha separadora sutil */}
          <div className="h-px w-full" style={{ background: t.cardBorder }} />
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          {/* Código — condicional mantido */}
          {mostrarCodigo && (
            <div style={{ animation: "fadeUp 0.6s 0.24s both" }}>
              <label
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: t.label }}
              >
                Código de acesso
              </label>
              <input
                type="text"
                name="codigo"
                required
                placeholder="000-000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150 font-mono"
                style={{
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  color: t.inputColor,
                  letterSpacing: "0.15em",
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${t.inputFocusBorder}`;
                  e.target.style.background = t.inputFocusBg;
                  e.target.style.boxShadow = t.inputFocusShadow;
                }}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${t.inputBorder}`;
                  e.target.style.background = t.inputBg;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {/* Usuário */}
          <div style={{ animation: "fadeUp 0.6s 0.18s both" }}>
            <label
              className="block text-xs font-medium mb-1.5 tracking-wide"
              style={{ color: t.label }}
            >
              Usuário
            </label>
            <input
              type="text"
              name="usuario"
              required
              placeholder="nome.sobrenome"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                background: t.inputBg,
                border: `1px solid ${t.inputBorder}`,
                color: t.inputColor,
              }}
              onFocus={(e) => {
                e.target.style.border = `1px solid ${t.inputFocusBorder}`;
                e.target.style.background = t.inputFocusBg;
                e.target.style.boxShadow = t.inputFocusShadow;
              }}
              onBlur={(e) => {
                e.target.style.border = `1px solid ${t.inputBorder}`;
                e.target.style.background = t.inputBg;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Senha */}
          <div
            style={{
              animation: `fadeUp 0.6s ${mostrarCodigo ? "0.3s" : "0.24s"} both`,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-xs font-medium tracking-wide"
                style={{ color: t.label }}
              >
                Senha
              </label>
              <a
                href="#"
                className="text-xs transition-colors duration-150"
                style={{ color: t.forgotColor }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = t.forgotHover)
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = t.forgotColor)
                }
              >
                Esqueceu?
              </a>
            </div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                background: t.inputBg,
                border: `1px solid ${t.inputBorder}`,
                color: t.inputColor,
              }}
              onFocus={(e) => {
                e.target.style.border = `1px solid ${t.inputFocusBorder}`;
                e.target.style.background = t.inputFocusBg;
                e.target.style.boxShadow = t.inputFocusShadow;
              }}
              onBlur={(e) => {
                e.target.style.border = `1px solid ${t.inputBorder}`;
                e.target.style.background = t.inputBg;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Submit — outline ao invés de filled (diferencia do cliente) */}
          <div
            style={{
              animation: `fadeUp 0.6s ${mostrarCodigo ? "0.36s" : "0.3s"} both`,
            }}
          >
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 mt-1"
              style={{
                background: t.btnBg,
                color: t.btnColor,
                border: `1px solid ${t.btnBorder}`,
                boxShadow: t.btnShadow,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  THEME === "dark"
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(0,0,0,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  THEME === "dark"
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(0,0,0,0.3)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = t.btnBg;
                (e.currentTarget as HTMLElement).style.borderColor =
                  t.btnBorder;
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "scale(0.99)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
            >
              Entrar
            </button>
          </div>
        </form>

        {/* Footer */}
        {/* <div
          className="mt-6 pt-5 text-center text-xs"
          style={{
            borderTop: `1px solid ${t.cardBorder}`,
            color: t.footerText,
            animation: "fadeUp 0.6s 0.48s both",
          }}
        >
          Acesso apenas para colaboradores cadastrados.{" "}
          <a
            href="#"
            className="transition-colors duration-150"
            style={{
              color: t.footerLink,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = t.title)
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = t.footerLink)
            }
          >
            Solicitar acesso
          </a>
        </div> */}
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: ${t.inputPlaceholder} !important; }
        input[name="codigo"] { font-family: ui-monospace, monospace; }
      `}</style>
    </div>
  );
}