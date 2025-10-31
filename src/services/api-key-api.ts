import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  environment: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export interface CreateApiKeyData {
  name: string;
  description?: string;
  permissions?: string[];
  environment?: string;
}

export class ApiKeyApiService {
  // Generate new API key
  static async generateApiKey(data: CreateApiKeyData): Promise<ApiKey> {
    const response = await apiClient.post('/api-key/generate', data);
    return response.data;
  }

  // Get user's API keys
  static async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get('/api-key/keys');
    return response.data;
  }

  // Get API keys by environment
  static async getApiKeysByEnvironment(environment: string): Promise<ApiKey[]> {
    const response = await apiClient.get(`/api-key/keys/${environment}`);
    return response.data;
  }

  // Revoke API key
  static async revokeApiKey(keyId: string): Promise<void> {
    await apiClient.post('/api-key/revoke', { key: keyId });
  }

  // Delete API key
  static async deleteApiKey(keyId: string): Promise<void> {
    await apiClient.post('/api-key/delete', { key: keyId });
  }

  // Activate API key
  static async activateApiKey(keyId: string): Promise<void> {
    await apiClient.post('/api-key/activate', { key: keyId });
  }
}

export default ApiKeyApiService;
