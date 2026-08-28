"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { Building2, Check, Loader2 } from "lucide-react";

interface Filial {
  id: string;
  nome: string;
  cidade?: string;
  uf?: string;
}

interface Servico {
  id: string;
  nome: string;
}

interface VincularFiliaisServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servico: Servico | null;
  empresaId?: string | number;
}

export function VincularFiliaisServicoModal({
  isOpen,
  onClose,
  onSuccess,
  servico,
  empresaId,
}: VincularFiliaisServicoModalProps) {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [filiaisVinculadas, setFiliaisVinculadas] = useState<Set<string>>(
    new Set(),
  );
  const [carregando, setCarregando] = useState(false);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !servico || !empresaId) return;

    async function carregarDados() {
      setCarregando(true);
      try {
        // 1. Busca todas as filiais da empresa
        const responseFiliais = await apiFetch.get(
          `/api/filiais/listarPorEmpresa?empresa=${empresaId}`,
        );
        const dadosBrutosFiliais =
          responseFiliais.data?.exists?.dados || responseFiliais.data?.dados;
        const listaFiliais: Filial[] = Array.isArray(dadosBrutosFiliais)
          ? dadosBrutosFiliais.map((f: any) => ({
              id: String(f.id_filial || f.id),
              nome: f.nome || "",
              cidade: f.cidade,
              uf: f.uf,
            }))
          : [];
        setFiliais(listaFiliais);

        // 2. Busca os detalhes do serviço específico para recuperar as filiais já vinculadas
        const responseServico = await apiFetch.get(
          `/api/servicos?id=${servico.id}`,
        );
        const dadosServico = responseServico.data?.dados;

        const idsVinculados = new Set<string>();
        if (dadosServico && Array.isArray(dadosServico.filiais)) {
          dadosServico.filiais.forEach((idFilial: any) => {
            idsVinculados.add(String(idFilial));
          });
        }
        setFiliaisVinculadas(idsVinculados);
      } catch (error) {
        console.error("Erro ao carregar dados de vínculo:", error);
        showToast({
          type: "error",
          message: "Não foi possível carregar as filiais.",
        });
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [isOpen, servico, empresaId]);

  const handleToggleVincular = async (idFilial: string) => {
    if (!servico) return;
    setSalvandoId(idFilial);

    const estaVinculado = filiaisVinculadas.has(idFilial);

    try {
      if (estaVinculado) {
        await apiFetch.delete("/api/servicos/removerFilial", {
          data: {
            id_servico: servico.id,
            id_filial: idFilial,
          },
        });
        setFiliaisVinculadas((prev) => {
          const next = new Set(prev);
          next.delete(idFilial);
          return next;
        });
        showToast({
          type: "success",
          message: "Filial desvinculada com sucesso!",
        });
      } else {
        await apiFetch.post("/api/servicos/adicionarFilial", {
          id_servico: servico.id,
          id_filial: idFilial,
        });
        setFiliaisVinculadas((prev) => new Set(prev).add(idFilial));
        showToast({
          type: "success",
          message: "Filial vinculada com sucesso!",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao alterar vínculo:", error);
      showToast({
        type: "error",
        message: "Não foi possível atualizar o vínculo.",
      });
    } finally {
      setSalvandoId(null);
    }
  };

  if (!servico) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vincular Filiais - ${servico.nome}`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-zinc-400">
          Selecione abaixo quais filiais da empresa devem oferecer este serviço.
        </p>

        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {carregando ? (
            <div className="py-8 text-center text-sm text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              Carregando filiais...
            </div>
          ) : filiais.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Nenhuma filial cadastrada para esta empresa.
            </div>
          ) : (
            filiais.map((filial) => {
              const vinculada = filiaisVinculadas.has(filial.id);
              const processando = salvandoId === filial.id;

              return (
                <div
                  key={filial.id}
                  onClick={() =>
                    !processando && handleToggleVincular(filial.id)
                  }
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    vinculada
                      ? "border-violet-500/50 bg-violet-500/10 text-white"
                      : "border-white/5 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        vinculada
                          ? "bg-violet-500 text-white"
                          : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {filial.nome}
                      </p>
                      {(filial.cidade || filial.uf) && (
                        <p className="truncate text-xs text-zinc-500">
                          {filial.cidade || ""}{" "}
                          {filial.cidade && filial.uf ? "-" : ""}{" "}
                          {filial.uf || ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {processando ? (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    ) : vinculada ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-violet-400 bg-violet-500/20 px-2.5 py-1 rounded-lg">
                        <Check className="h-3.5 w-3.5" /> Vinculada
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Clique para vincular
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-white/5 pt-4 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/5 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            Concluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
