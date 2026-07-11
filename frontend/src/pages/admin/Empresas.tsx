"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarAdmin } from "../../components/Admin/SidebarAdmin";
import { DataTableEmpresas } from "../../components/DataTables/DataTableEmpresas";
import { Button } from "../../components/Button";
import apiFetch from "../../config/apiFetch";
import { CadastrarEmpresaModal } from "../../components/Modal/CadastrarEmpresaModal";
import { EditarEmpresaModal } from "../../components/Modal/EditarEmpresaModal";
import { DeletarEmpresaModal } from "../../components/Modal/DeletarEmpresaModal";

export default function PaginaEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isCadastrarOpen, setIsCadastrarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isDeletarOpen, setIsDeletarOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<any>(null);

  const carregarEmpresas = useCallback(async () => {
    try {
      const { data } = await apiFetch.get("/api/empresas");
      setEmpresas(data.dados || []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarEmpresas();

    const handleFocus = () => carregarEmpresas();
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(carregarEmpresas, 60_000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [carregarEmpresas]);

  const handleEditar = (empresa: any) => {
    setEmpresaSelecionada(empresa);
    setIsEditarOpen(true);
  };

  const handleEliminar = (empresa: any) => {
    setEmpresaSelecionada(empresa);
    setIsDeletarOpen(true);
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
            <Button color="success" onClick={() => setIsCadastrarOpen(true)}>
              + Nova Empresa
            </Button>
          </div>

          {carregando ? (
            <p>Carregando tabela...</p>
          ) : (
            <DataTableEmpresas
              dados={empresas}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
            />
          )}
        </div>
      </main>

      <CadastrarEmpresaModal
        isOpen={isCadastrarOpen}
        onClose={() => setIsCadastrarOpen(false)}
        onSuccess={carregarEmpresas}
      />

      {empresaSelecionada && (
        <EditarEmpresaModal
          isOpen={isEditarOpen}
          onClose={() => {
            setIsEditarOpen(false);
            setEmpresaSelecionada(null);
          }}
          onSuccess={carregarEmpresas}
          empresa={empresaSelecionada}
        />
      )}

      {empresaSelecionada && isDeletarOpen && (
        <DeletarEmpresaModal
          isOpen={isDeletarOpen}
          onClose={() => {
            setIsDeletarOpen(false);
            setEmpresaSelecionada(null);
          }}
          onSuccess={carregarEmpresas}
          empresa={empresaSelecionada}
        />
      )}
    </div>
  );
}
