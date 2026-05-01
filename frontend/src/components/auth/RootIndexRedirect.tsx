import { Navigate } from "react-router-dom";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";

export function RootIndexRedirect() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? ROUTES.categorias : ROUTES.misVentas} replace />;
}
