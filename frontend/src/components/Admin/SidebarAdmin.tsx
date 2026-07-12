"use client";

import { useState } from "react";
import { ChevronDown, LayoutDashboard, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activePage: "dashboard" | "empresas" | "colaboradores" | string;
}

export const SidebarAdmin = ({ isOpen, activePage }: SidebarProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(
    activePage === "empresas" || activePage === "colaboradores"
      ? "configuracoes"
      : null,
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 0, opacity: isOpen ? 1 : 0 }}
      className="fixed md:relative inset-y-0 left-0 z-40 bg-[#141414] flex flex-col h-full border-r border-[#2a2a2a] overflow-hidden"
    >
      <div className="h-16 flex items-center px-6 border-b border-[#2a2a2a] shrink-0">
        <span className="font-bold text-lg text-white">Painel Admin</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-4 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboards"
          href="/admin/dashboards"
          active={activePage === "dashboard"}
        />

        <AccordionMenu
          title="Configurações"
          icon={<Box size={18} />}
          isOpen={activeMenu === "configuracoes"}
          onToggle={() =>
            setActiveMenu(
              activeMenu === "configuracoes" ? null : "configuracoes",
            )
          }
          isActive={activePage == "colaboradores" || "colaboradores"}
        >
          <SubItem
            label="Empresas"
            href="/admin/empresas"
            active={activePage === "empresas"}
          />
          <SubItem
            label="Colaboradores"
            href="/admin/colaboradores"
            active={activePage === "colaboradores"}
          />
        </AccordionMenu>
      </nav>
    </motion.aside>
  );
};

const NavItem = ({ icon, label, href, active }: any) => (
  <a
    href={href}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? "text-white bg-[#1c1c1c]" : "text-[#9ca3af] hover:text-white hover:bg-[#1c1c1c]"}`}
  >
    {icon} {label}
  </a>
);

const AccordionMenu = ({
  title,
  icon,
  children,
  isOpen,
  onToggle,
  isActive,
}: any) => (
  <div>
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${isActive ? "text-white bg-[#1c1c1c]" : "text-[#9ca3af] hover:text-white"}`}
    >
      <div className="flex items-center gap-3">
        {icon} {title}
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
        <ChevronDown size={16} />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pl-9 space-y-1 mt-1"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SubItem = ({ label, href, active }: any) => (
  <a
    href={href}
    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${active ? "text-blue-400 bg-blue-500/10" : "text-[#6b7280] hover:text-white"}`}
  >
    {label}
  </a>
);
