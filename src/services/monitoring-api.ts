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

export interface QueueStatus {
  active: number;
  completed: number;
  delayed: number;
  failed: number;
  paused: number;
  prioritized: number;
  waiting: number;
  'waiting-children': number;
  avgProcessingTime?: number;
}

export interface SystemMetrics {
  jobsPerSecond: number;
  queueDepth: number;
  errorRate: number;
  avgProcessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: string;
}

export interface BatchStats {
  pendingUpdates: number;
  batchSize: number;
  batchTimeout: number;
}

export interface ProcessorMetrics {
  processed: number;
  failed: number;
  avgProcessingTime: number;
  totalProcessingTime: number;
  successRate: string;
}

export interface MonitoringHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  queues: {
    salesforce: QueueStatus;
    email: QueueStatus;
    notifications: QueueStatus;
    total: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
  performance: SystemMetrics;
  batch: BatchStats;
  processor: ProcessorMetrics;
}

export interface DetailedStats {
  queues: {
    salesforce: QueueStatus;
    email: QueueStatus;
    notifications: QueueStatus;
  };
  performance: SystemMetrics;
  alerts: any[];
}

export interface QueueAlert {
  type: 'warning' | 'error' | 'critical';
  message: string;
  queue: string;
  timestamp: string;
}

export class MonitoringApiService {
  // Get real-time monitoring health data
  static async getHealth(): Promise<MonitoringHealth> {
    const response = await apiClient.get('/queue/monitor/health');
    return response.data;
  }

  // Get detailed monitoring statistics
  static async getDetailedStats(): Promise<DetailedStats> {
    const response = await apiClient.get('/queue/monitor/detailed');
    return response.data;
  }

  // Get performance metrics
  static async getPerformanceMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get('/queue/monitor/metrics');
    return response.data;
  }

  // Get queue alerts
  static async getAlerts(): Promise<{ alerts: QueueAlert[]; timestamp: string }> {
    const response = await apiClient.get('/queue/monitor/alerts');
    return response.data;
  }

  // Force flush batch processing
  static async forceFlushBatch(): Promise<{ message: string; timestamp: string }> {
    const response = await apiClient.post('/queue/monitor/force-flush');
    return response.data;
  }

  // Pause queue
  static async pauseQueue(queueName: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/queue/${queueName}/pause`);
    return response.data;
  }

  // Resume queue
  static async resumeQueue(queueName: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/queue/${queueName}/resume`);
    return response.data;
  }

  // Clear queue
  static async clearQueue(queueName: string): Promise<{ message: string; cleared: number }> {
    const response = await apiClient.post(`/queue/${queueName}/clear`);
    return response.data;
  }
}

export default MonitoringApiService;
