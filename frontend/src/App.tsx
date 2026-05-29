import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./components/Login";
import LoginCliente from "./pages/login/clientes";
import LoginColaborador from "./pages/login/colaboradores";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/login-cliente" element={<Login tipo="cliente" />} />
        <Route
          path="/login-colaborador"
          element={<Login tipo="colaborador" />}
        /> */}
        <Route path="/login" element={<LoginCliente />} />
        <Route path="/loginEmpresa" element={<LoginColaborador />} />
      </Routes>
    </BrowserRouter>
  );
}
