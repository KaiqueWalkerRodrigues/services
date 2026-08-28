"use client";

import { useState } from "react";
import { Sidebar } from "../../../components/Colaborador/SidebarColaborador";
import { DataTableFiliaisPorEmpresa } from "../../../components/DataTables/DataTableFiliaisPorEmpresa";
import { CadastrarFilialModal } from "../../../components/Modal/CadastrarFilialViaColaboradorModal";
import { Building2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

interface Filial {
  id: string;
  nome: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  criadoEm?: string;
}

export default function PaginaColaboradorFilial() {
  const { usuario } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recarregarTabela, setRecarregarTabela] = useState(0);

  const handleEditar = (filial: Filial) => {
    console.log("Editar filial:", filial);
  };

  const handleEliminar = (filial: Filial) => {
    console.log("Eliminar filial:", filial);
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
              Filiais
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Gerencie as filiais cadastradas
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.6)] transition-transform hover:scale-[1.02]"
          >
            <Building2 className="h-4 w-4" />
            Nova Filial
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <DataTableFiliaisPorEmpresa
            key={recarregarTabela}
            empresaId={usuario?.id_empresa}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            itensPorPagina={10}
          />
        </div>
      </main>

      <CadastrarFilialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={usuario?.id_empresa}
      />
    </div>
  );
}
