import React, { useEffect } from "react";
import { X, Trash2 } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
type ModalVariant = "default" | "delete";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  variant?: ModalVariant;
  onConfirm?: () => void;
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
  variant = "default",
  onConfirm,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className={`relative w-full ${sizeClasses[size]} bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200`}
      >
        {variant === "delete" ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
              <Trash2 className="text-red-500" size={32} />
            </div>
            <div className="mb-8 w-full text-[#e5e7eb]">{children}</div>
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-900 text-white rounded-xl transition-colors font-medium"
              >
                Deletar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
              {title && (
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-2 ml-auto text-[#9ca3af] hover:text-white hover:bg-[#2a2a2a] rounded-full transition-colors cursor-pointer outline-none"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className={`p-6 overflow-y-auto text-[#e5e7eb] ${
                size === "full" ? "flex-1" : ""
              }`}
            >
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
