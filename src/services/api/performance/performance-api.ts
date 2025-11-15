import { getApiClient } from '../api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export interface PerformanceMetrics {
  jobsPerSecond: number;
  queueDepth: number;
  errorRate: number;
  avgProcessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export class PerformanceApiService {
  static async getMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get('/queue/monitor/metrics');
    return response.data;
  }

  static async getAlerts(): Promise<{ alerts: PerformanceAlert[]; timestamp: string }> {
    const response = await apiClient.get('/queue/monitor/alerts');
    return response.data;
  }
}

