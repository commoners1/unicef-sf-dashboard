/**
 * Auth feature types
 */
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

