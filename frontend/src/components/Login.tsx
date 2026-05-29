import { useState, useEffect } from "react";

interface LoginProps {
  tipo: "cliente" | "colaborador";
}

export default function Login({ tipo }: LoginProps) {
  const [mostrarCodigo] = useState(true);

  // Verifica a URL na montagem do componente
  useEffect(() => {
    if (tipo === "colaborador") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("cod")) {
        // setMostrarCodigo(false); // Oculta se 'cod' existir
      }
    }
  }, [tipo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login {tipo === "cliente" ? "Cliente" : "Colaborador"}
        </h2>

        {/* Campo de Código (apenas para colaboradores e se não houver cod na URL) */}
        {tipo === "colaborador" && mostrarCodigo && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código
            </label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        )}

        <form className="space-y-4">
          {/* Campo para Clientes (email) ou Colaboradores (usuario) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {tipo === "cliente" ? "Email" : "Usuário"}
            </label>
            <input
              type={tipo === "cliente" ? "email" : "text"}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
