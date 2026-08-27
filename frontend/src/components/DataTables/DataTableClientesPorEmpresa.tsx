import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  UserCircle2,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Edit,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import apiFetch from "../../config/apiFetch";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  criadoEm?: string;
}

interface ClienteApi {
  id_cliente?: string | number;
  id?: string | number;
  nome?: string;
  email?: string;
  celular?: string;
  telefone?: string;
  created_at?: string;
  criadoEm?: string;
}

interface DataTableClientesProps {
  empresaId: string;
  onEditar?: (cliente: Cliente) => void;
  onEliminar?: (cliente: Cliente) => void;
  refreshKey?: number;
  itensPorPagina?: number;
}

type Ordenacao = "nome-asc" | "nome-desc" | "recente" | "antigo";

const ALTURA_LINHA_PADRAO = 44; // usado só até a 1ª linha real ser medida

export function DataTableClientes({
  empresaId,
  onEditar,
  onEliminar,
  refreshKey = 0,
  itensPorPagina = 10,
}: DataTableClientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome-asc");
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Refs para medir as áreas reais (em vez de estimar com números fixos)
  const areaTabelaRef = useRef<HTMLDivElement>(null); // div que contém thead + tbody (overflow-hidden)
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const primeiraLinhaRef = useRef<HTMLTableRowElement>(null);

  const [linhasPorPagina, setLinhasPorPagina] = useState(itensPorPagina);
  const alturaLinhaRef = useRef(ALTURA_LINHA_PADRAO);

  // Recalcula quantas linhas cabem, usando medidas reais do DOM.
  // Roda ao redimensionar o container (não depende do "carregando",
  // já que a div medida está sempre montada).
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

      // só atualiza se realmente mudou, evita loops/"linha fantasma"
      setLinhasPorPagina((atual) => (atual === linhas ? atual : linhas));
    };

    recalcular();
    const observer = new ResizeObserver(recalcular);
    observer.observe(areaEl);
    return () => observer.disconnect();
  }, []);

  // Depois que os dados chegam e a 1ª linha é renderizada de verdade,
  // remedimos uma vez para pegar a altura real da linha (com dados reais).
  useLayoutEffect(() => {
    if (carregando || !primeiraLinhaRef.current || !areaTabelaRef.current)
      return;

    const alturaThead = theadRef.current?.offsetHeight ?? 40;
    const alturaLinha = primeiraLinhaRef.current.offsetHeight;
    if (!alturaLinha) return;

    alturaLinhaRef.current = alturaLinha;
    const alturaDisponivel = areaTabelaRef.current.clientHeight - alturaThead;
    const linhas = Math.max(3, Math.floor(alturaDisponivel / alturaLinha));

    setLinhasPorPagina((atual) => (atual === linhas ? atual : linhas));
  }, [carregando, clientes.length]);

  useEffect(() => {
    async function carregarClientes() {
      if (!empresaId) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        const response = await apiFetch.get(
          `/api/clientes/listarPorEmpresa?empresa=${empresaId}`,
        );

        const dadosBrutos =
          response.data?.exists?.dados || response.data?.dados || [];

        const clientesFormatados: Cliente[] = Array.from(
          new Map(
            dadosBrutos.map((item: ClienteApi) => {
              const cliente = {
                id: String(item.id_cliente || item.id),
                nome: item.nome || "",
                email: item.email,
                telefone: item.celular || item.telefone,
                criadoEm: item.created_at || item.criadoEm,
              };
              return [cliente.id, cliente] as const;
            }),
          ).values(),
        );

        setClientes(clientesFormatados);
      } catch (error) {
        console.error("Erro ao carregar clientes da empresa:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarClientes();
  }, [empresaId, refreshKey]);

  const clientesFiltrados = useMemo(() => {
    return clientes
      .filter((cliente) => {
        const termo = busca.toLowerCase();
        const nomeMatch = cliente.nome?.toLowerCase().includes(termo);
        const emailMatch = cliente.email?.toLowerCase().includes(termo);
        const telefoneMatch = cliente.telefone?.toLowerCase().includes(termo);
        return nomeMatch || emailMatch || telefoneMatch;
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
  }, [clientes, busca, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(clientesFiltrados.length / linhasPorPagina),
  );

  const paginaVisivel = Math.min(paginaAtual, totalPaginas);

  const clientesPaginados = useMemo(() => {
    const inicio = (paginaVisivel - 1) * linhasPorPagina;
    return clientesFiltrados.slice(inicio, inicio + linhasPorPagina);
  }, [clientesFiltrados, paginaVisivel, linhasPorPagina]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* Barra de Busca e Filtros */}
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
            placeholder="Buscar por nome, email ou telefone..."
            className="w-full rounded-xl border border-white/5 bg-white/[0.03] pl-10 pr-4 py-1.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]"
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
            className="rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-sm text-zinc-300 outline-none transition-colors focus:border-violet-500/50 cursor-pointer"
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

      {/* Tabela — sem rolagem, colunas se adaptam ao tamanho da tela */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] min-h-0">
        <div ref={areaTabelaRef} className="flex-1 overflow-hidden">
          <table className="w-full table-fixed border-collapse text-left">
            <thead ref={theadRef} className="bg-[#0c0c14] shadow-sm">
              <tr className="border-b border-white/5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                <th className="w-[40%] sm:w-[30%] px-3 py-2.5">Cliente</th>
                <th className="hidden sm:table-cell sm:w-[28%] px-3 py-2.5">
                  Email
                </th>
                <th className="hidden md:table-cell md:w-[16%] px-3 py-2.5">
                  Celular
                </th>
                <th className="hidden lg:table-cell lg:w-[14%] px-3 py-2.5">
                  Cadastro
                </th>
                <th className="w-[30%] sm:w-[12%] px-3 py-2.5 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {carregando ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-zinc-400 text-sm"
                  >
                    Carregando clientes...
                  </td>
                </tr>
              ) : clientesPaginados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-zinc-500 text-sm"
                  >
                    Nenhum cliente corresponde à sua busca.
                  </td>
                </tr>
              ) : (
                clientesPaginados.map((cliente, index) => (
                  <tr
                    key={cliente.id}
                    ref={index === 0 ? primeiraLinhaRef : undefined}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-2.5 truncate">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                          <UserCircle2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {cliente.nome}
                          </p>
                          {/* Em telas pequenas, mostra o email embaixo do nome */}
                          {cliente.email && (
                            <p className="truncate text-xs text-zinc-500 sm:hidden">
                              {cliente.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2.5 truncate">
                      {cliente.email && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate">{cliente.email}</span>
                        </span>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-3 py-2.5 truncate">
                      {cliente.telefone && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate">{cliente.telefone}</span>
                        </span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2.5 text-xs text-zinc-400 truncate">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                        {cliente.criadoEm
                          ? new Date(cliente.criadoEm).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEditar && (
                          <button
                            onClick={() => onEditar(cliente)}
                            className="rounded-md border border-white/5 bg-white/5 p-1.5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                            title="Editar"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onEliminar && (
                          <button
                            onClick={() => onEliminar(cliente)}
                            className="rounded-md border border-red-500/15 bg-red-500/10 p-1.5 text-red-400 transition-colors hover:bg-red-500/20"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        {!carregando && clientesFiltrados.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 px-3 py-2 bg-white/[0.01]">
            <span className="text-xs text-zinc-500">
              Mostrando {(paginaVisivel - 1) * linhasPorPagina + 1}
              {"–"}
              {Math.min(
                paginaVisivel * linhasPorPagina,
                clientesFiltrados.length,
              )}{" "}
              de {clientesFiltrados.length} clientes
            </span>

            <div className="flex items-center gap-1">
              <button
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
  );
}
