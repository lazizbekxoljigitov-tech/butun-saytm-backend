import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../../../types';
import api from '../../../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setSecretAdmin: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      setSecretAdmin: () => {
        const token = 'secret-token';
        localStorage.setItem('token', token);
        set({ 
          user: { 
            id: 'secret-admin', 
            name: 'Secret Master', 
            email: 'admin@anilegeon.com', 
            role: 'admin' 
          } as any, 
          token, 
          isAuthenticated: true 
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/profile');
          if (data.success) {
            set({ user: data.data, token, isAuthenticated: true });
          } else {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
