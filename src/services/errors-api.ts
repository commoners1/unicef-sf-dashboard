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

export interface Error {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'critical' | 'info';
  source: string;
  stackTrace?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  tags: string[];
  environment: 'development' | 'staging' | 'production';
  metadata: Record<string, any>;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
}

export interface ErrorResponse {
  data: Error[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorFilters {
  page?: number;
  limit?: number;
  type?: string;
  source?: string;
  environment?: string;
  resolved?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorStats {
  total: number;
  unresolved: number;
  critical: number;
  error: number;
  warning: number;
  info: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  avgOccurrences: number;
  topSources: Array<{ source: string; count: number }>;
  topTypes: Array<{ type: string; count: number }>;
}

export interface ErrorTrend {
  date: string;
  count: number;
  resolved: number;
  critical: number;
  error: number;
  warning: number;
}

export class ErrorsApiService {
  // Get all errors
  static async getErrors(filters: ErrorFilters = {}): Promise<ErrorResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/errors?${params.toString()}`);
    return response.data;
  }

  // Get error by ID
  static async getErrorById(id: string): Promise<Error> {
    const response = await apiClient.get(`/errors/${id}`);
    return response.data;
  }

  // Get error statistics
  static async getErrorStats(): Promise<ErrorStats> {
    const response = await apiClient.get('/errors/stats');
    return response.data;
  }

  // Get error trends
  static async getErrorTrends(
    timeRange: '24h' | '7d' | '30d' = '7d'
  ): Promise<ErrorTrend[]> {
    const response = await apiClient.get(`/errors/trends?range=${timeRange}`);
    return response.data;
  }

  // Resolve error
  static async resolveError(id: string, resolvedBy: string): Promise<Error> {
    const response = await apiClient.patch(`/errors/${id}/resolve`, { resolvedBy });
    return response.data;
  }

  // Unresolve error
  static async unresolveError(id: string): Promise<Error> {
    const response = await apiClient.patch(`/errors/${id}/unresolve`);
    return response.data;
  }

  // Bulk resolve errors
  static async bulkResolveErrors(ids: string[], resolvedBy: string): Promise<{
    resolved: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post('/errors/bulk-resolve', { ids, resolvedBy });
    return response.data;
  }

  // Delete error
  static async deleteError(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/errors/${id}`);
    return response.data;
  }

  // Bulk delete errors
  static async bulkDeleteErrors(ids: string[]): Promise<{
    deleted: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post('/errors/bulk-delete', { ids });
    return response.data;
  }

  // Get error sources
  static async getErrorSources(): Promise<string[]> {
    const response = await apiClient.get('/errors/sources');
    return response.data;
  }

  // Get error types
  static async getErrorTypes(): Promise<string[]> {
    const response = await apiClient.get('/errors/types');
    return response.data;
  }

  // Get similar errors
  static async getSimilarErrors(id: string): Promise<Error[]> {
    const response = await apiClient.get(`/errors/${id}/similar`);
    return response.data;
  }

  // Get error details with stack trace
  static async getErrorDetails(id: string): Promise<{
    error: Error;
    stackTrace: string;
    context: Record<string, any>;
    relatedErrors: Error[];
  }> {
    const response = await apiClient.get(`/errors/${id}/details`);
    return response.data;
  }

  // Export errors
  static async exportErrors(
    filters: ErrorFilters, 
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    const response = await apiClient.post('/errors/export', {
      filters,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get error alerts
  static async getErrorAlerts(): Promise<{
    alerts: Array<{
      id: string;
      type: 'spike' | 'critical' | 'new_source';
      message: string;
      count: number;
      timestamp: string;
      errorId?: string;
    }>;
    timestamp: string;
  }> {
    const response = await apiClient.get('/errors/alerts');
    return response.data;
  }

  // Mark alert as read
  static async markAlertAsRead(alertId: string): Promise<{ message: string }> {
    const response = await apiClient.patch(`/errors/alerts/${alertId}/read`);
    return response.data;
  }

  // Get error environments
  static async getErrorEnvironments(): Promise<string[]> {
    const response = await apiClient.get('/errors/environments');
    return response.data;
  }
}

export default ErrorsApiService;
