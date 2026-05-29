import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const rol = user?.rol ?? "";

  const isAdmin      = rol === "Admin";
  const isVendedor   = rol === "Vendedor";
  const isBodeguero  = rol === "Bodeguero";
  const isContador   = rol === "Contador";
  const isSupervisor = rol === "Supervisor";

  const hasRol = (...roles: string[]) => roles.includes(rol);

  return {
    user,
    token,
    login,
    logout,
    rol,
    isAdmin,
    isVendedor,
    isBodeguero,
    isContador,
    isSupervisor,
    hasRol,
  };
}
