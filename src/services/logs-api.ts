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

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  apiKeyId?: string;
  apiKey?: {
    name: string;
    description: string;
  };
  action: string;
  endpoint: string;
  method: string;
  type?: string;
  requestData?: any;
  responseData?: any;
  statusCode: number;
  ipAddress: string;
  userAgent?: string;
  duration?: number;
  isDelivered: boolean;
  createdAt: string;
}

export interface LogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  apiKeyId?: string;
  action?: string;
  method?: string;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  isDelivered?: boolean;
}

export class LogsApiService {
  static async getLogs(filters: LogFilters = {}): Promise<LogsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.apiKeyId) params.append('apiKeyId', filters.apiKeyId);
    if (filters.action) params.append('action', filters.action);
    if (filters.method) params.append('method', filters.method);
    if (filters.statusCode) params.append('statusCode', filters.statusCode.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.isDelivered !== undefined) params.append('isDelivered', filters.isDelivered.toString());

    const response = await apiClient.get(`/audit/dashboard/logs?${params.toString()}`);
    return response.data;
  }

  static async getLogStats(): Promise<any> {
    const response = await apiClient.get('/audit/stats');
    return response.data;
  }

  static async markAsDelivered(jobIds: string[]): Promise<any> {
    const response = await apiClient.post('/audit/mark-delivered', { jobIds });
    return response.data;
  }
}
