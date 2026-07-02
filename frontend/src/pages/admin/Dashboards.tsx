"use client";

import { useState } from "react";
import { Users, Building2, TrendingUp } from "lucide-react";
import { SidebarAdmin } from "../../components/Admin/SidebarAdmin";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function PaginaDashBoards() {
  const { usuario } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Exemplo de dados (viriam de um hook ou API)
  const cards = [
    {
      titulo: "Clientes Ativos",
      valor: "1.240",
      icon: <Users size={24} />,
      cor: "text-blue-500",
    },
    {
      titulo: "Empresas Parceiras",
      valor: "86",
      icon: <Building2 size={24} />,
      cor: "text-green-500",
    },
    {
      titulo: "Crescimento Mensal",
      valor: "+12%",
      icon: <TrendingUp size={24} />,
      cor: "text-purple-500",
    },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      <SidebarAdmin
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="dashboard"
      />

      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-2">
          Olá, {usuario?.nome || "Visitante"}!👋
        </h1>
        <p className="text-[#6b7280] mb-8">
          Bem-vindo ao painel de controle do sistema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl"
            >
              <div className={`mb-4 ${card.cor}`}>{card.icon}</div>
              <h3 className="text-[#9ca3af] text-sm">{card.titulo}</h3>
              <p className="text-3xl font-bold mt-1">{card.valor}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
