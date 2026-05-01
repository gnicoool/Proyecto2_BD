import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./app/login/page";
import Layout from "./components/Layout/Layout";
import { RequireAdmin } from "./components/auth/RequireAdmin";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RootIndexRedirect } from "./components/auth/RootIndexRedirect";
import CategoriasPage from "./app/categorias/page";
import MarcasPage from "./app/marcas/page";
import EmpleadosPage from "./app/empleados/page";
import InformesPage from "./app/informes/page";
import MisVentasPage from "./app/mis_ventas/page";
import ProductosPage from "./app/productos/page";
import ProveedoresPage from "./app/proveedores/page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<RootIndexRedirect />} />
            <Route path="mis-ventas" element={<MisVentasPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="categorias" element={<CategoriasPage />} />
              <Route path="marcas" element={<MarcasPage />} />
              <Route path="productos" element={<ProductosPage />} />
              <Route path="proveedores" element={<ProveedoresPage />} />
              <Route path="empleados" element={<EmpleadosPage />} />
              <Route path="informes" element={<InformesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}