/**
 * Application route constants
 * Centralized route definitions for consistency
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',

  // Protected routes
  ROOT: '/',
  OVERVIEW: '/overview',
  DASHBOARD: '/dashboard',
  METRICS: '/metrics',
  API_KEYS: '/api-keys',
  ENDPOINTS: '/endpoints',
  USAGE_ANALYTICS: '/usage',
  USERS: '/users',
  USER_DETAILS: (id: string) => `/users/${id}`,
  PERMISSIONS: '/permissions',
  QUEUE: '/queue',
  JOBS: '/jobs',
  JOB_DETAILS: (id: string) => `/jobs/${id}`,
  MONITORING: '/monitoring',
  LOGS: '/logs',
  AUDIT_LOGS: '/audit-logs',
  SALESFORCE_LOGS: '/salesforce-logs',
  CRON_JOBS: '/cron-jobs',
  ERRORS: '/errors',
  ERROR_DETAILS: (id: string) => `/errors/${id}`,
  PERFORMANCE: '/performance',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
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
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/login': 'Login',
  '/unauthorized': 'Unauthorized',
  '/not-found': 'Not Found',
};

