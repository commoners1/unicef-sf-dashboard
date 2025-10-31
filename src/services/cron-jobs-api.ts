import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/cron-jobs`,
  timeout: 10000,
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
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

export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  nextRun: string;
  lastRun: string | null;
  status: 'active' | 'paused' | 'error';
  isEnabled: boolean;
  duration: number | null;
  successCount: number;
  failureCount: number;
  lastStatus: 'success' | 'failed' | 'running' | null;
  lastStatusMessage: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CronJobStats {
  total: number;
  active: number;
  paused: number;
  error: number;
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  last24Hours: number;
}

export interface CronJobHistory {
  id: string;
  jobId: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  message: string | null;
  error: string | null;
}

export interface CronJobResponse {
  jobs: CronJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CronJobHistoryResponse {
  history: CronJobHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CronSchedule {
  name: string;
  schedule: string;
  description: string;
  type: string;
  nextRun: string;
  isEnabled: boolean;
}

export class CronJobsApiService {
  static async getCronJobs(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}): Promise<CronJobResponse> {
    const response = await apiClient.get('/', { params });
    return response.data;
  }

  static async getCronJobStats(): Promise<CronJobStats> {
    const response = await apiClient.get('/stats');
    return response.data;
  }

  static async getCronJobHistory(params: {
    page?: number;
    limit?: number;
    jobId?: string;
  } = {}): Promise<CronJobHistoryResponse> {
    const response = await apiClient.get('/history', { params });
    return response.data;
  }

  static async runCronJob(jobType: string): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await apiClient.post(`/${jobType}/run`);
    return response.data;
  }

  static async toggleCronJob(jobType: string, enabled: boolean): Promise<{ success: boolean; message: string; enabled: boolean; timestamp: string }> {
    const response = await apiClient.put(`/${jobType}/toggle`, { enabled });
    return response.data;
  }

  static async getCronSchedules(): Promise<CronSchedule[]> {
    const response = await apiClient.get('/schedules');
    return response.data;
  }
}
