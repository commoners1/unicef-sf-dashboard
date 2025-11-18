/**
 * Auth feature types
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  // Note: access_token removed - authentication now via httpOnly cookie
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

