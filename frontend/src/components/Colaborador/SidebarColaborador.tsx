import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Crown,
  UserCircle2,
  Zap,
  ChevronDown,
  Folder,
  FolderOpen,
  House,
  Menu,
  UserRoundCog,
  NotepadText,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  nomeLoja?: string;
  nivel?: string;
}

interface NavItemType {
  label: string;
  to?: string;
  icon: typeof LayoutGrid;
  children?: NavItemType[];
}

const hubItems: NavItemType[] = [
  { label: "Home", to: "/home", icon: House },
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  {
    label: "Gerenciamento",
    icon: Folder,
    children: [
      { label: "Clientes", to: "/gerenciamento/clientes", icon: UserCircle2 },
    ],
  },
  {
    label: "Parametros",
    icon: Folder,
    children: [
      {
        label: "Colaboradores",
        to: "/parametros/Colaboradores",
        icon: UserRoundCog,
      },
      { label: "Filiais", to: "/parametros/filiais", icon: NotepadText },
      { label: "Serviços", to: "/parametros/servicos", icon: Crown },
    ],
  },
];

function obterIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function ItemNav({
  to,
  label,
  Icon,
  onClick,
}: {
  to: string;
  label: string;
  Icon: typeof LayoutGrid;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? "border-violet-500 bg-violet-500/10 font-medium text-violet-300"
            : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function PastaNav({
  item,
  onNavigate,
}: {
  item: NavItemType;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  const contemRotaAtiva = (filhos: NavItemType[]): boolean => {
    return filhos.some((filho) => {
      if (filho.to && location.pathname === filho.to) return true;
      if (filho.children) return contemRotaAtiva(filho.children);
      return false;
    });
  };

  const isAtivo = item.children ? contemRotaAtiva(item.children) : false;
  const [isOpen, setIsOpen] = useState(isAtivo);

  useEffect(() => {
    if (isAtivo) {
      setIsOpen(true);
    }
  }, [location.pathname, isAtivo]);

  const Icon = isOpen ? FolderOpen : item.icon;

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors ${
          isAtivo
            ? "border-violet-500 bg-violet-500/5 font-medium text-violet-300"
            : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`h-4 w-4 ${isAtivo ? "text-violet-400" : "text-zinc-400"}`}
          />
          <span>{item.label}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-violet-400" : ""
          }`}
        />
      </button>

      {isOpen && item.children && (
        <div className="ml-4 flex flex-col gap-1 border-l border-white/5 pl-3 pt-1">
          {item.children.map((subItem) =>
            subItem.children ? (
              <PastaNav
                key={subItem.label}
                item={subItem}
                onNavigate={onNavigate}
              />
            ) : (
              <ItemNav
                key={subItem.to}
                to={subItem.to!}
                label={subItem.label}
                Icon={subItem.icon}
                onClick={onNavigate}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  nomeLoja = "Barb",
  nivel = "Colaborador",
}: SidebarProps) {
  const { usuario } = useAuth();
  const nome = usuario?.nome ?? "Convidado";
  const iniciais = obterIniciais(nome) || "?";

  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const fecharMenuMobile = () => setIsOpenMobile(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#09090f]/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_15px_-2px_rgba(168,85,247,0.7)]">
            <Zap className="h-4 w-4 fill-white text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            {nomeLoja}
          </span>
        </div>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:text-white"
          aria-label="Abrir Menu"
        >
          {isOpenMobile ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {isOpenMobile && (
        <div
          onClick={fecharMenuMobile}
          className="fixed inset-0 z-45 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-white/5 bg-[#09090f] px-5 py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-10 hidden items-center gap-3 px-1 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_18px_-2px_rgba(168,85,247,0.7)]">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              {nomeLoja}
            </span>
          </div>

          <div className="mt-12 lg:mt-0">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Hub
            </p>
            <nav className="mb-8 flex flex-col gap-1">
              {hubItems.map((item) =>
                item.children ? (
                  <PastaNav
                    key={item.label}
                    item={item}
                    onNavigate={fecharMenuMobile}
                  />
                ) : (
                  <ItemNav
                    key={item.to}
                    to={item.to!}
                    label={item.label}
                    Icon={item.icon}
                    onClick={fecharMenuMobile}
                  />
                ),
              )}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
            {iniciais}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{nome}</p>
            <p className="text-xs text-zinc-500">{nivel}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
