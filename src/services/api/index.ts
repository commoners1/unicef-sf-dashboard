// Barrel exports for all API services
// Using selective exports to avoid naming conflicts

// API Client
export * from './api-client';

// Analytics
export * from './analytics/analytics-api';

// Auth (export User type with alias to avoid conflict)
export { AuthApiService } from './auth/auth-api';
export type { LoginCredentials, LoginResponse, User as AuthUser } from './auth/auth-api';

// Audit
export * from './audit/audit-api';

// Salesforce Logs
export * from './salesforce-logs/salesforce-logs-api';

// Monitoring (export with aliases to avoid conflicts)
export { MonitoringApiService } from './monitoring/monitoring-api';
export type {
  QueueStatus as MonitoringQueueStatus,
  SystemMetrics as MonitoringSystemMetrics,
  BatchStats,
  ProcessorMetrics,
  MonitoringHealth,
  DetailedStats as MonitoringDetailedStats,
  QueueAlert as MonitoringQueueAlert,
} from './monitoring/monitoring-api';

// Users (export User type with alias)
export { UserApiService } from './users/user-api';
export type {
  User as UserApiUser,
  UpdateUserData,
  UpdateRoleData,
  UserResponse,
  AvailableRoles,
} from './users/user-api';

// API Keys
export * from './api-keys/api-key-api';

// Cron Jobs
export * from './cron-jobs/cron-jobs-api';

// Endpoints
export * from './endpoints/endpoints-api';

// Errors
export * from './errors/errors-api';

// Logs
export * from './logs/logs-api';

// Performance (export with aliases to avoid conflicts)
export { PerformanceApiService } from './performance/performance-api';
export type {
  PerformanceMetrics as PerformanceApiMetrics,
  PerformanceAlert as PerformanceApiAlert,
} from './performance/performance-api';

// Queue (export with aliases to avoid conflicts)
export { QueueApiService } from './queue/queue-api';
export type {
  QueueHealth,
  QueueInfo,
  QueueMetrics,
  PerformanceMetrics as QueuePerformanceMetrics,
  QueueAlert as QueueApiAlert,
  DetailedStats as QueueDetailedStats,
  Job,
  JobResponse,
  JobFilters,
} from './queue/queue-api';

// Reports
export * from './reports/reports-api';

// Settings
export * from './settings/settings-api';

// Export
export * from './export/export-api';

