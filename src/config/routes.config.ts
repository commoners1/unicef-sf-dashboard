/**
 * Centralized Route Configuration
 * 
 * All route paths are defined here for easy maintenance.
 * Change VITE_ROUTER_BASENAME in .env to change the base path.
 * 
 * Examples:
 * - VITE_ROUTER_BASENAME=/dashboard -> /dashboard/login
 * - VITE_ROUTER_BASENAME=/admin -> /admin/login
 * - VITE_ROUTER_BASENAME= -> /login (no basename)
 */

// Get basename from environment variable, default to /dashboard
export const ROUTER_BASENAME = import.meta.env.VITE_ROUTER_BASENAME || '/dashboard';

/**
 * Route paths (relative to basename)
 */
export const ROUTE_PATHS = {
  // Public routes
  LOGIN: 'login',
  UNAUTHORIZED: 'unauthorized',
  
  // Protected routes
  ROOT: '',
  OVERVIEW: 'overview',
  DASHBOARD: 'dashboard',
  METRICS: 'metrics',
  API_KEYS: 'api-keys',
  ENDPOINTS: 'endpoints',
  USAGE_ANALYTICS: 'usage',
  USERS: 'users',
  USER_DETAILS: (id: string) => `users/${id}`,
  PERMISSIONS: 'permissions',
  QUEUE: 'queue',
  JOBS: 'jobs',
  JOB_DETAILS: (id: string) => `jobs/${id}`,
  MONITORING: 'monitoring',
  LOGS: 'logs',
  AUDIT_LOGS: 'audit-logs',
  SALESFORCE_LOGS: 'salesforce-logs',
  CRON_JOBS: 'cron-jobs',
  ERRORS: 'errors',
  ERROR_DETAILS: (id: string) => `errors/${id}`,
  PERFORMANCE: 'performance',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  SALESFORCE_RESPONSE: 'salesforce-response',
} as const;

/**
 * Get full path with basename
 * @param path - Route path (relative to basename)
 * @returns Full path including basename
 */
export function getFullPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Handle empty basename
  if (!ROUTER_BASENAME || ROUTER_BASENAME === '/') {
    return `/${cleanPath}`;
  }
  
  // Ensure basename doesn't have trailing slash
  const cleanBasename = ROUTER_BASENAME.endsWith('/') 
    ? ROUTER_BASENAME.slice(0, -1) 
    : ROUTER_BASENAME;
  
  return `${cleanBasename}/${cleanPath}`;
}

/**
 * Get login URL (used for redirects)
 */
export function getLoginUrl(): string {
  return getFullPath(ROUTE_PATHS.LOGIN);
}

/**
 * Get unauthorized URL
 */
export function getUnauthorizedUrl(): string {
  return getFullPath(ROUTE_PATHS.UNAUTHORIZED);
}

/**
 * Check if current path is a public route (login/unauthorized)
 */
export function isPublicRoute(pathname: string): boolean {
  const loginPath = getFullPath(ROUTE_PATHS.LOGIN);
  const unauthorizedPath = getFullPath(ROUTE_PATHS.UNAUTHORIZED);
  
  return pathname === loginPath || 
         pathname === unauthorizedPath ||
         pathname.includes('/login') || 
         pathname.includes('/unauthorized');
}

/**
 * Route to page title mapping
 * Uses full paths to handle basename correctly
 */
export const ROUTE_TITLES: Record<string, string> = {
  [getFullPath(ROUTE_PATHS.ROOT)]: 'Overview',
  [getFullPath(ROUTE_PATHS.OVERVIEW)]: 'Overview',
  [getFullPath(ROUTE_PATHS.DASHBOARD)]: 'Dashboard',
  [getFullPath(ROUTE_PATHS.METRICS)]: 'Key Metrics',
  [getFullPath(ROUTE_PATHS.API_KEYS)]: 'API Keys',
  [getFullPath(ROUTE_PATHS.ENDPOINTS)]: 'Endpoints',
  [getFullPath(ROUTE_PATHS.USAGE_ANALYTICS)]: 'Usage Analytics',
  [getFullPath(ROUTE_PATHS.USERS)]: 'Users',
  [getFullPath(ROUTE_PATHS.PERMISSIONS)]: 'Permissions',
  [getFullPath(ROUTE_PATHS.QUEUE)]: 'Queue Management',
  [getFullPath(ROUTE_PATHS.JOBS)]: 'Job Details',
  [getFullPath(ROUTE_PATHS.MONITORING)]: 'Real-time Monitor',
  [getFullPath(ROUTE_PATHS.LOGS)]: 'Live Logs',
  [getFullPath(ROUTE_PATHS.AUDIT_LOGS)]: 'Audit Trail',
  [getFullPath(ROUTE_PATHS.SALESFORCE_LOGS)]: 'Salesforce Logs',
  [getFullPath(ROUTE_PATHS.CRON_JOBS)]: 'Cron Jobs',
  [getFullPath(ROUTE_PATHS.ERRORS)]: 'Error Tracking',
  [getFullPath(ROUTE_PATHS.PERFORMANCE)]: 'Performance',
  [getFullPath(ROUTE_PATHS.REPORTS)]: 'Reports',
  [getFullPath(ROUTE_PATHS.SALESFORCE_RESPONSE)]: 'Salesforce Response',
  [getFullPath(ROUTE_PATHS.SETTINGS)]: 'Settings',
  [getFullPath(ROUTE_PATHS.NOTIFICATIONS)]: 'Notifications',
  [getFullPath(ROUTE_PATHS.LOGIN)]: 'Login',
  [getFullPath(ROUTE_PATHS.UNAUTHORIZED)]: 'Unauthorized',
  '*': 'Not Found',
};

