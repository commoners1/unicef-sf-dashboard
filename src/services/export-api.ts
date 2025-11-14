import { getApiClient } from '@/lib/api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filters?: Record<string, any>;
  fields?: string[];
  filename?: string;
  includeMetadata?: boolean;
}

export interface QueueExportData {
  queueName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  health: string;
  timestamp: string;
}

export interface UserExportData {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  apiKeyCount: number;
}

export interface CronJobExportData {
  id: string;
  action: string;
  endpoint: string;
  method: string;
  statusCode: number;
  isDelivered: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  apiKey?: {
    name: string;
  };
}

export class ExportApiService {
  // Export audit logs
  static async exportAuditLogs(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/audit/export', {
      format: options.format,
      filters: options.filters || {},
      fields: options.fields || [],
      includeMetadata: options.includeMetadata || false,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export queue data
  static async exportQueueData(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/queue/export', {
      format: options.format,
      filters: options.filters || {},
      fields: options.fields || [],
      includeMetadata: options.includeMetadata || false,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export user data
  static async exportUserData(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/users/export', {
      format: options.format,
      filters: options.filters || {},
      fields: options.fields || [],
      includeMetadata: options.includeMetadata || false,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export cron jobs
  static async exportCronJobs(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/audit/export-cron-jobs', {
      format: options.format,
      filters: options.filters || {},
      fields: options.fields || [],
      includeMetadata: options.includeMetadata || false,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export system metrics
  static async exportSystemMetrics(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/system/export-metrics', {
      format: options.format,
      filters: options.filters || {},
      fields: options.fields || [],
      includeMetadata: options.includeMetadata || false,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export all dashboard data
  static async exportAllData(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/export/all', {
      format: options.format,
      filters: options.filters || {},
      fields: options.fields || [],
      includeMetadata: options.includeMetadata || false,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Client-side export utilities
  static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  static exportToCSV(data: any[], filename: string, fields?: string[]): void {
    if (data.length === 0) return;

    const headers = fields || Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  static exportToJSON(data: any[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
  }

  static generateFilename(prefix: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}-${timestamp}.${format}`;
  }
}

export default ExportApiService;
