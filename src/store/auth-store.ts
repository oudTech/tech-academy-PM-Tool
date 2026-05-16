import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logoutAction } from "@/actions/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        set({ user: null });
        await logoutAction();
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
