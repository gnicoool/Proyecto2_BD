import { create } from "zustand";
import type { LoginResponse } from "../types/auth";

type AuthState = {
  user: LoginResponse | null;
  token: string | null;
  login: (user: LoginResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user) => set({ user, token: user.access_token }),
  logout: () => set({ user: null, token: null }),
}));
