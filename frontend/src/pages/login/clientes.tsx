"use client";

import { useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { realizarLoginCliente } from "../../services/auth";

// ─── Theme tokens ────────────────────────────────────────────────────────────
// To swap themes, change THEME below to "dark" or "light".
// Add new themes by extending the `themes` object.

type ThemeName = "dark" | "light" | "manicure";

const themes: Record<
  ThemeName,
  {
    bg: string;
    bgPattern: string;
    card: string;
    cardBorder: string;
    cardShadow: string;
    topAccent: string;
    eyebrow: string;
    title: string;
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
    btnShadow: string;
    btnHoverShadow: string;
    dividerLine: string;
    dividerText: string;
    googleBg: string;
    googleBorder: string;
    googleColor: string;
    googleHoverBg: string;
    footerText: string;
    footerLink: string;
    footerLinkBorder: string;
  }
> = {
  dark: {
    bg: "#0a0a0a",
    bgPattern:
      "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,255,255,0.04) 0%, transparent 70%)",
    card: "rgba(18,18,18,0.98)",
    cardBorder: "rgba(255,255,255,0.08)",
    cardShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8)",
    topAccent:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
    eyebrow: "rgba(255,255,255,0.3)",
    title: "#ffffff",
    label: "rgba(255,255,255,0.45)",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.1)",
    inputColor: "#ffffff",
    inputPlaceholder: "rgba(255,255,255,0.2)",
    inputFocusBorder: "rgba(255,255,255,0.5)",
    inputFocusBg: "rgba(255,255,255,0.07)",
    inputFocusShadow: "0 0 0 3px rgba(255,255,255,0.06)",
    forgotColor: "rgba(255,255,255,0.3)",
    forgotHover: "rgba(255,255,255,0.7)",
    btnBg: "#ffffff",
    btnColor: "#0a0a0a",
    btnShadow: "0 4px 20px rgba(255,255,255,0.08)",
    btnHoverShadow: "0 8px 30px rgba(255,255,255,0.14)",
    dividerLine: "rgba(255,255,255,0.08)",
    dividerText: "rgba(255,255,255,0.25)",
    googleBg: "transparent",
    googleBorder: "rgba(255,255,255,0.1)",
    googleColor: "rgba(255,255,255,0.65)",
    googleHoverBg: "rgba(255,255,255,0.05)",
    footerText: "rgba(255,255,255,0.25)",
    footerLink: "rgba(255,255,255,0.55)",
    footerLinkBorder: "rgba(255,255,255,0.2)",
  },
  light: {
    bg: "#f4f4f4",
    bgPattern:
      "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,0,0,0.04) 0%, transparent 70%)",
    card: "rgba(255,255,255,0.98)",
    cardBorder: "rgba(0,0,0,0.08)",
    cardShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 40px 80px rgba(0,0,0,0.12)",
    topAccent:
      "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
    eyebrow: "rgba(0,0,0,0.35)",
    title: "#0a0a0a",
    label: "rgba(0,0,0,0.45)",
    inputBg: "rgba(0,0,0,0.03)",
    inputBorder: "rgba(0,0,0,0.1)",
    inputColor: "#0a0a0a",
    inputPlaceholder: "rgba(0,0,0,0.2)",
    inputFocusBorder: "rgba(0,0,0,0.5)",
    inputFocusBg: "rgba(0,0,0,0.04)",
    inputFocusShadow: "0 0 0 3px rgba(0,0,0,0.06)",
    forgotColor: "rgba(0,0,0,0.3)",
    forgotHover: "rgba(0,0,0,0.7)",
    btnBg: "#0a0a0a",
    btnColor: "#ffffff",
    btnShadow: "0 4px 20px rgba(0,0,0,0.15)",
    btnHoverShadow: "0 8px 30px rgba(0,0,0,0.25)",
    dividerLine: "rgba(0,0,0,0.08)",
    dividerText: "rgba(0,0,0,0.3)",
    googleBg: "transparent",
    googleBorder: "rgba(0,0,0,0.1)",
    googleColor: "rgba(0,0,0,0.6)",
    googleHoverBg: "rgba(0,0,0,0.04)",
    footerText: "rgba(0,0,0,0.3)",
    footerLink: "rgba(0,0,0,0.55)",
    footerLinkBorder: "rgba(0,0,0,0.2)",
  },
  manicure: {
    bg: "#fdf8f9",
    bgPattern:
      "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(219, 112, 147, 0.08) 0%, transparent 70%)",
    card: "rgba(255,255,255,0.95)",
    cardBorder: "rgba(219, 112, 147, 0.15)",
    cardShadow:
      "0 0 0 1px rgba(219, 112, 147, 0.05), 0 30px 60px rgba(219, 112, 147, 0.08)",
    topAccent:
      "linear-gradient(90deg, transparent, rgba(212, 93, 127, 0.4), transparent)",
    eyebrow: "rgba(176, 58, 98, 0.6)",
    title: "#4a152b",
    label: "rgba(74, 21, 43, 0.65)",
    inputBg: "rgba(253, 248, 249, 0.7)",
    inputBorder: "rgba(219, 112, 147, 0.25)",
    inputColor: "#4a152b",
    inputPlaceholder: "rgba(176, 58, 98, 0.35)",
    inputFocusBorder: "#d45d7f",
    inputFocusBg: "#ffffff",
    inputFocusShadow: "0 0 0 3px rgba(212, 93, 127, 0.15)",
    forgotColor: "rgba(212, 93, 127, 0.8)",
    forgotHover: "#b03a62",
    btnBg: "#d45d7f",
    btnColor: "#ffffff",
    btnShadow: "0 4px 15px rgba(212, 93, 127, 0.3)",
    btnHoverShadow: "0 8px 25px rgba(212, 93, 127, 0.45)",
    dividerLine: "rgba(219, 112, 147, 0.15)",
    dividerText: "rgba(176, 58, 98, 0.45)",
    googleBg: "transparent",
    googleBorder: "rgba(219, 112, 147, 0.25)",
    googleColor: "rgba(176, 58, 98, 0.8)",
    googleHoverBg: "rgba(253, 248, 249, 1)",
    footerText: "rgba(176, 58, 98, 0.6)",
    footerLink: "#d45d7f",
    footerLinkBorder: "rgba(212, 93, 127, 0.3)",
  },
};

const THEME: ThemeName = "dark"; // ← mude aqui para trocar o tema
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginCliente() {
  const t = themes[THEME];

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Verificando credenciais...');

    try {
      const dados = await realizarLoginCliente(email, senha);
      toast.success(dados.mensagem || 'Login efetuado com sucesso!', { id: toastId });
      
      // setTimeout(() => {
      //   window.location.href = '/dashboard'; 
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

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: t.bgPattern }}
      />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${THEME === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.5,
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
          style={{ background: t.topAccent }}
        />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8"
        style={{
          background: t.card,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: t.cardShadow,
          animation: "cardIn 0.7s 0.05s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-10 right-10 h-px"
          style={{ background: t.topAccent }}
        />

        {/* Header */}
        <div className="mb-7" style={{ animation: "fadeUp 0.6s 0.12s both" }}>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: t.title, letterSpacing: "-0.02em" }}
          >
            Acessar
          </h1>
          <p className="text-sm mt-1" style={{ color: t.eyebrow }}>
            Efetue login para continuar
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          {/* Email */}
          <div style={{ animation: "fadeUp 0.6s 0.18s both" }}>
            <label
              className="block text-xs font-medium mb-1.5 tracking-wide"
              style={{ color: t.label }}
            >
              E-mail
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Password */}
          <div style={{ animation: "fadeUp 0.6s 0.24s both" }}>
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

          {/* Submit */}
          <div style={{ animation: "fadeUp 0.6s 0.3s both" }}>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150"
              style={{
                background: t.btnBg,
                color: t.btnColor,
                boxShadow: t.btnShadow,
                border: "none",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  t.btnHoverShadow;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = t.btnShadow;
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

        {/* Divider */}
        <div
          className="flex items-center gap-3 my-5"
          style={{ animation: "fadeUp 0.6s 0.36s both" }}
        >
          <div className="flex-1 h-px" style={{ background: t.dividerLine }} />
          <span className="text-xs" style={{ color: t.dividerText }}>
            ou
          </span>
          <div className="flex-1 h-px" style={{ background: t.dividerLine }} />
        </div>

        {/* Google login */}
        <div style={{ animation: "fadeUp 0.6s 0.42s both" }}>
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-150"
            style={{
              background: t.googleBg,
              border: `1px solid ${t.googleBorder}`,
              color: t.googleColor,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                t.googleHoverBg;
              (e.currentTarget as HTMLElement).style.borderColor =
                t.inputFocusBorder;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = t.googleBg;
              (e.currentTarget as HTMLElement).style.borderColor =
                t.googleBorder;
            }}
          >
            {/* Google "G" logo */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar com Google
          </button>
        </div>

        {/* Footer */}
        <div
          className="mt-6 text-center text-xs"
          style={{
            color: t.footerText,
            animation: "fadeUp 0.6s 0.48s both",
          }}
        >
          Não tem conta?{" "}
          <a
            href="/registro"
            className="transition-colors duration-150"
            style={{
              color: t.footerLink,
              borderBottom: `1px solid ${t.footerLinkBorder}`,
              paddingBottom: 1,
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = t.title)
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = t.footerLink)
            }
          >
            Criar conta
          </a>
        </div>
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
      `}</style>
    </div>
  );
}