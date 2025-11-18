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
          
          // Debug: Log login response to verify user data structure
          // console.log('Login response user data:', response.user);
          
          // Verify user has name field
          if (!response.user || !response.user.name) {
            console.warn('Login response missing user name:', response.user);
          }
          
          // Store user data (authentication handled via httpOnly cookie)
          // SECURITY: Only stores minimal non-sensitive data (id, name)
          await AuthApiService.storeUser(response.user);
          
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
          // SECURITY: Complete cleanup on logout
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          // Clear all localStorage data
          AuthApiService.clearAllStorage();
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          // Check if token exists and is valid
          const isAuth = await AuthApiService.isAuthenticated();
          if (!isAuth) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Try to get user profile
          const user = await AuthApiService.getProfile();
          
          // Debug: Log user data to verify API response
          // console.log('User profile from API:', user);
          
          // Ensure we have the full user data with name
          if (!user || !user.name) {
            console.warn('User profile missing name field:', user);
          }
          
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
      partialize: (state) => {
        // SECURITY: Exclude sensitive data from localStorage
        // Only store minimal data needed for UI state
        // Role and email should NOT be persisted
        if (!state.user) {
          return { isAuthenticated: false };
        }
        
        // Store only minimal non-sensitive user data
        return {
          user: {
            id: state.user.id,
            name: state.user.name || '', // Only name for display
            // DO NOT store: email, role, or any other sensitive data
          },
          isAuthenticated: state.isAuthenticated,
        };
      },
    }
  )
);

