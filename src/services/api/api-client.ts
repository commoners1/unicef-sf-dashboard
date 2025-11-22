import axios, { type AxiosInstance } from 'axios';
import { useDashboardStore } from '@/features/dashboard';
import { CSRFProtection, RateLimiter, SecurityLogger, SECURITY_CONFIG, SecureStorage } from '@/lib/security-enhancements';
import { getLoginUrl, isPublicRoute } from '@/config/routes.config';

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
    // Enable credentials to send httpOnly cookies with requests
    withCredentials: true,
  });

  // Add request interceptor to include auth token and update baseURL dynamically
  apiClient.interceptors.request.use(
    (config) => {
      // Update baseURL on each request in case environment changed
      const currentStore = useDashboardStore.getState();
      config.baseURL = currentStore.currentEnvironment?.apiUrl || getDefaultBaseURL();

      // Ensure credentials are sent (for httpOnly cookies)
      config.withCredentials = true;

      // Note: Authentication is handled via httpOnly cookies
      // The browser automatically sends cookies with requests
      // No need to manually add Authorization header

      // Add CSRF token for state-changing operations
      // Check if current environment supports CSRF tokens
      const currentEnv = currentStore.currentEnvironment;
      const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '');
      const enableCSRF = currentEnv?.enableCSRF !== false; // Default to true unless explicitly disabled
      const shouldAddCSRF = enableCSRF && isStateChanging;
      
      if (shouldAddCSRF) {
        try {
          const csrfToken = CSRFProtection.getToken();
          if (csrfToken && config.headers) {
            config.headers['X-CSRF-Token'] = csrfToken;
          } else {
            // CSRF token not available - need to get it first
            // This can happen on first request or if cookie was cleared
            // We'll let the request fail with 403, then the error handler will retry
            SecurityLogger.log('CSRF_TOKEN_NOT_AVAILABLE', { 
              url: config.url,
              method: config.method 
            }, 'medium');
          }
        } catch (error) {
          // If CSRF token extraction fails, log but don't block the request
          SecurityLogger.log('CSRF_TOKEN_EXTRACTION_FAILED', { error }, 'low');
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

  // Add response interceptor for error handling and CSRF token extraction
  apiClient.interceptors.response.use(
    (response) => {
      // Extract CSRF token from response header (per FRONTEND_INTEGRATION_GUIDE.md)
      const csrfToken = response.headers['x-csrf-token'];
      if (csrfToken) {
        CSRFProtection.updateTokenFromHeader(csrfToken);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - Automatic token refresh (per FRONTEND_INTEGRATION_GUIDE.md)
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Skip refresh for login endpoint to avoid infinite loop
        if (originalRequest.url?.includes('/auth/login')) {
          SecurityLogger.logAuthEvent('failed_login', { reason: 'unauthorized' });
          SecureStorage.removeItem('user_profile');
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshResponse = await apiClient.post('/auth/refresh');
          
          // Update CSRF token if provided in refresh response
          const newCsrfToken = refreshResponse.headers['x-csrf-token'];
          if (newCsrfToken) {
            CSRFProtection.updateTokenFromHeader(newCsrfToken);
          }

          // Retry original request with new token
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - session expired, redirect to login
          SecurityLogger.logAuthEvent('session_expired', { reason: 'refresh_failed' });
          SecureStorage.removeItem('user_profile');
          
          // Redirect to login with correct path (using centralized config)
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            // Only redirect if not already on login/unauthorized page
            if (!isPublicRoute(currentPath)) {
              window.location.href = getLoginUrl();
            }
          }
          
          return Promise.reject(refreshError);
        }
      } else if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || '';
        
        // CSRF token missing - try to get it first, then retry
        if (errorMessage.includes('CSRF token') && !originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true;
          
          try {
            // Make a GET request to get CSRF token (GET requests don't require CSRF)
            const healthResponse = await apiClient.get('/health');
            const csrfToken = healthResponse.headers['x-csrf-token'];
            
            if (csrfToken) {
              CSRFProtection.updateTokenFromHeader(csrfToken);
              
              // Retry original request with CSRF token
              if (originalRequest.headers) {
                originalRequest.headers['X-CSRF-Token'] = csrfToken;
              }
              
              return apiClient(originalRequest);
            }
          } catch (csrfError) {
            // Failed to get CSRF token - log and reject
            SecurityLogger.log('CSRF_TOKEN_FETCH_FAILED', { 
              error: csrfError,
              originalUrl: originalRequest.url 
            }, 'high');
          }
        }
        
        // Other 403 errors or CSRF retry failed
        SecurityLogger.logSuspiciousActivity('FORBIDDEN_ACCESS_ATTEMPT', {
          url: error.config?.url,
          method: error.config?.method,
          message: errorMessage,
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

