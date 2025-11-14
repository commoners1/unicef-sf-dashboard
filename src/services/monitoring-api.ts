import { getApiClient } from '@/lib/api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

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
