import { getApiClient } from '../api-client';

// Use dynamic API client that switches based on current environment
const apiClient = getApiClient();

export type SettingsObject = Record<string, Record<string, any>>;

export class SettingsApiService {
  static async getSettings(): Promise<SettingsObject> {
    const response = await apiClient.get('/settings');
    return response.data;
  }
  static async updateSettings(patch: SettingsObject): Promise<SettingsObject> {
    const response = await apiClient.put('/settings', patch);
    return response.data;
  }
}

