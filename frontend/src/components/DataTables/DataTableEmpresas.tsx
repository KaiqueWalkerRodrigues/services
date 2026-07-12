"use client";

import { DataTable, type ColumnDef } from "../DataTable";
import { Button } from "../Button";

// Atualizamos a interface para corresponder ao retorno da API
interface Empresa {
  id_empresa: number;
  codigo_empresa: string;
  nome: string;
  created_at: string;
}

interface DataTableEmpresasProps {
  dados: Empresa[];
  onEditar: (item: Empresa) => void;
  onEliminar: (item: Empresa) => void;
}

export function DataTableEmpresas({
  dados,
  onEditar,
  onEliminar,
}: DataTableEmpresasProps) {
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
          <Button size="sm" color="warning" onClick={() => onEditar(item)}>
            Usuários
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

  return <DataTable columns={colunas} data={dados} itemsPerPage={5} />;
}
