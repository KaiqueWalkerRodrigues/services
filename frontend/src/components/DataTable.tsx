"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "./Button";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  itemsPerPage?: number;
}

// ─── Componente Principal ───────────────────────────────────────────────────
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  itemsPerPage = 5,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // 1. Filtragem (Search)
  const filteredData = useMemo(() => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          String(val).toLowerCase().includes(lowerSearch),
      ),
    );
  }, [data, search]);

  // 2. Ordenação (Sorting)
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Handler de Ordenação
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Resetar página ao pesquisar
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* Topo: Barra de Pesquisa */}
      <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between bg-[#1a1a1a]">
        <h2 className="text-lg font-semibold text-white tracking-tight">
          Registos
        </h2>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[#6b7280]" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm text-white placeholder-[#6b7280] outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111] border-b border-[#2a2a2a]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col.accessorKey)}
                  className="px-6 py-4 text-xs font-bold text-[#9ca3af] uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none group"
                >
                  <div className="flex items-center gap-2 w-max">
                    {col.header}
                    <span className="flex flex-col text-[#444] group-hover:text-[#666] transition-colors">
                      <ChevronUp
                        size={12}
                        className={
                          sortConfig?.key === col.accessorKey &&
                          sortConfig.direction === "asc"
                            ? "text-[#3b82f6]"
                            : ""
                        }
                      />
                      <ChevronDown
                        size={12}
                        className={`-mt-1 ${sortConfig?.key === col.accessorKey && sortConfig.direction === "desc" ? "text-[#3b82f6]" : ""}`}
                      />
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#1c1c1c]/50 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-[#e5e7eb] whitespace-nowrap"
                    >
                      {/* Renderiza a célula customizada se existir, senão mostra o dado puro */}
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[#6b7280]"
                >
                  <p className="text-sm">Nenhum registo encontrado.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé: Paginação */}
      <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between bg-[#1a1a1a]">
        <p className="text-xs text-[#6b7280]">
          Mostrando{" "}
          <span className="font-medium text-[#e5e7eb]">
            {paginatedData.length > 0
              ? (currentPage - 1) * itemsPerPage + 1
              : 0}
          </span>{" "}
          a{" "}
          <span className="font-medium text-[#e5e7eb]">
            {Math.min(currentPage * itemsPerPage, filteredData.length)}
          </span>{" "}
          de{" "}
          <span className="font-medium text-[#e5e7eb]">
            {filteredData.length}
          </span>{" "}
          resultados
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            color="secondary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-xs font-medium text-[#9ca3af]">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            size="sm"
            color="secondary"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
