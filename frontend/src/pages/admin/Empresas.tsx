"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarAdmin } from "../../components/Admin/SidebarAdmin";
import { DataTableEmpresas } from "../../components/DataTables/DataTableEmpresas";
import { Button } from "../../components/Button";
import apiFetch from "../../config/apiFetch";
import { CadastrarEmpresaModal } from "../../components/Modal/CadastrarEmpresaModal";
import { EditarEmpresaModal } from "../../components/Modal/EditarEmpresaModal";
import { DeletarEmpresaModal } from "../../components/Modal/DeletarEmpresaModal";
import { EditarColaboradorModal } from "../../components/Modal/EditarColaboradorModal";
import { DeletarColaboradorModal } from "../../components/Modal/DeletarColaboradorModal";

export default function PaginaEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isCadastrarOpen, setIsCadastrarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isDeletarOpen, setIsDeletarOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<any>(null);

  // Reaproveitando os mesmos modais de colaborador usados em PaginaColaboradores
  const [isEditarColaboradorOpen, setIsEditarColaboradorOpen] = useState(false);
  const [isDeletarColaboradorOpen, setIsDeletarColaboradorOpen] =
    useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] =
    useState<any>(null);

  // Incrementado sempre que um colaborador é editado/excluído com sucesso,
  // para avisar o DataTableEmpresas que ele deve recarregar a lista do modal.
  const [colaboradoresRefreshKey, setColaboradoresRefreshKey] = useState(0);

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

  const handleEditarColaborador = (colaborador: any) => {
    setColaboradorSelecionado(colaborador);
    setIsEditarColaboradorOpen(true);
  };

  const handleEliminarColaborador = (colaborador: any) => {
    setColaboradorSelecionado(colaborador);
    setIsDeletarColaboradorOpen(true);
  };

  const handleColaboradorAtualizado = () => {
    // Avisa o DataTableEmpresas para recarregar a lista de colaboradores do modal aberto
    setColaboradoresRefreshKey((prev) => prev + 1);
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
              onEditarColaborador={handleEditarColaborador}
              onEliminarColaborador={handleEliminarColaborador}
              colaboradoresRefreshKey={colaboradoresRefreshKey}
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

      {colaboradorSelecionado && (
        <EditarColaboradorModal
          isOpen={isEditarColaboradorOpen}
          onClose={() => {
            setIsEditarColaboradorOpen(false);
            setColaboradorSelecionado(null);
          }}
          onSuccess={() => {
            handleColaboradorAtualizado();
          }}
          colaborador={colaboradorSelecionado}
        />
      )}

      {colaboradorSelecionado && isDeletarColaboradorOpen && (
        <DeletarColaboradorModal
          isOpen={isDeletarColaboradorOpen}
          onClose={() => {
            setIsDeletarColaboradorOpen(false);
            setColaboradorSelecionado(null);
          }}
          onSuccess={() => {
            handleColaboradorAtualizado();
          }}
          colaborador={colaboradorSelecionado}
        />
      )}
    </div>
  );
}
