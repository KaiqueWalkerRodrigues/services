"use client";

import { Sidebar } from "../../../components/Colaborador/SidebarColaborador";
import { ParametrosGeraisFormulario } from "../../../components/Formularios/ParametrosGeraisFormulario";
import { useAuth } from "../../../hooks/useAuth";

export default function PaginaParametrosGerais() {
  const { usuario } = useAuth();

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#07070b] text-zinc-100">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-8">
        <div className="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Parâmetros Gerais
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Configure o tempo de agendamento e o intervalo entre os
              atendimentos
            </p>
          </div>
        </div>

        <div className="max-w-3xl">
          <ParametrosGeraisFormulario empresaId={usuario?.id_empresa} />
        </div>
      </main>
    </div>
  );
}
