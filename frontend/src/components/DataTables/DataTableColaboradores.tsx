"use client";

import { useState } from "react";
import { DataTable, type ColumnDef } from "../DataTable";
import { Button } from "../Button";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

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
}

export function DataTableColaboradores({
  dados,
  onEditar,
  onEliminar,
}: DataTableColaboradorProps) {
  const [isEmpresasModalOpen, setIsEmpresasModalOpen] = useState(false);
  const [empresasVinculadas, setEmpresasVinculadas] = useState<string[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] =
    useState<Colaborador | null>(null);

  const abrirModalEmpresas = async (item: Colaborador) => {
    setColaboradorSelecionado(item);
    setEmpresasVinculadas([]);

    try {
      const { data } = await apiFetch.get("/api/empresas");
      const empresas = Array.isArray(data?.dados) ? data.dados : [];
      const ids = (item.empresas || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map(Number);

      const vinculadas = empresas
        .filter((empresa: any) => ids.includes(Number(empresa.id_empresa)))
        .map((empresa: any) => empresa.nome);

      setEmpresasVinculadas(vinculadas);
    } catch (error) {
      console.error("Erro ao carregar empresas do colaborador:", error);
      showToast({
        type: "error",
        message: "Não foi possível carregar as empresas do colaborador.",
      });
    } finally {
      setIsEmpresasModalOpen(true);
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
        isOpen={isEmpresasModalOpen}
        onClose={() => {
          setIsEmpresasModalOpen(false);
          setColaboradorSelecionado(null);
        }}
        title={`Empresas de ${colaboradorSelecionado?.nome ?? ""}`}
        size="md"
      >
        <div className="space-y-2">
          {empresasVinculadas.length > 0 ? (
            empresasVinculadas.map((empresa) => (
              <div
                key={empresa}
                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-gray-200"
              >
                {empresa}
              </div>
            ))
          ) : (
            <p className="text-gray-400">Nenhuma empresa vinculada.</p>
          )}
        </div>
      </Modal>
    </>
  );
}
