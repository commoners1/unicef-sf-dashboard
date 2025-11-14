import { getApiClient } from '@/lib/api-client';

// Use dynamic API client that switches based on current environment
const authClient = getApiClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
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
  static async getProfile(): Promise<User> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await authClient.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  // Refresh token
  static async refreshToken(): Promise<{ access_token: string }> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await authClient.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  // Logout user
  static async logout(): Promise<void> {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        await authClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Continue with logout even if server call fails
        console.warn('Logout server call failed:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_profile');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
      // Basic JWT token validation (check if not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Get stored user profile
  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user_profile');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Store user profile
  static storeUser(user: User): void {
    localStorage.setItem('user_profile', JSON.stringify(user));
  }

  // Store auth token
  static storeToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }
}

export default AuthApiService;
