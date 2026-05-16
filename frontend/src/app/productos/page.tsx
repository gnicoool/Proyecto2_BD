import { CatalogoProductosView } from "../../components/catalogo/CatalogoProductosView";
import { ROUTES } from "../../lib/authRoutes";

export default function ProductosPage() {
  return (
    <CatalogoProductosView
      showAdminActions
      productosBasePath={ROUTES.productos}
      enableCarrito={false}
    />
  );
}
