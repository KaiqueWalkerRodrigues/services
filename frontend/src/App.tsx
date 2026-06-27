import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./components/Login";
import Home from "./pages/Home";
import LoginCliente from "./pages/login/clientes";
import LoginColaborador from "./pages/login/colaboradores";
import CadastrarCliente from "./pages/cadastro/CadastrarCliente";
import { ToastProvider } from "./components/Toast";
import PaginaAdministracao from "./pages/admin/adm";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* <Route path="/login-cliente" element={<Login tipo="cliente" />} />
        <Route
          path="/login-colaborador"
          element={<Login tipo="colaborador" />}
        /> */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginCliente />} />
        <Route path="/loginEmpresa" element={<LoginColaborador />} />
        <Route path="/registro" element={<CadastrarCliente />} />
        <Route path="/adm" element={<PaginaAdministracao />} />
      </Routes>
    </BrowserRouter>
  );
}
