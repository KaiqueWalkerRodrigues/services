"use client";

import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "../DataTable";
import { Button } from "../Button";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface Empresa {
  id_empresa: number;
  codigo_empresa: string;
  nome: string;
  created_at: string;
}

interface Colaborador {
  id_colaborador: number;
  nome: string;
  login: string;
  created_at: string;
  updated_at: string;
  empresas?: string | null;
}

interface DataTableEmpresasProps {
  dados: Empresa[];
  onEditar: (item: Empresa) => void;
  onEliminar: (item: Empresa) => void;
  onEditarColaborador: (item: Colaborador) => void;
  onEliminarColaborador: (item: Colaborador) => void;
  // Incrementado pela página sempre que um colaborador é editado/excluído
  // com sucesso, para disparar o recarregamento da lista aqui dentro.
  colaboradoresRefreshKey?: number;
}

export function DataTableEmpresas({
  dados,
  onEditar,
  onEliminar,
  onEditarColaborador,
  onEliminarColaborador,
  colaboradoresRefreshKey,
}: DataTableEmpresasProps) {
  const [isColaboradoresModalOpen, setIsColaboradoresModalOpen] =
    useState(false);
  const [colaboradoresDaEmpresa, setColaboradoresDaEmpresa] = useState<
    Colaborador[]
  >([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(
    null,
  );

  const carregarColaboradoresDaEmpresa = async (empresa: Empresa) => {
    setLoadingColaboradores(true);

    try {
      const { data } = await apiFetch.get("/api/colaboradores");
      const todosColaboradores: Colaborador[] = Array.isArray(data?.dados)
        ? data.dados
        : [];

      const filtrados = todosColaboradores.filter((colaborador) => {
        if (!colaborador.empresas) return false;

        const idsEmpresasVinculadas = colaborador.empresas
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .map(Number);

        return idsEmpresasVinculadas.includes(Number(empresa.id_empresa));
      });

      setColaboradoresDaEmpresa(filtrados);
    } catch (error) {
      console.error("Erro ao carregar colaboradores da empresa:", error);
      showToast({
        type: "error",
        message: "Não foi possível carregar os colaboradores desta empresa.",
      });
    } finally {
      setLoadingColaboradores(false);
    }
  };

  const abrirModalColaboradores = async (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setColaboradoresDaEmpresa([]);
    setIsColaboradoresModalOpen(true);
    await carregarColaboradoresDaEmpresa(empresa);
  };

  // Sempre que a página avisar (via colaboradoresRefreshKey) que um colaborador
  // foi editado/excluído, recarrega a lista se o modal estiver aberto.
  useEffect(() => {
    if (!isColaboradoresModalOpen || !empresaSelecionada) return;
    if (colaboradoresRefreshKey === undefined) return;

    carregarColaboradoresDaEmpresa(empresaSelecionada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresRefreshKey]);

  const colunasColaboradores: ColumnDef<Colaborador>[] = [
    { header: "#", accessorKey: "id_colaborador" },
    { header: "Nome", accessorKey: "nome" },
    { header: "Login", accessorKey: "login" },
    {
      header: "Criado em",
      accessorKey: "created_at",
      cell: (item) => new Date(item.created_at).toLocaleDateString("pt-BR"),
    },
    {
      header: "Alterado em",
      accessorKey: "updated_at",
      cell: (item) => new Date(item.updated_at).toLocaleDateString("pt-BR"),
    },
    {
      header: "Ações",
      accessorKey: "id_colaborador",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="primary"
            onClick={() => onEditarColaborador(item)}
          >
            Editar
          </Button>

          <Button
            size="sm"
            color="danger"
            onClick={() => onEliminarColaborador(item)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  const colunas: ColumnDef<Empresa>[] = [
    { header: "Código", accessorKey: "codigo_empresa" },
    { header: "Nome da Empresa", accessorKey: "nome" },
    {
      header: "Criada em",
      accessorKey: "created_at",
      cell: (item) => new Date(item.created_at).toLocaleDateString("pt-BR"),
    },
    {
      header: "Ações",
      accessorKey: "id_empresa",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="warning"
            onClick={() => abrirModalColaboradores(item)}
          >
            Colaboradores
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

  return (
    <>
      <DataTable columns={colunas} data={dados} itemsPerPage={5} />

      <Modal
        isOpen={isColaboradoresModalOpen}
        onClose={() => {
          setIsColaboradoresModalOpen(false);
          setEmpresaSelecionada(null);
          setColaboradoresDaEmpresa([]);
        }}
        title={`Colaboradores de ${empresaSelecionada?.nome ?? ""}`}
        size="semi-full"
      >
        <div className="flex h-full w-full flex-col gap-4 text-white">
          {loadingColaboradores ? (
            <p className="text-sm text-gray-400">Carregando colaboradores...</p>
          ) : colaboradoresDaEmpresa.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <DataTable
                columns={colunasColaboradores}
                data={colaboradoresDaEmpresa}
                itemsPerPage={5}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Nenhum colaborador vinculado a esta empresa.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
