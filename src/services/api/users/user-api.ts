import { getApiClient } from '../api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

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

export interface AllUsersCount {
  count: number;
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
  // Get all users count
  static async getAllUsersCount(): Promise<AllUsersCount> {
    const response = await apiClient.get('/user/all/count');
    return response.data;
  }

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

