"use client";

import { useState, useEffect } from "react";
import { SidebarAdmin } from "../../components/Admin/SidebarAdmin";
import { DataTableEmpresas } from "../../components/DataTables/DataTableEmpresas";
import { Button } from "../../components/Button";
import apiFetch from "../../config/apiFetch";

export default function PaginaEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        const { data } = await apiFetch.get("/api/empresas");
        setEmpresas(data.dados || []);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setCarregando(false);
      }
    };
    carregarEmpresas();
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      <SidebarAdmin
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="empresas"
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Empresas</h2>
              <p className="text-[#9ca3af] text-sm">
                Gerencie todas as empresas registradas.
              </p>
            </div>
            <Button color="success">+ Nova Empresa</Button>
          </div>

          {carregando ? (
            <p>Carregando tabela...</p>
          ) : (
            <DataTableEmpresas
              dados={empresas}
              onEditar={(e) => console.log(e)}
              onEliminar={(id) => console.log(id)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
