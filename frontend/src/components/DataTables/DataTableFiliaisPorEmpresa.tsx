"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  Building2,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Cog,
} from "lucide-react";

import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { EditarFilialModal } from "../Modal/EditarFilialViaColaboradorModal";
import { DeletarFilialModal } from "../Modal/DeletarFilialViaColaboradorModal";
import { ParametrosFilialModal } from "../Modal/ParametrosFilialModal";

interface Filial {
  id: string;
  nome: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  criadoEm?: string;
}

interface FilialApi {
  id_filial?: string | number;
  id?: string | number;
  id_empresa?: string | number;
  nome?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  created_at?: string;
  criadoEm?: string;
}

interface DataTableFiliaisPorEmpresaProps {
  empresaId: string | number | undefined;
  onEditar?: (filial: Filial) => void;
  onEliminar?: (filial: Filial) => void;
  refreshKey?: number;
  itensPorPagina?: number;
}

type Ordenacao = "nome-asc" | "nome-desc" | "recente" | "antigo";

const ALTURA_LINHA_PADRAO = 44;

export function DataTableFiliaisPorEmpresa({
  empresaId,
  onEditar,
  onEliminar,
  refreshKey = 0,
  itensPorPagina = 10,
}: DataTableFiliaisPorEmpresaProps) {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome-asc");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const [filialEditando, setFilialEditando] = useState<Filial | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  const [filialExcluindo, setFilialExcluindo] = useState<Filial | null>(null);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);

  const [filialParametros, setFilialParametros] = useState<Filial | null>(null);
  const [modalParametrosAberto, setModalParametrosAberto] = useState(false);

  const areaTabelaRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const primeiraLinhaRef = useRef<HTMLTableRowElement>(null);

  const [linhasPorPagina, setLinhasPorPagina] = useState(itensPorPagina);
  const alturaLinhaRef = useRef(ALTURA_LINHA_PADRAO);

  const abrirEdicao = (filial: Filial) => {
    setFilialEditando(filial);
    setModalEditarAberto(true);
  };

  const fecharEdicao = () => {
    setModalEditarAberto(false);
    setFilialEditando(null);
  };

  const handleEdicaoSucesso = () => {
    fecharEdicao();
    setInternalRefreshKey((prev) => prev + 1);
  };

  const abrirExclusao = (filial: Filial) => {
    setFilialExcluindo(filial);
    setModalDeletarAberto(true);
  };

  const fecharExclusao = () => {
    setModalDeletarAberto(false);
    setFilialExcluindo(null);
  };

  const handleExclusaoSucesso = () => {
    fecharExclusao();
    setInternalRefreshKey((prev) => prev + 1);
  };

  const abrirParametros = (filial: Filial) => {
    setFilialParametros(filial);
    setModalParametrosAberto(true);
  };

  const fecharParametros = () => {
    setModalParametrosAberto(false);
    setFilialParametros(null);
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
  }, [carregando, filiais.length]);

  useEffect(() => {
    async function carregarFiliais() {
      if (!empresaId) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        const response = await apiFetch.get(
          `/api/filiais/listarPorEmpresa?empresa=${empresaId}`,
        );

        const dadosBrutos =
          response.data?.exists?.dados || response.data?.dados;
        const itens = Array.isArray(dadosBrutos) ? dadosBrutos : [];

        const filiaisFormatadas: Filial[] = Array.from(
          new Map<string, Filial>(
            (itens as FilialApi[]).map((item) => {
              const filial = {
                id: String(item.id_filial || item.id),
                nome: item.nome || "",
                endereco: item.endereco,
                bairro: item.bairro,
                cidade: item.cidade,
                uf: item.uf,
                criadoEm: item.created_at || item.criadoEm,
              };
              return [filial.id, filial] as const;
            }),
          ).values(),
        );

        setFiliais(filiaisFormatadas);
      } catch (error) {
        console.error("Erro ao carregar filiais da empresa:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarFiliais();
  }, [empresaId, refreshKey, internalRefreshKey]);

  const filiaisFiltradas = useMemo(() => {
    return filiais
      .filter((filial) => {
        const termo = busca.toLowerCase();
        const nomeMatch = filial.nome?.toLowerCase().includes(termo);
        const enderecoMatch = filial.endereco?.toLowerCase().includes(termo);
        const bairroMatch = filial.bairro?.toLowerCase().includes(termo);
        const cidadeMatch = filial.cidade?.toLowerCase().includes(termo);
        const ufMatch = filial.uf?.toLowerCase().includes(termo);

        return (
          nomeMatch || enderecoMatch || bairroMatch || cidadeMatch || ufMatch
        );
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
  }, [filiais, busca, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filiaisFiltradas.length / linhasPorPagina),
  );

  const paginaVisivel = Math.min(paginaAtual, totalPaginas);

  const filiaisPaginadas = useMemo(() => {
    const inicio = (paginaVisivel - 1) * linhasPorPagina;
    return filiaisFiltradas.slice(inicio, inicio + linhasPorPagina);
  }, [filiaisFiltradas, paginaVisivel, linhasPorPagina]);

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
              placeholder="Buscar por nome, endereço, cidade ou UF..."
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
                  <th className="w-[40%] px-3 py-2.5 sm:w-[30%]">Filial</th>
                  <th className="hidden px-3 py-2.5 sm:table-cell sm:w-[28%]">
                    Endereço
                  </th>
                  <th className="hidden px-3 py-2.5 md:table-cell md:w-[16%]">
                    Cidade / UF
                  </th>
                  <th className="hidden px-3 py-2.5 lg:table-cell lg:w-[14%]">
                    Cadastro
                  </th>
                  <th className="w-[30%] px-3 py-2.5 text-right sm:w-[12%]">
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
                      Carregando filiais...
                    </td>
                  </tr>
                ) : filiaisPaginadas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-zinc-500"
                    >
                      Nenhuma filial corresponde à sua busca.
                    </td>
                  </tr>
                ) : (
                  filiaisPaginadas.map((filial, index) => (
                    <tr
                      key={filial.id}
                      ref={index === 0 ? primeiraLinhaRef : undefined}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="truncate px-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {filial.nome}
                            </p>
                            {filial.cidade && (
                              <p className="truncate text-xs text-zinc-500 sm:hidden">
                                {filial.cidade}{" "}
                                {filial.uf ? `- ${filial.uf}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="hidden truncate px-3 py-2.5 sm:table-cell">
                        {filial.endereco && (
                          <span className="flex items-center gap-1.5 truncate text-xs text-zinc-400">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                            <span className="truncate">{filial.endereco}</span>
                          </span>
                        )}
                      </td>

                      <td className="hidden truncate px-3 py-2.5 md:table-cell">
                        {(filial.cidade || filial.uf) && (
                          <span className="truncate text-xs text-zinc-400">
                            {filial.cidade || ""}{" "}
                            {filial.cidade && filial.uf ? "/" : ""}{" "}
                            {filial.uf || ""}
                          </span>
                        )}
                      </td>

                      <td className="hidden truncate px-3 py-2.5 text-xs text-zinc-400 lg:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {filial.criadoEm
                            ? new Date(filial.criadoEm).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => abrirParametros(filial)}
                            className="rounded-md border border-violet-500/20 bg-violet-500/10 p-1.5 text-violet-300 transition-colors hover:bg-violet-500/20 hover:text-white"
                            title="Parâmetros"
                          >
                            <Cog className="h-3.5 w-3.5" />
                          </button>
                          <Button
                            type="button"
                            size="table"
                            variant="tableEdit"
                            onClick={() => {
                              abrirEdicao(filial);
                              onEditar?.(filial);
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
                              abrirExclusao(filial);
                              onEliminar?.(filial);
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

          {!carregando && filiaisFiltradas.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-white/[0.01] px-3 py-2">
              <span className="text-xs text-zinc-500">
                Mostrando {(paginaVisivel - 1) * linhasPorPagina + 1}
                {"–"}
                {Math.min(
                  paginaVisivel * linhasPorPagina,
                  filiaisFiltradas.length,
                )}{" "}
                de {filiaisFiltradas.length} filiais
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

      <EditarFilialModal
        isOpen={modalEditarAberto}
        onClose={fecharEdicao}
        onSuccess={handleEdicaoSucesso}
        filial={filialEditando}
      />

      <DeletarFilialModal
        isOpen={modalDeletarAberto}
        onClose={fecharExclusao}
        onSuccess={handleExclusaoSucesso}
        filial={filialExcluindo}
      />

      <ParametrosFilialModal
        isOpen={modalParametrosAberto}
        onClose={fecharParametros}
        filial={filialParametros}
      />
    </>
  );
}
