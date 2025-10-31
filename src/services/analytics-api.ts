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

export interface UsageStats {
  totalRequests: number;
  uniqueUsers: number;
  averageResponseTime: number;
  peakHourlyRequests: number;
  errorRate: number;
}

export interface HourlyUsage {
  hour: string;
  requests: number;
  users: number;
}

export interface TopEndpoint {
  endpoint: string;
  requests: number;
  percentage: number;
}

export interface UserActivity {
  user: string;
  requests: number;
  lastActive: string;
}

export class AnalyticsApiService {
  static async getUsageStats(): Promise<UsageStats> {
    const response = await apiClient.get('/audit/analytics/usage-stats');
    return response.data;
  }

  static async getHourlyUsage(): Promise<HourlyUsage[]> {
    const response = await apiClient.get('/audit/analytics/hourly-usage');
    return response.data;
  }

  static async getTopEndpoints(): Promise<TopEndpoint[]> {
    const response = await apiClient.get('/audit/analytics/top-endpoints');
    return response.data;
  }

  static async getUserActivity(): Promise<UserActivity[]> {
    const response = await apiClient.get('/audit/analytics/user-activity');
    return response.data;
  }
}
