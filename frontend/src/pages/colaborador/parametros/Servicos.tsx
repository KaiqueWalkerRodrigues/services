"use client";

import { useState } from "react";
import { Sidebar } from "../../../components/Colaborador/SidebarColaborador";
import { DataTableServicos } from "../../../components/DataTables/DataTableServicosPorEmpresa";
import { CadastrarServicoModal } from "../../../components/Modal/CadastrarServicoViaColaboradorModal";
import { EditarServicoModal } from "../../../components/Modal/EditarServicoViaColaboradorModal";
import { DeletarServicoModal } from "../../../components/Modal/DeletarServicoViaColaboradorModal";
import { Wrench } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  peso?: number;
  valor?: number;
  preco?: number;
  criadoEm?: string;
}

export default function PaginaColaboradorServicos() {
  const { usuario } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(
    null,
  );
  const [recarregarTabela, setRecarregarTabela] = useState(0);

  const handleEditar = (servico: Servico) => {
    setServicoSelecionado(servico);
    setModalEditarAberto(true);
  };

  const handleEliminar = (servico: Servico) => {
    setServicoSelecionado(servico);
    setModalDeletarAberto(true);
  };

  const handleVincularFiliais = (servico: Servico) => {
    console.log(
      "Vincular filiais da empresa ID:",
      usuario?.id_empresa,
      "ao serviço:",
      servico,
    );
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
              Serviços
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Gerencie os serviços cadastrados e vincule às filiais
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.6)] transition-transform hover:scale-[1.02]"
          >
            <Wrench className="h-4 w-4" />
            Novo Serviço
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <DataTableServicos
            key={recarregarTabela}
            empresaId={usuario?.id_empresa}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onVincularFiliais={handleVincularFiliais}
            itensPorPagina={10}
          />
        </div>
      </main>

      <CadastrarServicoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={usuario?.id_empresa}
      />

      <EditarServicoModal
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        onSuccess={handleSuccess}
        servico={servicoSelecionado}
      />

      <DeletarServicoModal
        isOpen={modalDeletarAberto}
        onClose={() => setModalDeletarAberto(false)}
        onSuccess={handleSuccess}
        servico={servicoSelecionado}
      />
    </div>
  );
}
