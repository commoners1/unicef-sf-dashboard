import { getApiClient } from '../api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export interface Report {
  id: string;
  name: string;
  type: string;
  description?: string;
  filePath?: string;
  format: string;
  status: string;
  size?: number;
  schedule: string;
  lastGenerated?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export class ReportsApiService {
  static async getReports(): Promise<Report[]> {
    const response = await apiClient.get('/reports');
    return response.data;
  }
  static async generateReport(reportId: string): Promise<Report> {
    const response = await apiClient.post(`/reports/${reportId}/generate`);
    return response.data;
  }
  static async downloadReport(reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/reports/${reportId}/download`, { responseType: 'blob' });
    return response.data;
  }
}

