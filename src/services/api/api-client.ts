import axios, { type AxiosInstance } from 'axios';
import { useDashboardStore } from '@/features/dashboard';
import { CSRFProtection, RateLimiter, SecurityLogger, SECURITY_CONFIG } from '@/lib/security-enhancements';

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
  apiClient.interceptors.request.use(
    (config) => {
      // Update baseURL on each request in case environment changed
      const currentStore = useDashboardStore.getState();
      config.baseURL = currentStore.currentEnvironment?.apiUrl || getDefaultBaseURL();

      // Add auth token if available
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add CSRF token for state-changing operations
      // Check if current environment supports CSRF tokens
      const currentEnv = currentStore.currentEnvironment;
      const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '');
      const enableCSRF = currentEnv?.enableCSRF !== false; // Default to true unless explicitly disabled
      const shouldAddCSRF = enableCSRF && isStateChanging;
      
      if (shouldAddCSRF) {
        try {
          const csrfToken = CSRFProtection.getToken();
          if (config.headers) {
            config.headers['X-CSRF-Token'] = csrfToken;
          }
        } catch (error) {
          // If CSRF token generation fails, log but don't block the request
          SecurityLogger.log('CSRF_TOKEN_GENERATION_FAILED', { error }, 'low');
        }
      }

      // Client-side rate limiting check
      const rateLimitKey = `${config.method}:${config.url}`;
      const rateLimit = SECURITY_CONFIG.API_RATE_LIMIT;
      if (!RateLimiter.checkLimit(rateLimitKey, rateLimit.maxRequests, rateLimit.windowMs)) {
        SecurityLogger.logSuspiciousActivity('RATE_LIMIT_EXCEEDED', { url: config.url, method: config.method });
        return Promise.reject(new Error('Too many requests. Please wait before trying again.'));
      }

      return config;
    },
    (error) => {
      SecurityLogger.log('REQUEST_ERROR', { error: error.message }, 'medium');
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log security-relevant errors
      if (error.response?.status === 401) {
        SecurityLogger.logAuthEvent('failed_login', { reason: 'unauthorized' });
        // Handle unauthorized - clear tokens
        // AuthGuard will handle the redirect using React Router (respects basename)
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_profile');
      } else if (error.response?.status === 403) {
        SecurityLogger.logSuspiciousActivity('FORBIDDEN_ACCESS_ATTEMPT', {
          url: error.config?.url,
          method: error.config?.method,
        });
      } else if (error.response?.status === 429) {
        SecurityLogger.logSuspiciousActivity('RATE_LIMIT_EXCEEDED_SERVER', {
          url: error.config?.url,
        });
      } else if (!error.response && error.message?.includes('CORS')) {
        // CORS error - likely due to missing headers in backend CORS config
        SecurityLogger.log('CORS_ERROR', {
          url: error.config?.url,
          method: error.config?.method,
          message: 'CORS policy blocked the request. Check backend CORS configuration.',
        }, 'high');
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

