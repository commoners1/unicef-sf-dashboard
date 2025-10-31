import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
  apiKeyCount?: number;
}

export interface UpdateUserData {
  name?: string;
  company?: string;
}

export interface UpdateRoleData {
  role: string;
}

export interface UserResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AvailableRoles {
  roles: string[];
  descriptions: Record<string, string>;
}

export class UserApiService {
  // Get user profile
  static async getProfile(): Promise<User> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  }

  // Update user profile
  static async updateProfile(data: UpdateUserData): Promise<User> {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  }

  // Get all users (admin only)
  static async getAllUsers(page: number = 1, limit: number = 50): Promise<UserResponse> {
    const response = await apiClient.get(`/user/all?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/user/${id}`);
    return response.data;
  }

  // Update user role (admin only)
  static async updateUserRole(id: string, role: string): Promise<User> {
    const response = await apiClient.post(`/user/${id}/role`, { role });
    return response.data;
  }

  // Get available roles
  static async getAvailableRoles(): Promise<AvailableRoles> {
    const response = await apiClient.get('/user/roles/available');
    return response.data;
  }
}

export default UserApiService;
