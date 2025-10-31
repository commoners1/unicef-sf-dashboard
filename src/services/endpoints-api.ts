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

export interface Endpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  responseTime: number;
  lastChecked: string;
  successRate: number;
  totalRequests: number;
  errorCount: number;
  description?: string;
  category: 'api' | 'health' | 'monitoring' | 'queue' | 'auth';
  version?: string;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EndpointResponse {
  data: Endpoint[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EndpointFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  environment?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EndpointStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  error: number;
  avgResponseTime: number;
  totalRequests: number;
  successRate: number;
  errorRate: number;
}

export interface EndpointHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  endpoints: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      lastChecked: string;
      error?: string;
    };
  };
}

export class EndpointsApiService {
  // Get all endpoints
  static async getEndpoints(filters: EndpointFilters = {}): Promise<EndpointResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/endpoints?${params.toString()}`);
    return response.data;
  }

  // Get endpoint by ID
  static async getEndpointById(id: string): Promise<Endpoint> {
    const response = await apiClient.get(`/endpoints/${id}`);
    return response.data;
  }

  // Get endpoint statistics
  static async getEndpointStats(): Promise<EndpointStats> {
    const response = await apiClient.get('/endpoints/stats');
    return response.data;
  }

  // Get endpoint health status
  static async getEndpointHealth(): Promise<EndpointHealth> {
    const response = await apiClient.get('/endpoints/health');
    return response.data;
  }

  // Test endpoint
  static async testEndpoint(id: string): Promise<{
    success: boolean;
    responseTime: number;
    status: number;
    error?: string;
  }> {
    const response = await apiClient.post(`/endpoints/${id}/test`);
    return response.data;
  }

  // Update endpoint status
  static async updateEndpointStatus(
    id: string, 
    status: 'active' | 'inactive' | 'maintenance'
  ): Promise<Endpoint> {
    const response = await apiClient.patch(`/endpoints/${id}/status`, { status });
    return response.data;
  }

  // Get endpoint metrics
  static async getEndpointMetrics(
    id: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    requests: Array<{ timestamp: string; count: number }>;
    responseTime: Array<{ timestamp: string; avg: number; p95: number; p99: number }>;
    errors: Array<{ timestamp: string; count: number; rate: number }>;
  }> {
    const response = await apiClient.get(`/endpoints/${id}/metrics?range=${timeRange}`);
    return response.data;
  }

  // Get system health (fallback to health endpoint)
  static async getSystemHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    message: string;
  }> {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // Get queue health (from queue monitor)
  static async getQueueHealth(): Promise<{
    status: string;
    timestamp: string;
    queues: any;
    performance: any;
    batch: any;
    processor: any;
  }> {
    const response = await apiClient.get('/queue/monitor/health');
    return response.data;
  }

  // Export endpoints
  static async exportEndpoints(
    filters: EndpointFilters, 
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    const response = await apiClient.post('/endpoints/export', {
      filters,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get endpoint categories
  static async getEndpointCategories(): Promise<string[]> {
    const response = await apiClient.get('/endpoints/categories');
    return response.data;
  }

  // Get endpoint environments
  static async getEndpointEnvironments(): Promise<string[]> {
    const response = await apiClient.get('/endpoints/environments');
    return response.data;
  }
}

export default EndpointsApiService;
