import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./app/login/page";
import NoAutorizadoPage from "./app/no_autorizado/page";
import Layout from "./components/Layout/Layout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireRol } from "./components/auth/RequireRol";
import { RootIndexRedirect } from "./components/auth/RootIndexRedirect";
import CategoriasPage from "./app/categorias/page";
import MarcasPage from "./app/marcas/page";
import EmpleadosPage from "./app/empleados/page";
import InformesPage from "./app/informes/page";
import MisVentasPage from "./app/mis_ventas/page";
import ProductosPage from "./app/productos/page";
import ProveedoresPage from "./app/proveedores/page";
import ComprasPage from "./app/compras/page";
import VentasPage from "./app/ventas/page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<RootIndexRedirect />} />
            <Route path="mis-ventas" element={<MisVentasPage />} />
            <Route path="no-autorizado" element={<NoAutorizadoPage />} />

            {/* Ventas — Admin, Vendedor (crear), Contador y Supervisor (solo ver) */}
            <Route element={<RequireRol roles={["Admin", "Vendedor", "Contador", "Supervisor"]} />}>
              <Route path="ventas" element={<VentasPage />} />
            </Route>

            {/* Compras — Admin, Bodeguero (crear), Contador y Supervisor (solo ver) */}
            <Route element={<RequireRol roles={["Admin", "Bodeguero", "Contador", "Supervisor"]} />}>
              <Route path="compras" element={<ComprasPage />} />
            </Route>

            {/* Productos — Admin y Supervisor (crear/editar), Bodeguero (solo ver) */}
            <Route element={<RequireRol roles={["Admin", "Bodeguero", "Supervisor"]} />}>
              <Route path="productos" element={<ProductosPage />} />
            </Route>

            {/* Informes — Admin, Contador y Supervisor */}
            <Route element={<RequireRol roles={["Admin", "Contador", "Supervisor"]} />}>
              <Route path="informes" element={<InformesPage />} />
            </Route>

            {/* Empleados — Admin (gestión) y Supervisor (solo ver) */}
            <Route element={<RequireRol roles={["Admin", "Supervisor"]} />}>
              <Route path="empleados" element={<EmpleadosPage />} />
            </Route>

            {/* Proveedores — Admin y Supervisor (gestión), Contador (ver).
                Bodeguero NO tiene acceso según roles.sql */}
            <Route element={<RequireRol roles={["Admin", "Supervisor", "Contador"]} />}>
              <Route path="proveedores" element={<ProveedoresPage />} />
            </Route>

            {/* Categorías — Admin (gestión) y Bodeguero (solo ver) */}
            <Route element={<RequireRol roles={["Admin", "Bodeguero"]} />}>
              <Route path="categorias" element={<CategoriasPage />} />
            </Route>

            {/* Marcas — Admin (gestión) y Bodeguero (solo ver) */}
            <Route element={<RequireRol roles={["Admin", "Bodeguero"]} />}>
              <Route path="marcas" element={<MarcasPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
