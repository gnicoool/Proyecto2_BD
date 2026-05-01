import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";

export function RequireAdmin() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to={ROUTES.misVentas} replace />;
  }
  return <Outlet />;
}
