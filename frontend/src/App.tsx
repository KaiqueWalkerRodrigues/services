import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageTitle from "./components/PageTitle";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRouteColaborador } from "./components/ProtectedRouteColaborador";
import { ProtectedRouteCliente } from "./components/ProtectedRouteCliente";

import HomeCliente from "./pages/HomeCliente";
import HomeColaborador from "./pages/HomeColaborador";
import LoginCliente from "./pages/auth/loginCliente";
import LoginColaborador from "./pages/auth/loginColaborador";
import CadastrarCliente from "./pages/auth/cadastro/cadastrarCliente";
import PaginaAdministracao from "./pages/admin/admin";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      {/* AuthProvider envolve tudo para que loginColaborador acesse o contexto */}
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginCliente />} />
          <Route
            path="/loginColaborador"
            element={
              <PageTitle title="Services | Login Colaborador">
                <LoginColaborador />
              </PageTitle>
            }
          />
          <Route
            path="/registro"
            element={
              <PageTitle title="Services | Cadastrar-se">
                <CadastrarCliente />
              </PageTitle>
            }
          />

          {/* Rotas protegidas Colaborador */}
          <Route
            path="/home"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Services | Home Admin">
                  <HomeColaborador />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRouteColaborador>
                <PageTitle title="Services | Admin">
                  <PaginaAdministracao />
                </PageTitle>
              </ProtectedRouteColaborador>
            }
          />
          {/* Rotas protegidas cliente */}
          <Route
            path="/"
            element={
              <ProtectedRouteCliente>
                <PageTitle title="Services | Home Cliente">
                  <HomeCliente />
                </PageTitle>
              </ProtectedRouteCliente>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
