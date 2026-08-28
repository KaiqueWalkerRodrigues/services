import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageTitle from "./components/PageTitle";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRouteColaborador } from "./components/ProtectedRouteColaborador";

import HomePublica from "./pages/HomePublica";
import HomeColaborador from "./pages/colaborador/HomeColaborador";
import LoginCliente from "./pages/auth/LoginCliente";
import LoginColaborador from "./pages/auth/LoginColaborador";
import Logout from "./pages/auth/Logout";
import CadastrarCliente from "./pages/auth/cadastro/CadastrarCliente";
import PaginaDashBoards from "./pages/admin/Dashboards";
import PaginaEmpresas from "./pages/admin/Empresas";
import PaginaColaboradorClientes from "./pages/colaborador/gerenciamento/Clientes";
import PaginaColaboradorColaboradores from "./pages/colaborador/parametros/Colaboradores";
import PaginaColaboradores from "./pages/admin/Colaboradores";
import PaginaColaboradorFilial from "./pages/colaborador/parametros/Filiais";
import PaginaColaboradorServicos from "./pages/colaborador/parametros/Servicos";
import PaginaParametrosGerais from "./pages/colaborador/parametros/ParametrosGerais";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* Rotas Públicas: Não precisam de AuthProvider ou checagem de sessão */}
        <Route path="/login" element={<LoginCliente />} />
        <Route path="/loginCliente" element={<LoginCliente />} />
        <Route
          path="/loginColaborador"
          element={
            <AuthProvider>
              <PageTitle title="Login Colaborador">
                <LoginColaborador />
              </PageTitle>
            </AuthProvider>
          }
        />
        <Route
          path="/registro"
          element={
            <PageTitle title="Cadastro">
              <CadastrarCliente />
            </PageTitle>
          }
        />

        {/* Rotas Protegidas: Envoltas pelo AuthProvider */}
        <Route element={<AuthProvider />}>
          <Route path="/logout" element={<Logout />} />

          <Route
            path="/home"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Home Admin">
                  <HomeColaborador />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/gerenciamento/clientes"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Clientes">
                  <PaginaColaboradorClientes />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/parametros/gerais"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Parametros Gerais">
                  <PaginaParametrosGerais />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/parametros/servicos"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Serviços">
                  <PaginaColaboradorServicos />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/parametros/colaboradores"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Colaboradores">
                  <PaginaColaboradorColaboradores />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/parametros/filiais"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Filiais">
                  <PaginaColaboradorFilial />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/admin/dashboards"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Admin">
                  <PaginaDashBoards />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/admin/empresas"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Admin - Empresa">
                  <PaginaEmpresas />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />

          <Route
            path="/admin/colaboradores"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Admin - Colaborador">
                  <PaginaColaboradores />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />
        </Route>

        <Route
          path="/"
          element={
            <PageTitle title="Barb - Ínicio">
              <HomePublica />
            </PageTitle>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
