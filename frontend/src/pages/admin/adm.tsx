"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Menu, UserCircle, LayoutDashboard, FileText, 
  AppWindow, GitMerge, Layout, Box, Wrench, Filter,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X
} from "lucide-react";

import { DataTable, type ColumnDef } from "../../components/DataTable";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal"; 

export default function PaginaAdministracao() {
  // ─── ESTADOS DO CRUD E UI ────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estado para recolher/expandir a barra lateral
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Efeito para ajustar a barra lateral dependendo do tamanho da tela (responsividade)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false); // Fecha em dispositivos móveis
      } else {
        setIsSidebarOpen(true); // Abre em computadores
      }
    };

    handleResize(); // Executa ao carregar a página
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── READ (Ler/Buscar os dados no Banco via API) ─────────────────────────
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosMock = [
          { id: 1, nome: "Ana Silva", email: "ana@email.com", cargo: "Desenvolvedora", status: "Ativo" },
          { id: 2, nome: "Carlos Souza", email: "carlos@email.com", cargo: "Designer", status: "Inativo" },
          { id: 3, nome: "Beatriz Lima", email: "bia@email.com", cargo: "Gerente", status: "Ativo" },
          { id: 4, nome: "Fernando Costa", email: "fernando@email.com", cargo: "Analista", status: "Pendente" },
          { id: 5, nome: "Lucas Mendes", email: "lucas@email.com", cargo: "Suporte", status: "Ativo" },
        ];
        
        setTimeout(() => {
          setUsuarios(dadosMock);
          setCarregando(false);
        }, 800);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  // ─── AÇÕES DO CRUD ───────────────────────────────────────────────────────
  const handleCriar = () => setModalAberto(true);
  const handleEditar = (usuario: any) => alert(`Ação: Editar os dados de ${usuario.nome}`);
  const handleEliminar = async (id: number) => {
    if (confirm("Tem certeza que deseja eliminar este registro? Esta ação não pode ser desfeita.")) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  // ─── CONFIGURAÇÃO DAS COLUNAS DA TABELA ──────────────────────────────────
  const colunas: ColumnDef<any>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Nome", accessorKey: "nome" },
    { header: "E-mail", accessorKey: "email" },
    { header: "Cargo", accessorKey: "cargo" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (item) => {
        let corBadge: "success" | "danger" | "warning" | "default" = "default";
        if (item.status === "Ativo") corBadge = "success";
        else if (item.status === "Inativo") corBadge = "danger";
        else if (item.status === "Pendente") corBadge = "warning";
        return <Badge color={corBadge}>{item.status}</Badge>;
      }
    },
    {
      header: "Ações",
      accessorKey: "id",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button size="sm" color="primary" onClick={() => handleEditar(item)}>Editar</Button>
          <Button size="sm" color="danger" onClick={() => handleEliminar(item.id)}>Excluir</Button>
        </div>
      )
    }
  ];

  // ─── RENDERIZAÇÃO DO LAYOUT ──────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* Overlay escuro para mobile quando a sidebar está aberta */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 1. BARRA LATERAL (SIDEBAR) RESPONSIVA */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-[#141414] flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarOpen 
            ? "w-64 translate-x-0 border-r border-[#2a2a2a]" 
            : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:border-r-0"
        }`}
      >
        {/* Logo / Menu Toggler */}
        <div className="h-16 flex items-center px-6 border-b border-[#2a2a2a] gap-4 text-white shrink-0 w-64">
          <button onClick={() => setIsSidebarOpen(false)} className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer outline-none">
            <Menu size={20} />
          </button>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">Painel Admin</span>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar w-64">
          <div>
            <p className="px-3 text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">Core</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c] rounded-lg transition-colors">
              <LayoutDashboard size={18} /> Dashboards
            </a>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">Custom</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c] rounded-lg transition-colors">
                <FileText size={18} /> Pages
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c] rounded-lg transition-colors">
                <AppWindow size={18} /> Applications
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c] rounded-lg transition-colors">
                <GitMerge size={18} /> Flows
              </a>
            </div>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">UI Toolkit</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c] rounded-lg transition-colors">
                <Layout size={18} /> Layout
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault(); // Evita que a página dê um "pulo" para o topo
                  setIsSidebarOpen(false); // Fecha/Recolhe a barra lateral
                }}
                className="flex items-center gap-3 px-3 py-2 text-white bg-blue-600/10 rounded-lg transition-colors border border-blue-500/20"
              >
                <Box size={18} className="text-blue-500" /> <span className="font-medium">Gestão de Usuários</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c] rounded-lg transition-colors">
                <Wrench size={18} /> Utilities
              </a>
            </div>
          </div>
        </nav>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* Cabeçalho Superior */}
        <header className="h-16 bg-[#141414] border-b border-[#2a2a2a] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 w-full">
          
          <div className="flex items-center gap-4">
            {/* Ícone de Menu no topo: aparece quando a sidebar está fechada */}
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer outline-none p-1"
              >
                <Menu size={20} />
              </button>
            )}

            {/* Barra de Pesquisa Global */}
            <div className="relative w-48 sm:w-72 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar em todo o sistema..." 
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors text-sm placeholder-[#6b7280]"
              />
            </div>
          </div>

          {/* Avatar do Usuário */}
          <div className="flex items-center gap-5 ml-auto">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-2 border-[#141414] cursor-pointer hover:bg-blue-500 transition-colors">
              <UserCircle size={20} className="text-white" />
            </div>
          </div>
        </header>

        {/* Conteúdo Rolável */}
        <main className="flex-1 overflow-y-auto">

          {/* Área do CRUD com espaçamento responsivo */}
          <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-12">
            <div className="max-w-6xl mx-auto">
              
              {/* Cabeçalho de Ações da Tabela */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Painel de Usuários</h2>
                  <p className="text-[#9ca3af] text-sm">Gerenciamento completo de usuários e acessos.</p>
                </div>
                
                <Button size="md" color="success" onClick={handleCriar} className="w-full sm:w-auto">
                  + Novo Usuário
                </Button>
              </div>

              {/* Renderização da Tabela */}
              {carregando ? (
                <div className="w-full p-12 flex flex-col items-center justify-center bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl">
                  <svg className="animate-spin w-8 h-8 text-[#3b82f6] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-[#9ca3af] text-sm">Carregando registros do banco de dados...</p>
                </div>
              ) : (
                <DataTable columns={colunas} data={usuarios} itemsPerPage={5} />
              )}
            </div>
          </div>

        </main>
      </div>

      {/* 3. MODAL DE CRIAÇÃO */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title="Cadastrar Novo Usuário">
        <div className="space-y-4 mb-6">
          <p className="text-[#9ca3af] text-sm">Preencha os dados abaixo para adicionar um novo usuário ao sistema.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white mb-1">Nome Completo</label>
              <input type="text" className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-2.5 rounded-lg outline-none focus:border-[#4a4a4a] text-sm" placeholder="Ex: João da Silva" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1">E-mail</label>
              <input type="email" className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-2.5 rounded-lg outline-none focus:border-[#4a4a4a] text-sm" placeholder="joao@empresa.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1">Cargo</label>
              <input type="text" className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-2.5 rounded-lg outline-none focus:border-[#4a4a4a] text-sm" placeholder="Ex: Analista de Sistemas" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#2a2a2a] pt-4">
          <Button color="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button color="success" onClick={() => { alert('Usuário salvo no banco (simulação)!'); setModalAberto(false); }}>Salvar Usuário</Button>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
      `}</style>
    </div>
  );
}