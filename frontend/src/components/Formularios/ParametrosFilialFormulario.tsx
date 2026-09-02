"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface ParametrosFilialFormularioProps {
  filialId?: string;
}

export function ParametrosFilialFormulario({
  filialId,
}: ParametrosFilialFormularioProps) {
  // const [tempoAgendamento, setTempoAgendamento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!filialId) return;

    async function buscarParametros() {
      try {
        setCarregando(true);
        const resposta = await apiFetch.get(
          `/api/parametros-filial?id_filial=${filialId}`,
        );

        const dados = resposta.data.dados ?? resposta.data;
        // setTempoAgendamento(String(dados.tempo_agendamento ?? ""));
      } catch {
        showToast({
          type: "error",
          message: "Não foi possível carregar os parâmetros da filial.",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarParametros();
  }, [filialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filialId) return;

    try {
      setSalvando(true);

      await apiFetch.put(`/api/parametros-filial`, {
        id_filial: filialId,
        // tempo_agendamento: tempoAgendamento,
      });

      showToast({
        type: "success",
        message: "Parâmetros da filial atualizados com sucesso!",
      });
    } catch {
      showToast({
        type: "error",
        message: "Erro ao salvar as alterações. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* <div>
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
          </div> */}
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800/50">
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
    </div>
  );
}
