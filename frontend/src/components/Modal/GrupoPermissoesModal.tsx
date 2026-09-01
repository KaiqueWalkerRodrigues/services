"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ShieldCheck, Check, Search, CheckCheck } from "lucide-react";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";

interface Grupo {
  id: string | number;
  nome: string;
}

interface Permissao {
  id?: string | number;
  id_permissao?: string | number;
  nome?: string;
  slug?: string;
  descricao?: string;
  modulo?: string;
}

interface GrupoPermissoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: Grupo | null;
}

export function GrupoPermissoesModal({
  isOpen,
  onClose,
  grupo,
}: GrupoPermissoesModalProps) {
  const [permissoesGerais, setPermissoesGerais] = useState<Permissao[]>([]);
  const [permissoesDoGrupo, setPermissoesDoGrupo] = useState<
    Set<string | number>
  >(new Set());
  const [carregando, setCarregando] = useState(false);
  const [salvandoId, setSalvandoId] = useState<string | number | null>(null);
  const [salvandoGrupoRecurso, setSalvandoGrupoRecurso] = useState<
    string | null
  >(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!isOpen || !grupo) return;

    async function carregarDados() {
      setCarregando(true);
      try {
        const [resPermissoes, resGrupoPermissoes] = await Promise.all([
          apiFetch.get("/api/permissoes"),
          apiFetch.get(`/api/grupos/listarPermissoes?id_grupo=${grupo?.id}`),
        ]);

        const todas = Array.isArray(resPermissoes.data)
          ? resPermissoes.data
          : resPermissoes.data?.dados || [];

        setPermissoesGerais(todas);

        const doGrupoDados = Array.isArray(resGrupoPermissoes.data)
          ? resGrupoPermissoes.data
          : resGrupoPermissoes.data?.dados || [];

        const idsAtivos = new Set<string | number>(
          doGrupoDados
            .map((p: Permissao) => p.id ?? p.id_permissao)
            .filter(
              (
                id: string | number | undefined | null,
              ): id is string | number => {
                return id !== undefined && id !== null;
              },
            ),
        );
        setPermissoesDoGrupo(idsAtivos);
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [isOpen, grupo]);

  const permissoesAgrupadas = useMemo(() => {
    const mapa: Record<string, { acao: string; perm: Permissao }[]> = {};

    permissoesGerais.forEach((perm) => {
      const slugParts = (perm.slug || perm.nome || "").split(".");
      const recurso = slugParts[0] || perm.modulo || "geral";
      const acao = slugParts[1] || "gerenciar";

      if (!mapa[recurso]) {
        mapa[recurso] = [];
      }
      mapa[recurso].push({ acao, perm });
    });

    return mapa;
  }, [permissoesGerais]);

  const togglePermissao = async (idPermissao: string | number) => {
    if (!grupo) return;
    setSalvandoId(idPermissao);

    const jaTem = permissoesDoGrupo.has(idPermissao);

    try {
      if (jaTem) {
        const response = await apiFetch.delete("/api/grupos/removerPermissao", {
          data: { id_grupo: grupo.id, id_permissao: idPermissao },
        });

        if (response.data?.status === "erro") {
          throw new Error(
            response.data?.mensagem || "Não foi possível remover a permissão.",
          );
        }

        setPermissoesDoGrupo((prev) => {
          const novo = new Set(prev);
          novo.delete(idPermissao);
          return novo;
        });

        showToast({
          type: "success",
          message: "Permissão removida do grupo com sucesso!",
        });
      } else {
        const response = await apiFetch.post("/api/grupos/adicionarPermissao", {
          id_grupo: grupo.id,
          id_permissao: idPermissao,
        });

        if (response.data?.status === "erro") {
          throw new Error(
            response.data?.mensagem ||
              "Não foi possível adicionar a permissão.",
          );
        }

        setPermissoesDoGrupo((prev) => new Set(prev).add(idPermissao));

        showToast({
          type: "success",
          message: "Permissão adicionada ao grupo com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao alterar permissão:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar a permissão.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setSalvandoId(null);
    }
  };

  const toggleTodasDoRecurso = async (
    recurso: string,
    listaFiltrada: { acao: string; perm: Permissao }[],
  ) => {
    if (!grupo) return;

    const idsValidos = listaFiltrada
      .map(({ perm }) => perm.id ?? perm.id_permissao)
      .filter((id): id is string | number => id !== undefined && id !== null);

    if (idsValidos.length === 0) return;

    // Verifica se todas as permissões filtradas deste recurso já estão selecionadas
    const todasAtivas = idsValidos.every((id) => permissoesDoGrupo.has(id));

    setSalvandoGrupoRecurso(recurso);

    try {
      if (todasAtivas) {
        // Remove todas uma a uma ou conforme a API suportar
        for (const idPermissao of idsValidos) {
          await apiFetch.delete("/api/grupos/removerPermissao", {
            data: { id_grupo: grupo.id, id_permissao: idPermissao },
          });
        }

        setPermissoesDoGrupo((prev) => {
          const novo = new Set(prev);
          idsValidos.forEach((id) => novo.delete(id));
          return novo;
        });

        showToast({
          type: "success",
          message: `Todas as permissões de ${recurso} foram removidas!`,
        });
      } else {
        // Adiciona as que ainda não estão selecionadas
        for (const idPermissao of idsValidos) {
          if (!permissoesDoGrupo.has(idPermissao)) {
            await apiFetch.post("/api/grupos/adicionarPermissao", {
              id_grupo: grupo.id,
              id_permissao: idPermissao,
            });
          }
        }

        setPermissoesDoGrupo((prev) => {
          const novo = new Set(prev);
          idsValidos.forEach((id) => novo.add(id));
          return novo;
        });

        showToast({
          type: "success",
          message: `Todas as permissões de ${recurso} foram adicionadas!`,
        });
      }
    } catch (error) {
      console.error("Erro ao alterar lote de permissões:", error);
      showToast({
        type: "error",
        message: "Não foi possível atualizar o lote de permissões.",
      });
    } finally {
      setSalvandoGrupoRecurso(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-[#0c0c14] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Gerenciar Permissões
              </h2>
              <p className="text-xs text-zinc-400">
                Grupo:{" "}
                <span className="text-white font-medium">{grupo?.nome}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5 bg-white/[0.01]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar por recurso ou slug..."
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {carregando ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Carregando permissões...
            </div>
          ) : Object.keys(permissoesAgrupadas).length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Nenhuma permissão encontrada.
            </div>
          ) : (
            Object.entries(permissoesAgrupadas).map(([recurso, lista]) => {
              const filtrados = lista.filter(
                ({ perm }) =>
                  recurso.toLowerCase().includes(busca.toLowerCase()) ||
                  perm.slug?.toLowerCase().includes(busca.toLowerCase()) ||
                  perm.nome?.toLowerCase().includes(busca.toLowerCase()),
              );

              if (filtrados.length === 0) return null;

              const idsFiltrados = filtrados
                .map(({ perm }) => perm.id ?? perm.id_permissao)
                .filter(
                  (id): id is string | number =>
                    id !== undefined && id !== null,
                );

              const todasEstaoAtivas =
                idsFiltrados.length > 0 &&
                idsFiltrados.every((id) => permissoesDoGrupo.has(id));

              const estaSalvandoGrupo = salvandoGrupoRecurso === recurso;

              return (
                <div
                  key={recurso}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                      {recurso}
                    </h3>
                    <button
                      type="button"
                      disabled={estaSalvandoGrupo}
                      onClick={() => toggleTodasDoRecurso(recurso, filtrados)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                        todasEstaoAtivas
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30"
                          : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      {todasEstaoAtivas
                        ? "Desmarcar Todos"
                        : "Selecionar Todos"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {filtrados.map(({ acao, perm }) => {
                      const permId = perm.id ?? perm.id_permissao;

                      if (permId === undefined || permId === null) {
                        return null;
                      }

                      const ativo = permissoesDoGrupo.has(permId);
                      const salvando =
                        salvandoId === permId || estaSalvandoGrupo;

                      return (
                        <button
                          key={String(permId)}
                          disabled={salvando}
                          onClick={() => togglePermissao(permId)}
                          className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                            ativo
                              ? "border-violet-500/50 bg-violet-500/15 text-white"
                              : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                          }`}
                        >
                          <span className="truncate capitalize">{acao}</span>
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              ativo
                                ? "border-violet-400 bg-violet-500 text-white"
                                : "border-zinc-600 bg-transparent"
                            }`}
                          >
                            {ativo && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end border-t border-white/5 px-6 py-4 bg-white/[0.01]">
          <Button
            type="button"
            onClick={onClose}
            variant="solid"
            color="success"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
