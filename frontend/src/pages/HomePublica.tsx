import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scissors, User, ArrowRight, Sparkles } from "lucide-react";

/**
 * Página pública de entrada.
 * Sem Sidebar — layout independente do painel logado.
 *
 * Rotas:
 *  - "Criar conta"        -> /registro
 *  - "Sou Cliente"        -> /loginCliente
 *  - "Sou Colaborador"    -> /loginColaborador
 */
export default function HomePublica() {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070b] text-zinc-100">
      {/* Glow ambiente */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-14rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[130px]"
      />

      {/* Marca */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <Scissors className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] text-white">
            BARB
          </span>
        </div>

        <Link
          to="/registro"
          className="group flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
        >
          Criar conta
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-10 text-center sm:pt-16">
        <span
          className={`mb-5 flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 transition-all duration-700 ${
            montado ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <Sparkles className="h-3 w-3 text-violet-400" />
          Sistema de serviços
        </span>

        <h1
          className={`text-4xl font-bold leading-[1.1] text-white transition-all duration-700 sm:text-5xl ${
            montado ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: "80ms" }}
        >
          Barb Serviços
        </h1>

        <p
          className={`mt-4 max-w-md text-sm text-zinc-400 transition-all duration-700 ${
            montado ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: "160ms" }}
        >
          Agende, acompanhe e gerencie atendimentos em um só lugar. Escolha como
          você quer entrar.
        </p>

        {/* Linha de corte — divisor assinatura */}
        <div
          className={`relative mt-10 h-px w-full max-w-sm overflow-hidden bg-white/5 transition-opacity duration-700 ${
            montado ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "260ms" }}
        >
          <span className="corte-trilho absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-violet-400/80 to-transparent" />
        </div>

        {/* Cards de acesso */}
        <div
          className={`mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 transition-all duration-700 ${
            montado ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "320ms" }}
        >
          {/* Cliente */}
          <Link
            to="/loginCliente"
            className="acesso-card group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-left transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Sou Cliente
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Agende horários e acompanhe seus atendimentos.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1.5 text-xs font-medium text-emerald-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              Entrar como cliente
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Colaborador */}
          <Link
            to="/loginColaborador"
            className="acesso-card group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 text-left shadow-lg shadow-violet-950/20 transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-500/[0.08]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Sou Colaborador
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Acesse sua agenda, comissões e fila do dia.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1.5 text-xs font-medium text-violet-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              Entrar como colaborador
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <p
          className={`mt-8 text-xs text-zinc-500 transition-opacity duration-700 ${
            montado ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "420ms" }}
        >
          Ainda não tem conta?{" "}
          <Link
            to="/registro"
            className="font-medium text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
          >
            Cadastre-se gratuitamente
          </Link>
        </p>
      </main>

      <style>{`
        @keyframes corte-trilho {
          0%   { transform: translateX(-120%); }
          60%  { transform: translateX(320%); }
          100% { transform: translateX(320%); }
        }
        .corte-trilho {
          animation: corte-trilho 2.6s ease-in-out infinite;
          animation-delay: .6s;
        }
        @media (prefers-reduced-motion: reduce) {
          .corte-trilho { animation: none; }
        }
        .acesso-card:focus-visible {
          outline: 2px solid rgba(167,139,250,.6);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
