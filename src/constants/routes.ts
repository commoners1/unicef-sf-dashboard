/**
 * Application route constants
 * Centralized route definitions for consistency
 * 
 * Note: These routes use the centralized route configuration
 * which respects the VITE_ROUTER_BASENAME environment variable
 */

import { ROUTE_PATHS, getFullPath } from '@/config/routes.config';

export const ROUTES = {
  // Public routes
  LOGIN: getFullPath(ROUTE_PATHS.LOGIN),
  UNAUTHORIZED: getFullPath(ROUTE_PATHS.UNAUTHORIZED),
  NOT_FOUND: '*',

  // Protected routes
  ROOT: getFullPath(ROUTE_PATHS.ROOT),
  OVERVIEW: getFullPath(ROUTE_PATHS.OVERVIEW),
  DASHBOARD: getFullPath(ROUTE_PATHS.DASHBOARD),
  METRICS: getFullPath(ROUTE_PATHS.METRICS),
  API_KEYS: getFullPath(ROUTE_PATHS.API_KEYS),
  ENDPOINTS: getFullPath(ROUTE_PATHS.ENDPOINTS),
  USAGE_ANALYTICS: getFullPath(ROUTE_PATHS.USAGE_ANALYTICS),
  USERS: getFullPath(ROUTE_PATHS.USERS),
  USER_DETAILS: (id: string) => getFullPath(ROUTE_PATHS.USER_DETAILS(id)),
  PERMISSIONS: getFullPath(ROUTE_PATHS.PERMISSIONS),
  QUEUE: getFullPath(ROUTE_PATHS.QUEUE),
  JOBS: getFullPath(ROUTE_PATHS.JOBS),
  JOB_DETAILS: (id: string) => getFullPath(ROUTE_PATHS.JOB_DETAILS(id)),
  MONITORING: getFullPath(ROUTE_PATHS.MONITORING),
  LOGS: getFullPath(ROUTE_PATHS.LOGS),
  AUDIT_LOGS: getFullPath(ROUTE_PATHS.AUDIT_LOGS),
  SALESFORCE_LOGS: getFullPath(ROUTE_PATHS.SALESFORCE_LOGS),
  CRON_JOBS: getFullPath(ROUTE_PATHS.CRON_JOBS),
  ERRORS: getFullPath(ROUTE_PATHS.ERRORS),
  ERROR_DETAILS: (id: string) => getFullPath(ROUTE_PATHS.ERROR_DETAILS(id)),
  PERFORMANCE: getFullPath(ROUTE_PATHS.PERFORMANCE),
  REPORTS: getFullPath(ROUTE_PATHS.REPORTS),
  SETTINGS: getFullPath(ROUTE_PATHS.SETTINGS),
  NOTIFICATIONS: getFullPath(ROUTE_PATHS.NOTIFICATIONS),
  SALESFORCE_RESPONSE: getFullPath(ROUTE_PATHS.SALESFORCE_RESPONSE),
} as const;

/**
 * Route to page title mapping
 */
export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/overview': 'Overview',
  '/dashboard': 'Dashboard',
  '/metrics': 'Key Metrics',
  '/api-keys': 'API Keys',
  '/endpoints': 'Endpoints',
  '/usage': 'Usage Analytics',
  '/users': 'Users',
  '/permissions': 'Permissions',
  '/queue': 'Queue Management',
  '/jobs': 'Job Details',
  '/monitoring': 'Real-time Monitor',
  '/logs': 'Live Logs',
  '/audit-logs': 'Audit Trail',
  '/salesforce-logs': 'Salesforce Logs',
  '/cron-jobs': 'Cron Jobs',
  '/errors': 'Error Tracking',
  '/performance': 'Performance',
  '/reports': 'Reports',
  '/salesforce-response': 'Salesforce Response',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/login': 'Login',
  '/unauthorized': 'Unauthorized',
  '/not-found': 'Not Found',
};

