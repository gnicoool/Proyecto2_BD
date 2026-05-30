import { CatalogoProductosView } from "../../../components/catalogo/CatalogoProductosView";
import { ROUTES } from "../../../lib/authRoutes";

export default function TiendaProductosPage() {
  return (
    <CatalogoProductosView
      productosBasePath={ROUTES.tiendaProductos}
      enableCarrito
    />
  );
}
