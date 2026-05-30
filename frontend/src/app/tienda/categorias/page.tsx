import { CategoriasCatalogoView } from "../../../components/catalogo/CategoriasCatalogoView";
import { ROUTES } from "../../../lib/authRoutes";

export default function TiendaCategoriasPage() {
  return (
    <CategoriasCatalogoView productosListPath={ROUTES.tiendaProductos} />
  );
}
