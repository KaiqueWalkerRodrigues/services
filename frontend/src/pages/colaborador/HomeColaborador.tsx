import {
  CalendarDays,
  Clock,
  Scissors,
  DollarSign,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../../components/Colaborador/SidebarColaborador";

interface Atendimento {
  id: string;
  cliente: string;
  servico: string;
  horario: string;
  status: "confirmado" | "em-andamento" | "concluido";
}

const proximosAtendimentos: Atendimento[] = [
  {
    id: "1",
    cliente: "Carlos Eduardo",
    servico: "Corte Conectado + Barboterapia",
    horario: "14:00",
    status: "em-andamento",
  },
  {
    id: "2",
    cliente: "Marcos Vinicius",
    servico: "Degradê Navalhado",
    horario: "15:15",
    status: "confirmado",
  },
  {
    id: "3",
    cliente: "Felipe Souza",
    servico: "Combo Full Lab",
    horario: "16:30",
    status: "confirmado",
  },
];

export default function HomeColaborador() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "Colaborador";

  return (
    <div className="flex min-h-screen bg-[#07070b] text-zinc-100">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              E aí, {primeiroNome} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Aqui está o resumo da sua escala e atendimentos para hoje.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Expediente Ativo
            </span>
          </div>
        </div>

        {/* Cards de Métricas do Dia */}
        <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Atendimentos Hoje
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              8{" "}
              <span className="text-xs font-normal text-zinc-400">
                agendados
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Comissão Estimada
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">R$ 280,00</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Taxa de Conclusão
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">100%</p>
          </div>
        </div>

        {/* Próximo Atendimento em Destaque */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Próximo Cliente na Cadeira
        </p>
        <div className="mb-9 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-500/30 bg-violet-500/[0.03] px-6 py-5 shadow-lg shadow-violet-950/20">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Carlos Eduardo
                </h2>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
                  Em andamento
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-violet-400">
                Corte Conectado + Barboterapia
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 14:00 - 15:00
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition-all hover:bg-violet-500"
          >
            Finalizar Atendimento
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Fila de Atendimentos do Dia */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Fila de Hoje
          </p>
          <span className="text-xs text-zinc-400">
            Mostrando próximos horários
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {proximosAtendimentos.map((atendimento) => (
            <div
              key={atendimento.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 transition-colors hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300 font-semibold text-xs">
                  {atendimento.horario}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {atendimento.cliente}
                  </h3>
                  <p className="text-xs text-zinc-400">{atendimento.servico}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    atendimento.status === "em-andamento"
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-teal-500/15 text-teal-300"
                  }`}
                >
                  {atendimento.status === "em-andamento"
                    ? "Na cadeira"
                    : "Confirmado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
