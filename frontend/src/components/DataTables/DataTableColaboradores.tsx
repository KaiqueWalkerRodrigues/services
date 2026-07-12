"use client";

import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "../DataTable";
import { Button } from "../Button";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";
import { CustomSelect } from "../CustomSelect";
import { Plus, Minus } from "lucide-react";

interface Colaborador {
  id_colaborador: number;
  nome: string;
  login: string;
  created_at: string;
  updated_at: string;
  empresas?: string | null;
}

interface DataTableColaboradorProps {
  dados: Colaborador[];
  onEditar: (item: Colaborador) => void;
  onEliminar: (id: Colaborador) => void;
  onTrocarSenha: (item: Colaborador) => void;
  onAtualizarDados?: () => void; // Opcional: para atualizar a tabela principal em segundo plano
  isOpen: boolean;
}

interface EmpresaOption {
  id_empresa: number;
  nome: string;
  codigo_empresa: number | string;
}

export function DataTableColaboradores({
  dados,
  onEditar,
  onEliminar,
  onTrocarSenha,
  onAtualizarDados,
  isOpen,
}: DataTableColaboradorProps) {
  const [isEmpresasModalOpen, setIsEmpresasModalOpen] = useState(false);
  const [empresasVinculadas, setEmpresasVinculadas] = useState<string[]>([]);
  const [empresasIdsVinculadas, setEmpresasIdsVinculadas] = useState<number[]>(
    [],
  );
  const [idEmpresa, setIdEmpresa] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] =
    useState<Colaborador | null>(null);

  const abrirModalEmpresas = async (item: Colaborador) => {
    setColaboradorSelecionado(item);
    setEmpresasVinculadas([]);
    setEmpresasIdsVinculadas([]);
    setLoading(true);

    try {
      // 1. Busca a lista global de empresas disponíveis
      const responseEmpresas = await apiFetch.get("/api/empresas");
      const listaEmpresas = Array.isArray(responseEmpresas.data?.dados)
        ? responseEmpresas.data.dados
        : [];
      setEmpresas(listaEmpresas);

      // 2. ✨ BUSCA REAL EM TEMPO REAL: Pega os dados mais recentes do colaborador direto da API
      // Nota: Ajuste o endpoint "/api/colaboradores/" se o seu backend usar outra rota para buscar um único item
      const responseColaborador = await apiFetch.get(
        `/api/colaboradores/${item.id_colaborador}`,
      );
      const colaboradorAtualizado =
        responseColaborador.data?.dados || responseColaborador.data;

      // Se a API retornou o colaborador atualizado, usamos a string de empresas dele, senão usamos o fallback do 'item'
      const stringEmpresas =
        colaboradorAtualizado?.empresas ?? item.empresas ?? "";

      const ids = stringEmpresas
        .split(",")
        .map((value: string) => value.trim())
        .filter(Boolean)
        .map(Number);

      setEmpresasIdsVinculadas(ids);

      const vinculadas = listaEmpresas
        .filter((empresa: EmpresaOption) =>
          ids.includes(Number(empresa.id_empresa)),
        )
        .map((empresa: EmpresaOption) => empresa.nome);

      setEmpresasVinculadas(vinculadas);
      setIsEmpresasModalOpen(true);
    } catch (error) {
      console.error(
        "Erro ao carregar dados atualizados do colaborador:",
        error,
      );
      showToast({
        type: "error",
        message:
          "Não foi possível carregar as empresas atualizadas do colaborador.",
      });
    } finally {
      setLoading(false);
    }
  };

  const colunas: ColumnDef<Colaborador>[] = [
    { header: "#", accessorKey: "id_colaborador" },
    { header: "Nome", accessorKey: "nome" },
    { header: "Login", accessorKey: "login" },
    {
      header: "Empresas",
      accessorKey: "empresas",
      cell: (item) => (
        <Button
          size="sm"
          color="secondary"
          onClick={() => abrirModalEmpresas(item)}
        >
          Ver Empresas
        </Button>
      ),
    },
    {
      header: "Criado em",
      accessorKey: "created_at",
      cell: (item) => new Date(item.created_at).toLocaleDateString("pt-BR"),
    },
    {
      header: "Editado em",
      accessorKey: "updated_at",
      cell: (item) => new Date(item.updated_at).toLocaleDateString("pt-BR"),
    },
    {
      header: "Ações",
      accessorKey: "id_colaborador",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button size="sm" color="pink" onClick={() => onTrocarSenha(item)}>
            Trocar Senha
          </Button>
          <Button size="sm" color="primary" onClick={() => onEditar(item)}>
            Editar
          </Button>
          <Button size="sm" color="danger" onClick={() => onEliminar(item)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const carregarEmpresas = async () => {
      try {
        const { data } = await apiFetch.get("/api/empresas");
        const lista = Array.isArray(data?.dados) ? data.dados : [];
        setEmpresas(lista);
        setIdEmpresa("");
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        showToast({
          type: "error",
          message: "Não foi possível carregar as empresas.",
        });
      }
    };

    carregarEmpresas();
  }, [isOpen]);

  const handleAdicionarEmpresa = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!colaboradorSelecionado || !idEmpresa) return;

    setLoading(true);

    try {
      await apiFetch.post("/api/colaboradores/adicionarEmpresa", {
        id_empresa: Number(idEmpresa),
        id_colaborador: Number(colaboradorSelecionado.id_colaborador),
      });

      showToast({
        type: "success",
        message: "Empresa vinculada com sucesso!",
      });

      const novoId = Number(idEmpresa);
      const empresaAdicionada = empresas.find(
        (e) => Number(e.id_empresa) === novoId,
      );

      setEmpresasIdsVinculadas((prev) => [...prev, novoId]);
      if (empresaAdicionada) {
        setEmpresasVinculadas((prev) => [...prev, empresaAdicionada.nome]);
      }

      setIdEmpresa("");

      if (onAtualizarDados) onAtualizarDados();
    } catch (error: any) {
      console.error("Erro ao vincular empresa:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        "Não foi possível vincular a empresa.";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverEmpresa = async (idEmpresaRemover: number) => {
    if (!colaboradorSelecionado) return;

    try {
      await apiFetch.post("/api/colaboradores/removerEmpresa", {
        id_empresa: idEmpresaRemover,
        id_colaborador: Number(colaboradorSelecionado.id_colaborador),
      });

      showToast({
        type: "success",
        message: "Empresa removida com sucesso!",
      });

      const index = empresasIdsVinculadas.indexOf(idEmpresaRemover);

      setEmpresasIdsVinculadas((prev) =>
        prev.filter((id) => id !== idEmpresaRemover),
      );
      setEmpresasVinculadas((prev) => prev.filter((_, i) => i !== index));

      if (onAtualizarDados) onAtualizarDados();
    } catch (error: any) {
      console.error("Erro ao remover empresa:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        "Não foi possível remover a empresa.";
      showToast({ type: "error", message: errorMessage });
    }
  };

  return (
    <>
      <DataTable columns={colunas} data={dados} itemsPerPage={5} />

      <Modal
        isOpen={isEmpresasModalOpen}
        onClose={() => {
          setIsEmpresasModalOpen(false);
          setColaboradorSelecionado(null);
        }}
        title={`Empresas de ${colaboradorSelecionado?.nome ?? ""}`}
        size="semi-full"
      >
        <div className="flex h-full w-full flex-col gap-4">
          <form
            onSubmit={handleAdicionarEmpresa}
            className="flex w-full items-center gap-2"
          >
            <div className="flex-1">
              <CustomSelect
                options={empresas
                  .filter(
                    (e) =>
                      !empresasIdsVinculadas.includes(Number(e.id_empresa)),
                  )
                  .map((e) => ({ value: String(e.id_empresa), label: e.nome }))}
                value={idEmpresa}
                onChange={(val) => setIdEmpresa(val)}
                placeholder="Selecione uma empresa"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              color="success"
              size="sm"
              disabled={loading || !idEmpresa || idEmpresa === ""}
            >
              <Plus />
            </Button>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {empresasVinculadas.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {empresasVinculadas.map((nomeEmpresa, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5"
                  >
                    <span className="flex-1 truncate text-sm text-gray-200">
                      {nomeEmpresa}
                    </span>
                    <Button
                      type="button"
                      color="danger"
                      size="sm"
                      onClick={() =>
                        handleRemoverEmpresa(empresasIdsVinculadas[index])
                      }
                    >
                      <Minus />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhuma empresa vinculada.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
