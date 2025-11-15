import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashboardStore, SystemHealth, MetricsData, QueueStatus, User, ApiKey, LogEntry } from '@/types';
import { environments, defaultEnvironment } from '@/config/environments';
import type { EnvironmentConfig } from '@/types';

/**
 * Validates and migrates stored environment to match current configuration
 * This ensures that if environment URLs change in code, localStorage is updated
 */
function migrateEnvironment(storedEnv: EnvironmentConfig | null): EnvironmentConfig {
  if (!storedEnv) {
    return defaultEnvironment;
  }

  // Find matching environment by ID
  const matchingEnv = environments.find(env => env.id === storedEnv.id);
  
  if (matchingEnv) {
    // Environment exists, but check if URL has changed
    if (matchingEnv.apiUrl !== storedEnv.apiUrl || matchingEnv.wsUrl !== storedEnv.wsUrl) {
      // Environment configuration has changed, use the updated one
      return matchingEnv;
    }
    // Environment is still valid, return stored one (preserves any custom state)
    return storedEnv;
  }

  // Stored environment ID doesn't exist anymore, fallback to default
  return defaultEnvironment;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      // Environment
      currentEnvironment: defaultEnvironment,
      environments,
      switchEnvironment: (envId: string) => {
        const environment = environments.find(env => env.id === envId);
        if (environment) {
          set({ currentEnvironment: environment });
        }
      },

      // System Health
      systemHealth: null,
      updateSystemHealth: (health: SystemHealth) => {
        set({ systemHealth: health });
      },

      // Metrics
      metrics: null,
      updateMetrics: (metrics: MetricsData) => {
        set({ metrics });
      },

      // Queue Status
      queueStatus: null,
      updateQueueStatus: (status: QueueStatus) => {
        set({ queueStatus: status });
      },

      // User Management
      users: [],
      selectedUser: null,
      setSelectedUser: (user: User | null) => {
        set({ selectedUser: user });
      },

      // API Keys
      apiKeys: [],
      selectedApiKey: null,
      setSelectedApiKey: (key: ApiKey | null) => {
        set({ selectedApiKey: key });
      },

      // Logs
      logs: [],
      addLog: (log: LogEntry) => {
        set((state: DashboardStore) => ({
          logs: [log, ...state.logs.slice(0, 999)] // Keep last 1000 logs
        }));
      },
      clearLogs: () => {
        set({ logs: [] });
      },

      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => {
        set((state: DashboardStore) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      sidebarOpen: false, // Mobile sidebar state
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
      theme: 'light',
      toggleTheme: () => {
        set((state: DashboardStore) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },
    }),
    {
      name: 'dashboard-storage',
      version: 1, // Increment this when environment structure changes
      partialize: (state) => ({
        currentEnvironment: state.currentEnvironment,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarOpen: false, // Don't persist mobile sidebar state
        theme: state.theme,
      }),
      migrate: (persistedState: any, _version: number) => {
        // Migrate stored environment to match current configuration
        if (persistedState?.state?.currentEnvironment) {
          persistedState.state.currentEnvironment = migrateEnvironment(
            persistedState.state.currentEnvironment
          );
        }
        return persistedState;
      },
      merge: (persistedState: any, currentState: any) => {
        // Validate and update environment on merge
        if (persistedState?.currentEnvironment) {
          persistedState.currentEnvironment = migrateEnvironment(
            persistedState.currentEnvironment
          );
        }
        return {
          ...currentState,
          ...persistedState,
        };
      },
    }
  )
);
