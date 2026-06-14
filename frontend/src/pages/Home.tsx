import React, { useState, useEffect } from "react";

export default function Home() {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Novos estados para a paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resposta = await fetch("http://192.168.15.6:81/");
        const json = await resposta.json();

        if (json.status === "sucesso") {
          setEmpresas(json.dados);
        }
      } catch (erro) {
        console.error("Erro ao buscar os dados da API:", erro);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  // Reseta para a primeira página sempre que o usuário digitar na busca
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, itensPorPagina]);

  // Lógica de Filtro
  const empresasFiltradas = empresas.filter(
    (empresa) =>
      empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
      empresa.codigo_empresa.includes(busca),
  );

  // Lógica de Paginação
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const empresasAtuais = empresasFiltradas.slice(
    indexPrimeiroItem,
    indexUltimoItem,
  );

  const totalPaginas = Math.ceil(empresasFiltradas.length / itensPorPagina);
  const mostrandoDe =
    empresasFiltradas.length === 0 ? 0 : indexPrimeiroItem + 1;
  const mostrandoAte = Math.min(indexUltimoItem, empresasFiltradas.length);

  // Gera os números das páginas para os botões
  const numerosPaginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    numerosPaginas.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Lista de Empresas
        </h1>

        {/* Controles do Topo (Itens por página e Busca) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>Mostrar</span>
            <select
              value={itensPorPagina}
              onChange={(e) => setItensPorPagina(Number(e.target.value))}
              className="mx-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>registros</span>
          </div>

          <div>
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Estado de Carregamento */}
        {carregando ? (
          <div className="text-center text-gray-500 py-10">
            Carregando dados...
          </div>
        ) : (
          <>
            {/* Tabela de Dados */}
            <div className="overflow-x-auto rounded border border-gray-200 mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm">
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Criado em</th>
                    <th className="px-4 py-3 font-semibold">Atualizado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
                  {empresasAtuais.length > 0 ? (
                    empresasAtuais.map((empresa) => (
                      <tr
                        key={empresa.id_empresa}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">{empresa.id_empresa}</td>
                        <td className="px-4 py-3">{empresa.codigo_empresa}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {empresa.nome}
                        </td>
                        <td className="px-4 py-3">{empresa.created_at}</td>
                        <td className="px-4 py-3">{empresa.updated_at}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Controles de Paginação (Rodapé) */}
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <div className="mb-4 md:mb-0">
                Mostrando {mostrandoDe} a {mostrandoAte} de{" "}
                {empresasFiltradas.length} registros
              </div>

              {totalPaginas > 1 && (
                <div className="flex bg-white rounded border border-gray-200">
                  <button
                    onClick={() =>
                      setPaginaAtual((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginaAtual === 1}
                    className={`px-3 py-1.5 border-r border-gray-200 transition-colors ${
                      paginaAtual === 1
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-100 text-blue-600"
                    }`}
                  >
                    Anterior
                  </button>

                  {/* Renderiza um número máximo de botões para não quebrar o layout se houver muitas páginas */}
                  {numerosPaginas.map((numero) => {
                    // Lógica simples para mostrar apenas as páginas próximas à atual
                    if (
                      numero === 1 ||
                      numero === totalPaginas ||
                      (numero >= paginaAtual - 1 && numero <= paginaAtual + 1)
                    ) {
                      return (
                        <button
                          key={numero}
                          onClick={() => setPaginaAtual(numero)}
                          className={`px-3 py-1.5 border-r border-gray-200 transition-colors ${
                            paginaAtual === numero
                              ? "bg-blue-600 text-white border-blue-600"
                              : "hover:bg-gray-100 text-blue-600"
                          }`}
                        >
                          {numero}
                        </button>
                      );
                    } else if (
                      numero === paginaAtual - 2 ||
                      numero === paginaAtual + 2
                    ) {
                      return (
                        <span
                          key={numero}
                          className="px-3 py-1.5 border-r border-gray-200 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() =>
                      setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                    }
                    disabled={paginaAtual === totalPaginas}
                    className={`px-3 py-1.5 transition-colors ${
                      paginaAtual === totalPaginas
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-100 text-blue-600"
                    }`}
                  >
                    Próximo
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
