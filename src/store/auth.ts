/**
 * 认证状态管理 - Zustand
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, userAPI } from './api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (apiKey: string) => Promise<void>;
  register: (data: {
    username: string;
    email?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (apiKey: string) => {
        set({ isLoading: true });
        try {
          localStorage.setItem('api_key', apiKey);
          const user = await userAPI.getCurrentUser();
          set({
            user: user.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('api_key');
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await userAPI.register(data);
          const apiKey = response.data.api_key;
          if (apiKey) {
            localStorage.setItem('api_key', apiKey);
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('api_key');
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      refreshUser: async () => {
        try {
          const user = await userAPI.getCurrentUser();
          set({
            user: user.data,
            isAuthenticated: true,
          });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
