import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const isAdmin = !!user && (user.id_rol === 1 || user.rol === "admin");

  return { user, login, logout, isAdmin };
}
