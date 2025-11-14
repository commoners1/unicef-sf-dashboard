import { getApiClient } from '@/lib/api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

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
