import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  roles: string[];
}

export function RequireRol({ roles }: Props) {
  const { user, hasRol } = useAuth();
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (!hasRol(...roles)) return <Navigate to={ROUTES.noAutorizado} replace />;
  return <Outlet />;
}
