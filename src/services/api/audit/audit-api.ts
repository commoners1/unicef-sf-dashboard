import { getApiClient } from '../api-client';
import type { AuditLog, AuditLogFilters, AuditLogResponse, AuditLogStats, AuditLogExportOptions } from '@/types/audit';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export class AuditApiService {
  // Get audit logs with filters
  static async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle columnFilters - serialize as JSON string
        if (key === 'columnFilters' && typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        }
        // Handle boolean values - convert to string explicitly
        else if (typeof value === 'boolean') {
          params.append(key, value ? 'true' : 'false');
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/audit/dashboard/logs?${params.toString()}`);
    return response.data;
  }

  // Get audit log statistics
  static async getAuditStats(): Promise<AuditLogStats> {
    const response = await apiClient.get('/audit/dashboard/stats');
    return response.data;
  }

  // Get audit log by ID
  static async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await apiClient.get(`/audit/logs/${id}`);
    return response.data;
  }

  // Export audit logs
  static async exportAuditLogs(options: AuditLogExportOptions): Promise<Blob> {
    const response = await apiClient.post('/audit/export', options, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get audit log actions (for filter dropdown)
  static async getAuditActions(): Promise<string[]> {
    const response = await apiClient.get('/audit/actions');
    return response.data;
  }

  // Get audit log methods (for filter dropdown)
  static async getAuditMethods(): Promise<string[]> {
    const response = await apiClient.get('/audit/methods');
    return response.data;
  }

  // Get audit log status codes (for filter dropdown)
  static async getAuditStatusCodes(): Promise<number[]> {
    const response = await apiClient.get('/audit/status-codes');
    return response.data;
  }

  // Get undelivered cron jobs
  static async getUndeliveredCronJobs(jobType?: string): Promise<AuditLog[]> {
    const params = jobType ? `?jobType=${jobType}` : '';
    const response = await apiClient.get(`/audit/cron-jobs${params}`);
    return response.data;
  }

  // Mark jobs as delivered
  static async markAsDelivered(jobIds: string[]): Promise<{ updated: number; message: string }> {
    const response = await apiClient.post('/audit/mark-delivered', { jobIds });
    return response.data;
  }

  // Get user-specific logs (for non-admin users)
  static async getUserLogs(page: number = 1, limit: number = 50): Promise<AuditLogResponse> {
    const response = await apiClient.get(`/audit/logs?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Get user-specific stats (for non-admin users)
  static async getUserStats(): Promise<AuditLogStats> {
    const response = await apiClient.get('/audit/stats');
    return response.data;
  }
}

export default AuditApiService;

