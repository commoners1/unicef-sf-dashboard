import { getApiClient } from '../api-client';
import type { AuditLog, AuditLogFilters, AuditLogResponse, AuditLogStats, AuditLogExportOptions } from '@/types/audit';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export class SalesforceLogsApiService {
  // Get Salesforce logs with filters
  static async getSalesforceLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
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

    const response = await apiClient.get(`/audit/dashboard/salesforce-logs?${params.toString()}`);
    return response.data;
  }

  // Get Salesforce log statistics
  static async getSalesforceStats(): Promise<AuditLogStats> {
    const response = await apiClient.get('/audit/dashboard/salesforce-logs/stats');
    return response.data;
  }

  // Get Salesforce log by ID
  static async getSalesforceLogById(id: string): Promise<AuditLog> {
    const response = await apiClient.get(`/audit/salesforce-logs/${id}`);
    return response.data;
  }

  // Export Salesforce logs
  static async exportSalesforceLogs(options: AuditLogExportOptions): Promise<Blob> {
    const response = await apiClient.post('/audit/salesforce-logs/export', options, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get Salesforce log actions (for filter dropdown)
  static async getSalesforceActions(): Promise<string[]> {
    const response = await apiClient.get('/audit/salesforce-logs/actions');
    return response.data;
  }

  // Get Salesforce log methods (for filter dropdown)
  static async getSalesforceMethods(): Promise<string[]> {
    const response = await apiClient.get('/audit/salesforce-logs/methods');
    return response.data;
  }

  // Get Salesforce log status codes (for filter dropdown)
  static async getSalesforceStatusCodes(): Promise<number[]> {
    const response = await apiClient.get('/audit/salesforce-logs/status-codes');
    return response.data;
  }
}

export default SalesforceLogsApiService;

