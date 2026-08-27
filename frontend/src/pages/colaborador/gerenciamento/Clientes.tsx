"use client";

import { Sidebar } from "../../../components/Colaborador/SidebarColaborador";
import { DataTableClientes } from "../../../components/DataTables/DataTableClientesPorEmpresa";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  criadoEm?: string;
}

export default function PaginaColaboradorCliente() {
  const { usuario } = useAuth();

  const handleEditar = (cliente: Cliente) => {
    console.log("Editar cliente:", cliente);
  };

  const handleEliminar = (cliente: Cliente) => {
    console.log("Eliminar cliente:", cliente);
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#07070b] text-zinc-100">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Cabeçalho */}
        <div className="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Clientes
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Gerencie os clientes cadastrados
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.6)] transition-transform hover:scale-[1.02]"
          >
            <UserPlus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Tabela de Clientes */}
        <div className="min-h-0 flex-1">
          <DataTableClientes
            empresaId={usuario?.id_empresa}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            itensPorPagina={10}
          />
        </div>
      </main>
    </div>
  );
}
