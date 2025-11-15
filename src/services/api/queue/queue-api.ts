import { getApiClient } from '../api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export interface QueueHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  queues: {
    salesforce: QueueInfo;
    email: QueueInfo;
    notifications: QueueInfo;
  };
  error?: string;
}

export interface QueueInfo {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  health: 'healthy' | 'warning' | 'critical';
}

export interface QueueMetrics {
  salesforce: QueueInfo;
  email: QueueInfo;
  notifications: QueueInfo;
  timestamp: string;
}

export interface PerformanceMetrics {
  throughput: number;
  avgProcessingTime: number;
  errorRate: number;
  queueDepth: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: string;
}

export interface QueueAlert {
  type: 'warning' | 'error' | 'critical';
  message: string;
  queue: string;
  timestamp: string;
}

export interface DetailedStats {
  performance: PerformanceMetrics;
  alerts: QueueAlert[];
  queues: QueueMetrics;
  timestamp: string;
}

export interface Job {
  id: string;
  name: string;
  data: any;
  opts: any;
  progress: number;
  delay: number;
  timestamp: number;
  attemptsMade: number;
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
  returnvalue?: any;
  stacktrace?: string[];
  queue: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface JobResponse {
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobFilters {
  page?: number;
  limit?: number;
  queue?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export class QueueApiService {
  // Get queue health status
  static async getQueueHealth(): Promise<QueueHealth> {
    const response = await apiClient.get('/queue/monitor/health');
    return response.data;
  }

  // Get detailed queue statistics
  static async getDetailedStats(): Promise<DetailedStats> {
    const response = await apiClient.get('/queue/monitor/detailed');
    return response.data;
  }

  // Get queue metrics
  static async getQueueMetrics(): Promise<QueueMetrics> {
    const response = await apiClient.get('/queue/monitor/metrics');
    return response.data;
  }

  // Force flush batch processing
  static async forceFlushBatch(): Promise<{ message: string; timestamp: string }> {
    const response = await apiClient.post('/queue/monitor/force-flush');
    return response.data;
  }

  // Get queue alerts
  static async getQueueAlerts(): Promise<{ alerts: QueueAlert[]; timestamp: string }> {
    const response = await apiClient.get('/queue/monitor/alerts');
    return response.data;
  }

  // Get jobs with filters
  static async getJobs(filters: JobFilters = {}): Promise<JobResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/queue/jobs?${params.toString()}`);
    return response.data;
  }

  // Get job by ID
  static async getJobById(id: string): Promise<Job> {
    const response = await apiClient.get(`/queue/jobs/${id}`);
    return response.data;
  }

  // Retry failed job
  static async retryJob(id: string): Promise<{ message: string; job: Job }> {
    const response = await apiClient.post(`/queue/jobs/${id}/retry`);
    return response.data;
  }

  // Remove job
  static async removeJob(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/queue/jobs/${id}`);
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

  // Get queue statistics
  static async getQueueStats(): Promise<QueueMetrics> {
    const response = await apiClient.get('/queue/stats');
    return response.data;
  }

  // Get job counts by status
  static async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const response = await apiClient.get('/queue/counts');
    return response.data;
  }

  // Get performance metrics
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get('/queue/performance');
    return response.data;
  }

  // Export jobs
  static async exportJobs(filters: JobFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await apiClient.post('/queue/export', {
      filters,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default QueueApiService;

