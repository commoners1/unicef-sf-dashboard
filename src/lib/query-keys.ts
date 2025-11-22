// src/lib/query-keys.ts
/**
 * Centralized query key factory for type-safe React Query keys
 * Format: ['module', 'endpoint', ...params]
 */

// Type definitions for filters
export interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  method?: string;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  [key: string]: any;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  queue?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ErrorFilters {
  page?: number;
  limit?: number;
  type?: string;
  source?: string;
  environment?: string;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CronJobFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface CronJobHistoryFilters {
  page?: number;
  limit?: number;
  jobId?: string;
}

export const queryKeys = {
  // Audit
  audit: {
    all: ['audit'] as const,
    stats: () => ['audit', 'stats'] as const,
    dashboardStats: () => ['audit', 'dashboard', 'stats'] as const,
    userStats: () => ['audit', 'user', 'stats'] as const,
    // Filtered logs - include filters in key (Tier 3: No cache)
    logs: (filters?: AuditLogFilters) => ['audit', 'logs', filters] as const,
    logById: (id: string) => ['audit', 'logs', id] as const,
    // Static reference data - CAN cache (Tier 1)
    actions: () => ['audit', 'actions'] as const,
    methods: () => ['audit', 'methods'] as const,
    statusCodes: () => ['audit', 'status-codes'] as const,
    // Analytics - CAN cache (Tier 1)
    analytics: {
      usageStats: () => ['audit', 'analytics', 'usage-stats'] as const,
      hourlyUsage: () => ['audit', 'analytics', 'hourly-usage'] as const,
      topEndpoints: () => ['audit', 'analytics', 'top-endpoints'] as const,
      userActivity: () => ['audit', 'analytics', 'user-activity'] as const,
    },
    // Salesforce logs stats - CAN cache
    salesforceStats: () => ['audit', 'salesforce-logs', 'stats'] as const,
    // Filtered Salesforce logs - NO cache (Tier 3)
    salesforceLogs: (filters?: AuditLogFilters) => ['audit', 'salesforce-logs', 'list', filters] as const,
    salesforceLogById: (id: string) => ['audit', 'salesforce-logs', id] as const,
    // Cron jobs - filtered, NO cache (Tier 3)
    cronJobs: (jobType?: string) => ['audit', 'cron-jobs', jobType] as const,
  },

  // Queue
  queue: {
    all: ['queue'] as const,
    // Real-time monitoring - CAN cache (Tier 1: short TTL)
    health: () => ['queue', 'monitor', 'health'] as const,
    metrics: () => ['queue', 'monitor', 'metrics'] as const,
    detailed: () => ['queue', 'monitor', 'detailed'] as const,
    alerts: () => ['queue', 'monitor', 'alerts'] as const,
    stats: () => ['queue', 'stats'] as const,
    counts: () => ['queue', 'counts'] as const,
    performance: () => ['queue', 'performance'] as const,
    // Real-time jobs - NO CACHE (Tier 3: staleTime: 0)
    jobs: (filters?: JobFilters) => ['queue', 'jobs', filters] as const,
    jobById: (id: string) => ['queue', 'jobs', id] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: () => ['user', 'profile'] as const,
    allUsers: (page?: number, limit?: number) => ['user', 'all', page, limit] as const,
    byId: (id: string) => ['user', id] as const,
    roles: () => ['user', 'roles', 'available'] as const,
  },

  // Settings
  settings: {
    all: () => ['settings'] as const,
  },

  // Errors
  errors: {
    all: ['errors'] as const,
    stats: () => ['errors', 'stats'] as const,
    trends: (range?: string) => ['errors', 'trends', range] as const,
    // Filtered list - NO CACHE (Tier 3)
    list: (filters?: ErrorFilters) => ['errors', 'list', filters] as const,
    byId: (id: string) => ['errors', id] as const,
    // Static reference data - CAN cache (Tier 1)
    sources: () => ['errors', 'sources'] as const,
    types: () => ['errors', 'types'] as const,
    environments: () => ['errors', 'environments'] as const,
  },

  // Cron Jobs
  cronJobs: {
    all: ['cron-jobs'] as const,
    stats: () => ['cron-jobs', 'stats'] as const,
    states: () => ['cron-jobs', 'states'] as const,
    state: (type: string) => ['cron-jobs', 'state', type] as const,
    schedules: () => ['cron-jobs', 'schedules'] as const,
    // Filtered list - NO CACHE (Tier 3)
    list: (filters?: CronJobFilters) => ['cron-jobs', 'list', filters] as const,
    history: (filters?: CronJobHistoryFilters) => ['cron-jobs', 'history', filters] as const,
  },

  // API Keys
  apiKeys: {
    all: ['api-keys'] as const,
    keys: () => ['api-keys', 'keys'] as const,
    byEnvironment: (env: string) => ['api-keys', 'keys', env] as const,
  },

  // Reports
  reports: {
    all: () => ['reports'] as const,
    byId: (id: string) => ['reports', id] as const,
  },
} as const;

