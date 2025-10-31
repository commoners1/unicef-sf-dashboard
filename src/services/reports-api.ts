import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
