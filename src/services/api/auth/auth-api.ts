import { getApiClient } from '../api-client';
import { SecureStorage } from '@/lib/security-enhancements';

// Use dynamic API client that switches based on current environment
const authClient = getApiClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  // Note: access_token is no longer returned - authentication via httpOnly cookie
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export class AuthApiService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await authClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Add error code for better error handling
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        error.code = 'NETWORK_ERROR';
      }
      throw error;
    }
  }

  // Get current user profile
  // Authentication handled via httpOnly cookie (sent automatically)
  static async getProfile(): Promise<User> {
    const response = await authClient.get('/user/profile');
    
    // Debug: Log API response to verify data structure
    // console.log('API Profile Response:', response.data);
    
    // Ensure the response has all required fields
    if (!response.data) {
      throw new Error('Invalid profile response: missing data');
    }
    
    // Verify name field exists
    if (!response.data.name) {
      console.warn('Profile response missing name field:', response.data);
    }
    
    return response.data;
  }

  // Refresh token
  // Authentication handled via httpOnly cookie (sent automatically)
  static async refreshToken(): Promise<void> {
    await authClient.post('/auth/refresh');
    // Cookie is automatically refreshed by backend
  }

  // Logout user
  // Authentication handled via httpOnly cookie (sent automatically)
  static async logout(): Promise<void> {
    try {
      // Backend will clear the httpOnly cookie
      await authClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Logout server call failed:', error);
    } finally {
      // SECURITY: Complete cleanup of all storage
      this.clearAllStorage();
    }
  }

  // SECURITY: Clear all authentication-related storage
  static clearAllStorage(): void {
    try {
      // Clear encrypted user profile
      SecureStorage.removeItem('user_profile');
      
      // Clear auth storage (Zustand persist)
      localStorage.removeItem('auth-storage');
      
      // Clear any other auth-related storage
      SecureStorage.clear();
      
      // SECURITY: Clear dashboard-storage on logout for sensitive environments
      // This prevents exposing production API URLs and feature flags
      // Note: User can still manually switch environments after login
      const dashboardStorage = localStorage.getItem('dashboard-storage');
      if (dashboardStorage) {
        try {
          const parsed = JSON.parse(dashboardStorage);
          // Only clear if it contains production environment info
          if (parsed?.state?.currentEnvironment?.isProduction === true) {
            localStorage.removeItem('dashboard-storage');
            // console.log('Cleared dashboard-storage containing production environment');
          }
        } catch {
          // If parsing fails, don't clear (might be corrupted)
        }
      }
      
      // Additional cleanup: clear all cookies (if any client-side cookies exist)
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Clear cookie with all possible paths
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      });
      
      // Clear sessionStorage as well
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Check if user is authenticated
  // With httpOnly cookies, we can't check token existence client-side
  // This method now checks if we have a stored user profile
  // The backend will validate the cookie on each request
  static async isAuthenticated(): Promise<boolean> {
    // Check if we have a stored user profile
    // Actual authentication is validated by backend via httpOnly cookie
    const user = await this.getStoredUser();
    return user !== null;
  }

  // Get stored user profile (minimal data only)
  static async getStoredUser(): Promise<Partial<User> | null> {
    try {
      // Use SecureStorage to get encrypted data
      const user = await SecureStorage.getItemJSON<Partial<User>>('user_profile', true);
      return user;
    } catch {
      return null;
    }
  }

  // Store user profile (SECURITY: Only store minimal non-sensitive data)
  static async storeUser(user: User): Promise<void> {
    // SECURITY: Do NOT store sensitive data in localStorage
    // Only store minimal data needed for UI display
    const minimalUser = {
      id: user.id,
      name: user.name || '', // Only name for display
      // DO NOT store: email, role, or any other sensitive information
    };
    
    // Encrypt and store using SecureStorage
    await SecureStorage.setItem('user_profile', minimalUser, true);
  }

  // Get active sessions
  // Per FRONTEND_INTEGRATION_GUIDE.md: GET /auth/sessions
  static async getSessions(): Promise<Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
    ipAddress: string | null;
    userAgent: string | null;
  }>> {
    const response = await authClient.get('/auth/sessions');
    return response.data;
  }

  // Revoke all sessions
  // Per FRONTEND_INTEGRATION_GUIDE.md: POST /auth/revoke-all (requires CSRF token)
  static async revokeAllSessions(): Promise<void> {
    await authClient.post('/auth/revoke-all');
    // All sessions revoked - user will need to login again
    // Clear local storage
    this.clearAllStorage();
  }

  // Note: Token storage removed - authentication now via httpOnly cookies
  // The backend sets the cookie, browser manages it automatically
}

export default AuthApiService;

