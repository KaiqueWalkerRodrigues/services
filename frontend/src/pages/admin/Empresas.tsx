"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarAdmin } from "../../components/Admin/SidebarAdmin";
import { DataTableEmpresas } from "../../components/DataTables/DataTableEmpresas";
import { Button } from "../../components/Button";
import apiFetch from "../../config/apiFetch";
import { CadastrarEmpresaModal } from "../../components/Modal/CadastrarEmpresaModal";

export default function PaginaEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // função reutilizável, não presa ao useEffect
  const carregarEmpresas = useCallback(async () => {
    try {
      const { data } = await apiFetch.get("/api/empresas");
      setEmpresas(data.dados || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarEmpresas();

    // refaz a busca sempre que o usuário volta pra aba
    const handleFocus = () => carregarEmpresas();
    window.addEventListener("focus", handleFocus);

    // opcional: polling a cada 60s
    const interval = setInterval(carregarEmpresas, 60_000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [carregarEmpresas]);

  const handleEliminar = async (id: string) => {
    try {
      await apiFetch.delete(`/api/empresas/${id}`);
      await carregarEmpresas();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleCriarOuEditar = async () => {
    // depois de salvar (POST/PUT) no seu modal/form:
    await carregarEmpresas();
  };

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
            </div>
            {/* Abrir o modal ao clicar */}
            <Button color="success" onClick={() => setIsModalOpen(true)}>
              + Nova Empresa
            </Button>
          </div>

          {carregando ? (
            <p>Carregando tabela...</p>
          ) : (
            <DataTableEmpresas
              dados={empresas}
              onEditar={handleCriarOuEditar}
              onEliminar={handleEliminar}
            />
          )}
        </div>
      </main>

      <CadastrarEmpresaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={carregarEmpresas}
      />
    </div>
  );
}
