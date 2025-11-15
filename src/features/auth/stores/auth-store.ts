import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthApiService } from '@/services/api/auth/auth-api';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await AuthApiService.login({ email, password });
          
          // Store token and user data
          AuthApiService.storeToken(response.access_token);
          AuthApiService.storeUser(response.user);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Security: Don't expose technical details to users
          let userMessage = 'Unable to sign in. Please check your credentials and try again.';
          
          // Handle different types of errors with user-friendly messages
          if (error.code === 'NETWORK_ERROR' || !error.response) {
            userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          } else if (error.response?.status === 401) {
            userMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (error.response?.status === 403) {
            userMessage = 'Access denied. Please contact your administrator for access.';
          } else if (error.response?.status === 429) {
            userMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
          } else if (error.response?.status >= 500) {
            userMessage = 'Server temporarily unavailable. Please try again later.';
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: userMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await AuthApiService.logout();
        } catch (error) {
          console.warn('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          // Check if token exists and is valid
          if (!AuthApiService.isAuthenticated()) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Try to get user profile
          const user = await AuthApiService.getProfile();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // If profile fetch fails, clear auth state
          AuthApiService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Authentication failed',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
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

