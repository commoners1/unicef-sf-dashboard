import axios, { type AxiosInstance } from 'axios';
import { useDashboardStore } from '@/stores/dashboard-store';

// Fallback to env var if store is not available (e.g., during SSR or initial load)
const getDefaultBaseURL = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

/**
 * Creates an axios instance that dynamically uses the current environment's API URL
 * This allows runtime switching between local, staging, and production APIs
 */
export function createApiClient(): AxiosInstance {
  // Get the current environment from the store
  const store = useDashboardStore.getState();
  const baseURL = store.currentEnvironment?.apiUrl || getDefaultBaseURL();

  const apiClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include auth token and update baseURL dynamically
  apiClient.interceptors.request.use((config) => {
    // Update baseURL on each request in case environment changed
    const currentStore = useDashboardStore.getState();
    config.baseURL = currentStore.currentEnvironment?.apiUrl || getDefaultBaseURL();

    // Add auth token if available
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_profile');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
}

/**
 * Gets the current API base URL from the store
 * Useful for WebSocket connections or other non-axios API calls
 */
export function getCurrentApiUrl(): string {
  const store = useDashboardStore.getState();
  return store.currentEnvironment?.apiUrl || getDefaultBaseURL();
}

/**
 * Gets the current WebSocket URL from the store
 */
export function getCurrentWsUrl(): string {
  const store = useDashboardStore.getState();
  return store.currentEnvironment?.wsUrl || 
    (import.meta.env.VITE_WS_URL || 'ws://localhost:3000');
}

// Export a singleton instance for convenience
// Note: This instance will use the current environment at request time
let apiClientInstance: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient();
  }
  return apiClientInstance;
}

