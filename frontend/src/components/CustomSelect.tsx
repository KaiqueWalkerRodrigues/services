"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  // Iniciamos com opacidade 0 para evitar que o portal apareça no lugar errado na primeira renderização
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
    position: "fixed",
    opacity: 0,
    pointerEvents: "none",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const maxHeight = ITEM_HEIGHT * VISIBLE_ITEMS + 60;
    let top = rect.bottom + 4;

    // Se faltar espaço embaixo, abre para cima
    if (window.innerHeight - rect.bottom < maxHeight) {
      top = rect.top - maxHeight - 4;
    }

    setDropdownStyle({
      position: "fixed",
      top,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      opacity: 1, // Torna visível apenas após calcular a posição real
      pointerEvents: "auto",
    });
  };

  // Fecha clicando fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clicouNoContainer = containerRef.current?.contains(target);
      const clicouNoDropdown = dropdownRef.current?.contains(target);

      if (!clicouNoContainer && !clicouNoDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualiza posição ao abrir
  useEffect(() => {
    if (!isOpen) {
      // Reseta o estilo escondido para a próxima vez que abrir
      setDropdownStyle({
        position: "fixed",
        opacity: 0,
        pointerEvents: "none",
      });
      return;
    }

    setSearch("");

    // Usar uma microtask ou execução direta calcula a posição antes da pintura da tela (evita o flick)
    updateDropdownPosition();

    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        <div
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white flex items-center justify-between transition-colors ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-blue-500"
          }`}
        >
          <span className="truncate">{selectedLabel}</span>

          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {mounted &&
        isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden transition-opacity duration-75"
          >
            <div className="p-2 border-b border-[#2a2a2a]">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />
            </div>

            <ul
              className="overflow-y-auto"
              style={{
                maxHeight: ITEM_HEIGHT * VISIBLE_ITEMS,
              }}
            >
              {filteredOptions.length ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-3 cursor-pointer transition-colors ${
                      option.value === value
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="px-3 py-3 text-sm text-gray-500 italic">
                  Nenhuma opção encontrada.
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
