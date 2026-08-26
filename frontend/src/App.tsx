import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageTitle from "./components/PageTitle";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRouteColaborador } from "./components/ProtectedRouteColaborador";
import { ProtectedRouteCliente } from "./components/ProtectedRouteCliente";

import HomeCliente from "./pages/HomeCliente";
import HomeColaborador from "./pages/Colaborador/HomeColaborador";
import LoginCliente from "./pages/auth/LoginCliente";
import LoginColaborador from "./pages/auth/LoginColaborador";
import Logout from "./pages/auth/Logout";
import CadastrarCliente from "./pages/auth/cadastro/CadastrarCliente";
import PaginaDashBoards from "./pages/admin/Dashboards";
import PaginaEmpresas from "./pages/admin/Empresas";
import PaginaColaboradorCliente from "./pages/Colaborador/gerenciamento/Clientes";
import PaginaColaboradores from "./pages/admin/Colaboradores";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* Rotas Públicas: Não precisam de AuthProvider ou checagem de sessão */}
        <Route path="/login" element={<LoginCliente />} />
        <Route
          path="/loginColaborador"
          element={
            <PageTitle title="Login Colaborador">
              <LoginColaborador />
            </PageTitle>
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
                  <PaginaColaboradorCliente />
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

          <Route
            path="/"
            element={
              <ProtectedRouteCliente>
                <PageTitle title="Home Cliente">
                  <HomeCliente />
                </PageTitle>
              </ProtectedRouteCliente>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
