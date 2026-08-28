"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import apiFetch from "../../config/apiFetch";

interface ParametrosGeraisFormularioProps {
  empresaId?: string;
}

export function ParametrosGeraisFormulario({
  empresaId,
}: ParametrosGeraisFormularioProps) {
  const [tempoAgendamento, setTempoAgendamento] = useState("");
  const [tempoIntervalo, setTempoIntervalo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);

  useEffect(() => {
    if (!empresaId) return;

    async function buscarParametros() {
      try {
        setCarregando(true);
        const resposta = await apiFetch.get(
          `/api/parametros-empresas?id_empresa=${empresaId}`,
        );

        const dados = resposta.data.dados ?? resposta.data;
        setTempoAgendamento(String(dados.tempo_agendamento ?? ""));
        setTempoIntervalo(String(dados.tempo_intervalo ?? ""));
      } catch {
        setMensagem({
          tipo: "erro",
          texto: "Não foi possível carregar os parâmetros.",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarParametros();
  }, [empresaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;

    try {
      setSalvando(true);
      setMensagem(null);

      await apiFetch.put(`/api/parametros-empresas`, {
        id_empresa: empresaId,
        tempo_agendamento: tempoAgendamento,
        tempo_intervalo: tempoIntervalo,
      });

      setMensagem({
        tipo: "sucesso",
        texto: "Parâmetros atualizados com sucesso!",
      });
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Erro ao salvar as alterações. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl"
    >
      {mensagem && (
        <div
          className={`rounded-xl p-4 text-sm ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Tempo de Agendamento
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Clock className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={tempoAgendamento}
              onChange={(e) => setTempoAgendamento(e.target.value)}
              placeholder="Ex: 30 minutos"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Tempo de Intervalo
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Clock className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={tempoIntervalo}
              onChange={(e) => setTempoIntervalo(e.target.value)}
              placeholder="Ex: 10 minutos"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.6)] transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {salvando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}
