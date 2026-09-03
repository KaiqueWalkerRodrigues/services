"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  Layers,
  Calendar,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { EditarGrupoModal } from "../Modal/EditarGrupoViaColaboradorModa";
import { DeletarGrupoModal } from "../Modal/DeletarGrupoViaColaboradorModal";
import { GrupoPermissoesModal } from "../Modal/GrupoPermissoesModal";

interface Grupo {
  id: string;
  id_empresa?: string | number;
  nome: string;
  prestador?: boolean | number | string;
  criadoEm?: string;
}

interface GrupoApi {
  id_grupo?: string | number;
  id?: string | number;
  id_empresa?: string | number;
  nome?: string;
  prestador?: boolean | number | string;
  created_at?: string;
  criadoEm?: string;
}

interface DataTableGruposPorEmpresaProps {
  empresaId: string | number | undefined;
  onEditar?: (grupo: Grupo) => void;
  onEliminar?: (grupo: Grupo) => void;
  refreshKey?: number;
  itensPorPagina?: number;
}

type Ordenacao = "nome-asc" | "nome-desc" | "recente" | "antigo";

const ALTURA_LINHA_PADRAO = 44;

export function DataTableGruposPorEmpresa({
  empresaId,
  onEditar,
  onEliminar,
  refreshKey = 0,
  itensPorPagina = 10,
}: DataTableGruposPorEmpresaProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome-asc");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  const [grupoExcluindo, setGrupoExcluindo] = useState<Grupo | null>(null);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);

  const [grupoParametros, setGrupoParametros] = useState<Grupo | null>(null);
  const [modalGrupoPermissoesAberto, setmodalGrupoPermissoesAberto] =
    useState(false);

  const areaTabelaRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const primeiraLinhaRef = useRef<HTMLTableRowElement>(null);

  const [linhasPorPagina, setLinhasPorPagina] = useState(itensPorPagina);
  const alturaLinhaRef = useRef(ALTURA_LINHA_PADRAO);

  const abrirEdicao = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setModalEditarAberto(true);
  };

  const fecharEdicao = () => {
    setModalEditarAberto(false);
    setGrupoEditando(null);
  };

  const handleEdicaoSucesso = () => {
    fecharEdicao();
    setInternalRefreshKey((prev) => prev + 1);
  };

  const abrirExclusao = (grupo: Grupo) => {
    setGrupoExcluindo(grupo);
    setModalDeletarAberto(true);
  };

  const fecharExclusao = () => {
    setModalDeletarAberto(false);
    setGrupoExcluindo(null);
  };

  const handleExclusaoSucesso = () => {
    fecharExclusao();
    setInternalRefreshKey((prev) => prev + 1);
  };

  const abrirParametros = (grupo: Grupo) => {
    setGrupoParametros(grupo);
    setmodalGrupoPermissoesAberto(true);
  };

  const fecharGrupoPermissoes = () => {
    setmodalGrupoPermissoesAberto(false);
    setGrupoParametros(null);
  };

  useEffect(() => {
    const areaEl = areaTabelaRef.current;
    if (!areaEl) return;

    const recalcular = () => {
      const alturaThead = theadRef.current?.offsetHeight ?? 40;
      const alturaLinha =
        primeiraLinhaRef.current?.offsetHeight || alturaLinhaRef.current;
      alturaLinhaRef.current = alturaLinha;

      const alturaDisponivel = areaEl.clientHeight - alturaThead;
      const linhas = Math.max(
        3,
        Math.floor((alturaDisponivel + 10) / alturaLinha),
      );

      setLinhasPorPagina((atual) => (atual === linhas ? atual : linhas));
    };

    recalcular();
    const observer = new ResizeObserver(recalcular);
    observer.observe(areaEl);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (carregando || !primeiraLinhaRef.current || !areaTabelaRef.current) {
      return;
    }

    const alturaThead = theadRef.current?.offsetHeight ?? 40;
    const alturaLinha = primeiraLinhaRef.current.offsetHeight;
    if (!alturaLinha) return;

    alturaLinhaRef.current = alturaLinha;
    const alturaDisponivel = areaTabelaRef.current.clientHeight - alturaThead;
    const linhas = Math.max(3, Math.floor(alturaDisponivel / alturaLinha));

    setLinhasPorPagina((atual) => (atual === linhas ? atual : linhas));
  }, [carregando, grupos.length]);

  useEffect(() => {
    async function carregarGrupos() {
      if (!empresaId) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        // Ajuste o endpoint conforme a sua API de backend
        const response = await apiFetch.get(
          `/api/grupos/listarPorEmpresa?empresa=${empresaId}`,
        );

        const dadosBrutos =
          response.data?.exists?.dados || response.data?.dados;
        const itens = Array.isArray(dadosBrutos) ? dadosBrutos : [];

        const gruposFormatados: Grupo[] = Array.from(
          new Map<string, Grupo>(
            (itens as GrupoApi[]).map((item) => {
              const grupo = {
                id: String(item.id_grupo || item.id),
                id_empresa: item.id_empresa || empresaId,
                nome: item.nome || "",
                prestador:
                  item.prestador === true ||
                  item.prestador === 1 ||
                  item.prestador === "1",
                criadoEm: item.created_at || item.criadoEm,
              };
              return [grupo.id, grupo] as const;
            }),
          ).values(),
        );

        setGrupos(gruposFormatados);
      } catch (error) {
        console.error("Erro ao carregar grupos da empresa:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarGrupos();
  }, [empresaId, refreshKey, internalRefreshKey]);

  const gruposFiltrados = useMemo(() => {
    return grupos
      .filter((grupo) => {
        const termo = busca.toLowerCase();
        return grupo.nome?.toLowerCase().includes(termo);
      })
      .sort((a, b) => {
        if (ordenacao === "nome-asc") {
          return a.nome.localeCompare(b.nome);
        }
        if (ordenacao === "nome-desc") {
          return b.nome.localeCompare(a.nome);
        }
        if (ordenacao === "recente") {
          const dataA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
          const dataB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
          return dataB - dataA;
        }
        if (ordenacao === "antigo") {
          const dataA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
          const dataB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
          return dataA - dataB;
        }
        return 0;
      });
  }, [grupos, busca, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(gruposFiltrados.length / linhasPorPagina),
  );

  const paginaVisivel = Math.min(paginaAtual, totalPaginas);

  const gruposPaginados = useMemo(() => {
    const inicio = (paginaVisivel - 1) * linhasPorPagina;
    return gruposFiltrados.slice(inicio, inicio + linhasPorPagina);
  }, [gruposFiltrados, paginaVisivel, linhasPorPagina]);

  return (
    <>
      <div className="flex h-full w-full min-h-0 flex-col gap-3 overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="relative min-w-[160px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              placeholder="Buscar grupo por nome..."
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-1.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-zinc-500" />
            <select
              value={ordenacao}
              onChange={(e) => {
                setOrdenacao(e.target.value as Ordenacao);
                setPaginaAtual(1);
              }}
              className="cursor-pointer rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-sm text-zinc-300 outline-none transition-colors focus:border-violet-500/50"
            >
              <option value="nome-asc" className="bg-[#09090f] text-white">
                Nome (A-Z)
              </option>
              <option value="nome-desc" className="bg-[#09090f] text-white">
                Nome (Z-A)
              </option>
              <option value="recente" className="bg-[#09090f] text-white">
                Mais recentes
              </option>
              <option value="antigo" className="bg-[#09090f] text-white">
                Mais antigos
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
          <div ref={areaTabelaRef} className="flex-1 overflow-hidden">
            <table className="w-full table-fixed border-collapse text-left">
              <thead ref={theadRef} className="bg-[#0c0c14] shadow-sm">
                <tr className="border-b border-white/5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  <th className="w-[50%] px-3 py-2.5 sm:w-[50%]">Grupo</th>
                  <th className="hidden px-3 py-2.5 sm:table-cell sm:w-[35%]">
                    Cadastro
                  </th>
                  <th className="w-[50%] px-3 py-2.5 text-right sm:w-[15%]">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {carregando ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-sm text-zinc-400"
                    >
                      Carregando grupos...
                    </td>
                  </tr>
                ) : gruposPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-sm text-zinc-500"
                    >
                      Nenhum grupo corresponde à sua busca.
                    </td>
                  </tr>
                ) : (
                  gruposPaginados.map((grupo, index) => (
                    <tr
                      key={grupo.id}
                      ref={index === 0 ? primeiraLinhaRef : undefined}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="truncate px-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {grupo.nome}
                            </p>
                            {grupo.prestador && (
                              <span className="text-[10px] text-violet-300">
                                Prestador
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="hidden truncate px-3 py-2.5 text-xs text-zinc-400 sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {grupo.criadoEm
                            ? new Date(grupo.criadoEm).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => abrirParametros(grupo)}
                            className="rounded-md border border-violet-500/20 bg-violet-500/10 p-1.5 text-violet-300 transition-colors hover:bg-violet-500/20 hover:text-white"
                            title="Permissões"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </button>
                          <Button
                            type="button"
                            size="table"
                            variant="tableEdit"
                            onClick={() => {
                              abrirEdicao(grupo);
                              onEditar?.(grupo);
                            }}
                            title="Editar"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="table"
                            variant="tableDelete"
                            onClick={() => {
                              abrirExclusao(grupo);
                              onEliminar?.(grupo);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!carregando && gruposFiltrados.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-white/[0.01] px-3 py-2">
              <span className="text-xs text-zinc-500">
                Mostrando {(paginaVisivel - 1) * linhasPorPagina + 1}
                {"–"}
                {Math.min(
                  paginaVisivel * linhasPorPagina,
                  gruposFiltrados.length,
                )}{" "}
                de {gruposFiltrados.length} grupos
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaVisivel === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 text-xs text-zinc-400">
                  Página <strong className="text-white">{paginaVisivel}</strong>{" "}
                  de <strong className="text-white">{totalPaginas}</strong>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaVisivel === totalPaginas}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditarGrupoModal
        isOpen={modalEditarAberto}
        onClose={fecharEdicao}
        onSuccess={handleEdicaoSucesso}
        grupo={grupoEditando}
      />

      <DeletarGrupoModal
        isOpen={modalDeletarAberto}
        onClose={fecharExclusao}
        onSuccess={handleExclusaoSucesso}
        grupo={grupoExcluindo}
      />

      <GrupoPermissoesModal
        isOpen={modalGrupoPermissoesAberto}
        onClose={fecharGrupoPermissoes}
        grupo={grupoParametros}
      />
    </>
  );
}
