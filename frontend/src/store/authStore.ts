import { create } from "zustand";
import type { LoginResponse } from "../types/auth";

type AuthState = {
  user: LoginResponse | null;
  login: (user: LoginResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
