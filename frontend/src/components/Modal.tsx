import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95%] h-[95vh]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
}: ModalProps) {
  // Fechar o modal ao pressionar a tecla ESC e bloquear scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // Impede rolagem da página de fundo
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset"; // Restaura rolagem ao fechar
    };
  }, [isOpen, onClose]);

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (fundo escurecido interativo) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose} // Fecha ao clicar fora
      />

      {/* Caixa Principal do Modal */}
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200`}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          {title && <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-2 ml-auto text-[#9ca3af] hover:text-white hover:bg-[#2a2a2a] rounded-full transition-colors cursor-pointer outline-none"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal (Conteúdo Dinâmico) */}
        <div className={`p-6 overflow-y-auto text-[#e5e7eb] ${size === "full" ? "flex-1" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}