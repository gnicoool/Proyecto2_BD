import { Navigate } from "react-router-dom";
import { getHomeRouteForRol } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";

export function RootIndexRedirect() {
  const { rol } = useAuth();
  return <Navigate to={getHomeRouteForRol(rol)} replace />;
}
