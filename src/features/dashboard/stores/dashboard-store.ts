import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashboardStore, SystemHealth, MetricsData, QueueStatus, User, ApiKey, LogEntry } from '@/types';
import { environments, defaultEnvironment } from '@/config/environments';

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
        set(state => ({
          logs: [log, ...state.logs.slice(0, 999)] // Keep last 1000 logs
        }));
      },
      clearLogs: () => {
        set({ logs: [] });
      },

      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      theme: 'light',
      toggleTheme: () => {
        set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        currentEnvironment: state.currentEnvironment,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

