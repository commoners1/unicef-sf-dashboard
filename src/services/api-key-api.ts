import { getApiClient } from '@/lib/api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

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
