"use client";

import { useState, useEffect } from "react";
import { Menu, UserCircle, Box } from "lucide-react";

import { DataTable, type ColumnDef } from "../../components/DataTable";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { API_BASE_URL } from "../../config/api";

export default function PaginaAdministracao() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`${API_BASE_URL}/api/empresas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      if (data.sucesso) {
        setEmpresas(data.dados);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleEditar = (empresa: any) => alert(`Editar: ${empresa.nome}`);

  const handleEliminar = async (id: number) => {
    if (confirm("Confirmar exclusão?")) {
      setEmpresas((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const colunas: ColumnDef<any>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Nome", accessorKey: "nome" },
    { header: "E-mail", accessorKey: "email" },
    { header: "Cargo", accessorKey: "cargo" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge
          color={
            item.status === "Ativo"
              ? "success"
              : item.status === "Inativo"
                ? "danger"
                : "warning"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Ações",
      accessorKey: "id",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button size="sm" color="primary" onClick={() => handleEditar(item)}>
            Editar
          </Button>
          <Button
            size="sm"
            color="danger"
            onClick={() => handleEliminar(item.id)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-[#141414] flex flex-col h-full transition-all duration-300 ${isSidebarOpen ? "w-64 translate-x-0 border-r border-[#2a2a2a]" : "w-64 -translate-x-full md:w-0 md:translate-x-0"}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[#2a2a2a] gap-4 shrink-0 w-64">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-[#9ca3af] hover:text-white cursor-pointer outline-none"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-lg">Painel Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 w-64 custom-scrollbar">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-white bg-blue-600/10 rounded-lg border border-blue-500/20"
          >
            <Box size={18} className="text-blue-500" />{" "}
            <span className="font-medium">Gestão de Usuários</span>
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <header className="h-16 bg-[#141414] border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-[#9ca3af]"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer">
            <UserCircle size={20} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-8 pt-8 pb-12 max-w-6xl mx-auto">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">Painel de Usuários AB</h2>
                <p className="text-[#9ca3af] text-sm">
                  Gerenciamento de clientes.
                </p>
              </div>
              <Button
                size="md"
                color="success"
                onClick={() => setModalAberto(true)}
              >
                + Novo Usuário
              </Button>
            </div>

            {carregando ? (
              <div className="w-full p-12 flex flex-col items-center justify-center bg-[#141414] border border-[#2a2a2a] rounded-2xl">
                <p>Carregando...</p>
              </div>
            ) : (
              <DataTable columns={colunas} data={empresas} itemsPerPage={5} />
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Cadastrar Usuário"
      >
        <div className="space-y-4 mb-6">
          <input
            className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-2.5 rounded-lg"
            placeholder="Nome"
          />
          <input
            className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-2.5 rounded-lg"
            placeholder="E-mail"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#2a2a2a] pt-4">
          <Button color="secondary" onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button color="success" onClick={() => setModalAberto(false)}>
            Salvar
          </Button>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
