"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  Wrench,
  Calendar,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Link2,
} from "lucide-react";

import apiFetch from "../../config/apiFetch";
import { VincularFiliaisServicoModal } from "../Modal/VincularFiliaisServicoModal";

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  peso?: number;
  valor?: number;
  preco?: number;
  criadoEm?: string;
}

interface ServicoApi {
  id_servico?: string | number;
  id?: string | number;
  nome?: string;
  descricao?: string;
  peso?: number | string;
  valor?: number | string;
  preco?: number | string;
  created_at?: string;
  criadoEm?: string;
}

interface DataTableServicosProps {
  empresaId: string | number | undefined;
  onEditar?: (servico: Servico) => void;
  onEliminar?: (servico: Servico) => void;
  refreshKey?: number;
  itensPorPagina?: number;
}

type Ordenacao = "nome-asc" | "nome-desc" | "recente" | "antigo";

const ALTURA_LINHA_PADRAO = 44;

export function DataTableServicos({
  empresaId,
  onEditar,
  onEliminar,
  refreshKey = 0,
  itensPorPagina = 10,
}: DataTableServicosProps) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome-asc");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  const [servicoVinculando, setServicoVinculando] = useState<Servico | null>(
    null,
  );
  const [modalVincularAberto, setModalVincularAberto] = useState(false);

  const areaTabelaRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const primeiraLinhaRef = useRef<HTMLTableRowElement>(null);

  const [linhasPorPagina, setLinhasPorPagina] = useState(itensPorPagina);
  const alturaLinhaRef = useRef(ALTURA_LINHA_PADRAO);

  const abrirVinculo = (servico: Servico) => {
    setServicoVinculando(servico);
    setModalVincularAberto(true);
  };

  const fecharVinculo = () => {
    setModalVincularAberto(false);
    setServicoVinculando(null);
  };

  const handleVinculoSucesso = () => {
    setInternalRefreshKey((prev) => prev + 1);
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
  }, [carregando, servicos.length]);

  useEffect(() => {
    async function carregarServicos() {
      if (!empresaId) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        const response = await apiFetch.get(
          `/api/servicos/listarPorEmpresa?empresa=${empresaId}`,
        );

        const dadosBrutos =
          response.data?.exists?.dados || response.data?.dados;
        const itens = Array.isArray(dadosBrutos) ? dadosBrutos : [];

        const servicosFormatados: Servico[] = Array.from(
          new Map<string, Servico>(
            (itens as ServicoApi[]).map((item) => {
              const servico = {
                id: String(item.id_servico || item.id),
                nome: item.nome || "",
                descricao: item.descricao,
                peso: item.peso !== undefined ? Number(item.peso) : undefined,
                valor:
                  item.valor !== undefined ? Number(item.valor) : undefined,
                preco: item.preco ? Number(item.preco) : undefined,
                criadoEm: item.created_at || item.criadoEm,
              };
              return [servico.id, servico] as const;
            }),
          ).values(),
        );

        setServicos(servicosFormatados);
      } catch (error) {
        console.error("Erro ao carregar serviços da empresa:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarServicos();
  }, [empresaId, refreshKey, internalRefreshKey]);

  const servicosFiltrados = useMemo(() => {
    return servicos
      .filter((servico) => {
        const termo = busca.toLowerCase();
        const nomeMatch = servico.nome?.toLowerCase().includes(termo);
        const descricaoMatch = servico.descricao?.toLowerCase().includes(termo);

        return nomeMatch || descricaoMatch;
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
  }, [servicos, busca, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(servicosFiltrados.length / linhasPorPagina),
  );

  const paginaVisivel = Math.min(paginaAtual, totalPaginas);

  const servicosPaginados = useMemo(() => {
    const inicio = (paginaVisivel - 1) * linhasPorPagina;
    return servicosFiltrados.slice(inicio, inicio + linhasPorPagina);
  }, [servicosFiltrados, paginaVisivel, linhasPorPagina]);

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
              placeholder="Buscar por nome ou descrição..."
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
                  <th className="w-[35%] px-3 py-2.5 sm:w-[30%]">Serviço</th>
                  <th className="hidden px-3 py-2.5 sm:table-cell sm:w-[32%]">
                    Descrição
                  </th>
                  <th className="hidden px-3 py-2.5 md:table-cell md:w-[14%]">
                    Preço
                  </th>
                  <th className="hidden px-3 py-2.5 lg:table-cell lg:w-[12%]">
                    Cadastro
                  </th>
                  <th className="w-[35%] px-3 py-2.5 text-right sm:w-[12%]">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {carregando ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-zinc-400"
                    >
                      Carregando serviços...
                    </td>
                  </tr>
                ) : servicosPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-zinc-500"
                    >
                      Nenhum serviço corresponde à sua busca.
                    </td>
                  </tr>
                ) : (
                  servicosPaginados.map((servico, index) => (
                    <tr
                      key={servico.id}
                      ref={index === 0 ? primeiraLinhaRef : undefined}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="truncate px-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                            <Wrench className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {servico.nome}
                            </p>
                            {(servico.valor !== undefined ||
                              servico.preco !== undefined) && (
                              <p className="truncate text-xs text-zinc-500 sm:hidden">
                                {(
                                  (servico.valor ?? servico.preco) as number
                                ).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="hidden truncate px-3 py-2.5 sm:table-cell">
                        {servico.descricao && (
                          <span className="truncate text-xs text-zinc-400">
                            {servico.descricao}
                          </span>
                        )}
                      </td>

                      <td className="hidden truncate px-3 py-2.5 md:table-cell text-xs text-zinc-300">
                        {servico.valor !== undefined ||
                        servico.preco !== undefined
                          ? (
                              (servico.valor ?? servico.preco) as number
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "-"}
                      </td>

                      <td className="hidden truncate px-3 py-2.5 text-xs text-zinc-400 lg:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {servico.criadoEm
                            ? new Date(servico.criadoEm).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => abrirVinculo(servico)}
                            className="rounded-md border border-violet-500/20 bg-violet-500/10 p-1.5 text-violet-300 transition-colors hover:bg-violet-500/20 hover:text-white"
                            title="Vincular Filiais"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditar?.(servico)}
                            className="rounded-md border border-white/5 bg-white/5 p-1.5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                            title="Editar"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEliminar?.(servico)}
                            className="rounded-md border border-red-500/10 bg-red-500/5 p-1.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!carregando && servicosFiltrados.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-white/[0.01] px-3 py-2">
              <span className="text-xs text-zinc-500">
                Mostrando {(paginaVisivel - 1) * linhasPorPagina + 1}
                {"–"}
                {Math.min(
                  paginaVisivel * linhasPorPagina,
                  servicosFiltrados.length,
                )}{" "}
                de {servicosFiltrados.length} serviços
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

      <VincularFiliaisServicoModal
        isOpen={modalVincularAberto}
        onClose={fecharVinculo}
        onSuccess={handleVinculoSucesso}
        servico={servicoVinculando}
        empresaId={empresaId}
      />
    </>
  );
}
