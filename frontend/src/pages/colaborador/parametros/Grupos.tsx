"use client";

import { useState } from "react";
import { Sidebar } from "../../../components/Colaborador/SidebarColaborador";
import { DataTableGruposPorEmpresa } from "../../../components/DataTables/DataTableGruposPorEmpresa";
import { CadastrarGrupoModal } from "../../../components/Modal/CadastrarGrupoViaColaboradorModal";
import { Layers } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

interface Grupo {
  id: string;
  nome: string;
  criadoEm?: string;
}

export default function PaginaColaboradorGrupos() {
  const { usuario } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recarregarTabela, setRecarregarTabela] = useState(0);

  const handleEditar = (grupo: Grupo) => {
    console.log("Editar grupo:", grupo);
  };

  const handleEliminar = (grupo: Grupo) => {
    console.log("Eliminar grupo:", grupo);
  };

  const handleSuccess = () => {
    setRecarregarTabela((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#07070b] text-zinc-100">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-8">
        <div className="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Grupos
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Gerencie os grupos de permissões cadastrados
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.6)] transition-transform hover:scale-[1.02]"
          >
            <Layers className="h-4 w-4" />
            Novo Grupo
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <DataTableGruposPorEmpresa
            key={recarregarTabela}
            empresaId={usuario?.id_empresa}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            itensPorPagina={10}
          />
        </div>
      </main>

      <CadastrarGrupoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={usuario?.id_empresa}
      />
    </div>
  );
}
