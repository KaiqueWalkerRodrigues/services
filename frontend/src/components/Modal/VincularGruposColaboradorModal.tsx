"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { Check, Loader2, Layers3 } from "lucide-react";

interface Colaborador {
  id: string;
  nome: string;
}

interface Grupo {
  id: string;
  id_grupo?: string | number;
  nome: string;
  vinculado?: boolean;
}

interface VincularGruposColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  colaborador: Colaborador | null;
  empresaId?: string | number;
}

export function VincularGruposColaboradorModal({
  isOpen,
  onClose,
  onSuccess,
  colaborador,
  empresaId,
}: VincularGruposColaboradorModalProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [gruposVinculados, setGruposVinculados] = useState<Set<string>>(
    new Set(),
  );
  const [carregando, setCarregando] = useState(false);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !colaborador || !empresaId) return;

    const colaboradorId = colaborador.id;

    async function carregarDados() {
      setCarregando(true);

      try {
        const responseGrupos = await apiFetch.get(
          `/api/grupos/listarPorEmpresa?empresa=${empresaId}`,
        );
        const dadosGrupos =
          responseGrupos.data?.exists?.dados ||
          responseGrupos.data?.dados ||
          [];

        const gruposDaEmpresa: Grupo[] = Array.isArray(dadosGrupos)
          ? dadosGrupos.map((g: any) => ({
              id: String(g.id_grupo || g.id),
              id_grupo: g.id_grupo || g.id,
              nome: g.nome || "",
            }))
          : [];

        const responseVinculos = await apiFetch.get(
          `/api/colaboradores/listarGruposColaborador?id_colaborador=${colaboradorId}`,
        );

        const dadosVinculos =
          responseVinculos.data?.exists?.dados ||
          responseVinculos.data?.dados ||
          responseVinculos.data ||
          [];

        const idsVinculados = new Set<string>();
        if (Array.isArray(dadosVinculos)) {
          dadosVinculos.forEach((g: any) => {
            const idGrupo = g.id_grupo || g.id;
            if (idGrupo) idsVinculados.add(String(idGrupo));
          });
        }

        setGruposVinculados(idsVinculados);
        setGrupos(
          gruposDaEmpresa.map((grupo) => ({
            ...grupo,
            vinculado: idsVinculados.has(grupo.id),
          })),
        );
      } catch (error) {
        console.error("Erro ao carregar grupos do colaborador:", error);
        showToast({
          type: "error",
          message: "Não foi possível carregar os grupos do colaborador.",
        });
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [isOpen, colaborador, empresaId]);

  const handleToggleVinculo = async (grupo: Grupo) => {
    if (!colaborador) return;

    const idGrupo = String(grupo.id_grupo ?? grupo.id);
    const estaVinculado = gruposVinculados.has(idGrupo);

    setSalvandoId(idGrupo);

    try {
      if (estaVinculado) {
        await apiFetch.delete("/api/colaboradores/removerGrupo", {
          data: {
            id_colaborador: colaborador.id,
            id_grupo: idGrupo,
          },
        });

        setGruposVinculados((prev) => {
          const next = new Set(prev);
          next.delete(idGrupo);
          return next;
        });

        setGrupos((prev) =>
          prev.map((g) =>
            g.id === idGrupo || g.id_grupo === idGrupo
              ? { ...g, vinculado: false }
              : g,
          ),
        );

        showToast({
          type: "success",
          message: "Grupo desvinculado com sucesso!",
        });
      } else {
        await apiFetch.post("/api/colaboradores/adicionarGrupo", {
          id_colaborador: colaborador.id,
          id_grupo: idGrupo,
        });

        setGruposVinculados((prev) => new Set(prev).add(idGrupo));
        setGrupos((prev) =>
          prev.map((g) =>
            g.id === idGrupo || g.id_grupo === idGrupo
              ? { ...g, vinculado: true }
              : g,
          ),
        );

        showToast({
          type: "success",
          message: "Grupo vinculado com sucesso!",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao alterar vínculo do grupo:", error);
      showToast({
        type: "error",
        message: "Não foi possível atualizar o vínculo do grupo.",
      });
    } finally {
      setSalvandoId(null);
    }
  };

  if (!colaborador) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vincular Grupos - ${colaborador.nome}`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-zinc-400">
          Selecione abaixo quais grupos o colaborador terá acesso.
        </p>

        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {carregando ? (
            <div className="py-8 text-center text-sm text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-500" />
              Carregando grupos...
            </div>
          ) : grupos.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Nenhum grupo cadastrado para esta empresa.
            </div>
          ) : (
            grupos.map((grupo) => {
              const idGrupo = String(grupo.id_grupo ?? grupo.id);
              const vinculada = gruposVinculados.has(idGrupo);
              const processando = salvandoId === idGrupo;

              return (
                <div
                  key={idGrupo}
                  onClick={() => !processando && handleToggleVinculo(grupo)}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    vinculada
                      ? "border-green-500/50 bg-green-500/10 text-white"
                      : "border-white/5 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        vinculada
                          ? "bg-green-500 text-white"
                          : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      <Layers3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {grupo.nome}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {processando ? (
                      <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    ) : vinculada ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/20 px-2.5 py-1 rounded-lg">
                        <Check className="h-3.5 w-3.5" /> Vinculado
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
