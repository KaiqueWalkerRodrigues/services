"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarAdmin } from "../../components/Admin/SidebarAdmin";
import { DataTableColaboradores } from "../../components/DataTables/DataTableColaboradores";
import { Button } from "../../components/Button";
import apiFetch from "../../config/apiFetch";
import { CadastrarColaboradorModal } from "../../components/Modal/CadastrarColaboradorModal";
import { EditarColaboradorModal } from "../../components/Modal/EditarColaboradorModal";
import { DeletarColaboradorModal } from "../../components/Modal/DeletarColaboradorModal";
import { TrocarSenhaColaboradorModal } from "../../components/Modal/TrocarSenhaColaboradorModal"; // <-- Faltava esta importação

export default function PaginaColaboradores() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isCadastrarOpen, setIsCadastrarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isTrocarSenhaOpen, setIsTrocarSenhaOpen] = useState(false);
  const [isDeletarOpen, setIsDeletarOpen] = useState(false);
  const [colaboradorSelecionada, setColaboradorSelecionada] =
    useState<any>(null);

  const carregarColaboradores = useCallback(async () => {
    try {
      const { data } = await apiFetch.get("/api/colaboradores");
      setColaboradores(data.dados || []);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarColaboradores();

    const handleFocus = () => carregarColaboradores();
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(carregarColaboradores, 60_000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [carregarColaboradores]);

  const handleEditar = (colaborador: any) => {
    setColaboradorSelecionada(colaborador);
    setIsEditarOpen(true);
  };

  const handleTrocarSenha = (colaborador: any) => {
    setColaboradorSelecionada(colaborador);
    setIsTrocarSenhaOpen(true);
  };

  const handleEliminar = (colaborador: any) => {
    setColaboradorSelecionada(colaborador);
    setIsDeletarOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      <SidebarAdmin
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="colaboradores"
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Todos Colaboradores</h2>
            </div>
            <Button color="success" onClick={() => setIsCadastrarOpen(true)}>
              + Novo Colaborador
            </Button>
          </div>

          {carregando ? (
            <p>Carregando tabela...</p>
          ) : (
            <DataTableColaboradores
              dados={colaboradores}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              onTrocarSenha={handleTrocarSenha}
              isOpen={true}
              onAtualizarDados={carregarColaboradores}
            />
          )}
        </div>
      </main>

      <CadastrarColaboradorModal
        isOpen={isCadastrarOpen}
        onClose={() => setIsCadastrarOpen(false)}
        onSuccess={carregarColaboradores}
      />

      {colaboradorSelecionada && (
        <EditarColaboradorModal
          isOpen={isEditarOpen}
          onClose={() => {
            setIsEditarOpen(false);
            setColaboradorSelecionada(null);
          }}
          onSuccess={carregarColaboradores}
          colaborador={colaboradorSelecionada}
        />
      )}

      {colaboradorSelecionada && (
        <TrocarSenhaColaboradorModal
          isOpen={isTrocarSenhaOpen}
          onClose={() => {
            setIsTrocarSenhaOpen(false);
            setColaboradorSelecionada(null);
          }}
          onSuccess={carregarColaboradores}
          colaborador={colaboradorSelecionada}
        />
      )}

      {colaboradorSelecionada && isDeletarOpen && (
        <DeletarColaboradorModal
          isOpen={isDeletarOpen}
          onClose={() => {
            setIsDeletarOpen(false);
            setColaboradorSelecionada(null);
          }}
          onSuccess={carregarColaboradores}
          colaborador={colaboradorSelecionada}
        />
      )}
    </div>
  );
}
