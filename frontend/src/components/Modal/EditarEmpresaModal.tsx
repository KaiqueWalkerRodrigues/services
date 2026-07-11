"use client";

import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";

interface Empresa {
  id_empresa: string;
  nome: string;
  codigo_empresa: string | number;
}

interface EditarEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresa: Empresa;
}

export function EditarEmpresaModal({
  isOpen,
  onClose,
  onSuccess,
  empresa,
}: EditarEmpresaModalProps) {
  const [id_empresa, setid_empresa] = useState(empresa.id_empresa);
  const [nome, setNome] = useState(empresa.nome);
  const [codigo_empresa, setCodigoEmpresa] = useState(
    String(empresa.codigo_empresa),
  );
  const [loading, setLoading] = useState(false);

  // Atualiza o estado caso a prop empresa mude
  useEffect(() => {
    setNome(empresa.nome);
    setCodigoEmpresa(String(empresa.codigo_empresa));
    setid_empresa(String(empresa.id_empresa));
  }, [empresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch.put(`/api/empresas`, {
        id_empresa,
        nome,
        codigo_empresa,
      });
      showToast({
        type: "success",
        message: "Empresa atualizada com sucesso!",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar a empresa.";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Empresa" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome da Empresa
          </label>
          <input
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Código da Empresa
          </label>
          <input
            required
            type="number"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={codigo_empresa}
            onChange={(e) => setCodigoEmpresa(e.target.value)}
          />
        </div>
        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
