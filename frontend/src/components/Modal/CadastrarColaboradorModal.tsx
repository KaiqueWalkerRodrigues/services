"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { CustomSelect } from "../CustomSelect";

interface CadastrarColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EmpresaOption {
  id_empresa: number;
  nome: string;
  codigo_empresa: number | string;
}

export function CadastrarColaboradorModal({
  isOpen,
  onClose,
  onSuccess,
}: CadastrarColaboradorModalProps) {
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [idEmpresa, setIdEmpresa] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const carregarEmpresas = async () => {
      try {
        const { data } = await apiFetch.get("/api/empresas");
        const lista = Array.isArray(data?.dados) ? data.dados : [];
        setEmpresas(lista);

        if (lista.length > 0) {
          setIdEmpresa(String(lista[0].id_empresa));
        } else {
          setIdEmpresa("");
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        showToast({
          type: "error",
          message: "Não foi possível carregar as empresas.",
        });
      }
    };

    carregarEmpresas();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch.post("/api/colaboradores", {
        id_empresa: Number(idEmpresa),
        nome,
        login,
        senha,
      });
      showToast({
        type: "success",
        message: "Colaborador cadastrado com sucesso!",
      });
      onSuccess();
      onClose();
      setNome("");
      setLogin("");
      setSenha("");
      setIdEmpresa(empresas[0] ? String(empresas[0].id_empresa) : "");
    } catch (error) {
      console.error("Erro ao cadastrar colaborador:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível cadastrar o colaborador.";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Colaborador"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Empresa
        </label>
        <CustomSelect
          options={empresas.map((e) => ({
            value: String(e.id_empresa),
            label: e.nome,
            string: "Empresa",
          }))}
          value={idEmpresa}
          onChange={(val) => setIdEmpresa(val)}
          placeholder="Selecione uma empresa"
          disabled={loading || empresas.length === 0}
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome do Colaborador
          </label>
          <input
            required
            placeholder="Nome do Colaborador"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Login
          </label>
          <input
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            placeholder="nome.sobrenome"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Senha
          </label>
          <input
            required
            placeholder="Senha do Colaborador"
            type="password"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading || empresas.length === 0}
            className="w-full"
          >
            {loading ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
