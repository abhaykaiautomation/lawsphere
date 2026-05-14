import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'LAWYER' | 'ADMIN';
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('lawsphere_token', token);
        document.cookie = `lawsphere_token=${token};path=/;max-age=${7 * 24 * 60 * 60};SameSite=Lax`;
      },
      clearAuth: () => {
        set({ user: null, token: null });
        localStorage.removeItem('lawsphere_token');
        document.cookie = 'lawsphere_token=;path=/;max-age=0';
      },
    }),
    {
      name: 'lawsphere-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
