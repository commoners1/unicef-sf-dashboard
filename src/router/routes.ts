import { lazy, type ComponentType } from 'react';
import { ROUTE_PATHS } from '@/config/routes.config';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  requiresAdmin?: boolean;
  requiresSuperAdmin?: boolean;
}

// Lazy load pages
const OverviewPage = lazy(() => import('@/pages/overview'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const MetricsPage = lazy(() => import('@/pages/metrics'));
const ApiKeysPage = lazy(() => import('@/pages/api-keys'));
const EndpointsPage = lazy(() => import('@/pages/endpoints'));
const UsageAnalyticsPage = lazy(() => import('@/pages/usage-analytics'));
const PermissionsPage = lazy(() => import('@/pages/permissions'));
const QueuePageSimple = lazy(() => import('@/pages/queue-simple'));
const JobsPage = lazy(() => import('@/pages/jobs'));
const MonitoringPage = lazy(() => import('@/pages/monitoring'));
const LogsPage = lazy(() => import('@/pages/logs'));
const AuditLogsPage = lazy(() => import('@/pages/audit-logs'));
const SalesforceLogsPage = lazy(() => import('@/pages/salesforce-logs'));
const SalesforceResponsePage = lazy(() => import('@/pages/salesforce-response'));
const CronJobsPage = lazy(() => import('@/pages/cron-jobs'));
const ErrorsPage = lazy(() => import('@/pages/errors'));
const PerformancePage = lazy(() => import('@/pages/performance'));
const ReportsPage = lazy(() => import('@/pages/reports'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const NotificationsPage = lazy(() => import('@/pages/notifications'));
const LoginPage = lazy(() => import('@/pages/login'));
const UnauthorizedPage = lazy(() => import('@/pages/unauthorized'));
const UsersPage = lazy(() => import('@/features/users').then(m => ({ default: m.UsersPage })));
const UserDetailsPage = lazy(() => import('@/features/users').then(m => ({ default: m.UserDetailsPage })));
const JobDetailsPage = lazy(() => import('@/pages/job-details'));
const ErrorDetailsPage = lazy(() => import('@/pages/error-details'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

/**
 * Public routes configuration
 */
export const publicRoutes: RouteConfig[] = [
  { path: ROUTE_PATHS.LOGIN, component: LoginPage },
  { path: ROUTE_PATHS.UNAUTHORIZED, component: UnauthorizedPage },
];

/**
 * Protected routes configuration (accessible to all authenticated users)
 */
export const protectedRoutes: RouteConfig[] = [
  { path: ROUTE_PATHS.OVERVIEW, component: OverviewPage },
  { path: ROUTE_PATHS.DASHBOARD, component: DashboardPage },
  { path: ROUTE_PATHS.METRICS, component: MetricsPage },
  { path: ROUTE_PATHS.API_KEYS, component: ApiKeysPage },
  { path: ROUTE_PATHS.ENDPOINTS, component: EndpointsPage },
  { path: ROUTE_PATHS.USAGE_ANALYTICS, component: UsageAnalyticsPage },
  { path: ROUTE_PATHS.QUEUE, component: QueuePageSimple },
  { path: ROUTE_PATHS.JOBS, component: JobsPage },
  { path: `${ROUTE_PATHS.JOBS}/:id`, component: JobDetailsPage },
  { path: ROUTE_PATHS.MONITORING, component: MonitoringPage },
  { path: ROUTE_PATHS.LOGS, component: LogsPage },
  { path: ROUTE_PATHS.AUDIT_LOGS, component: AuditLogsPage },
  { path: ROUTE_PATHS.SALESFORCE_LOGS, component: SalesforceLogsPage },
  { path: ROUTE_PATHS.SALESFORCE_RESPONSE, component: SalesforceResponsePage },
  { path: ROUTE_PATHS.CRON_JOBS, component: CronJobsPage },
  { path: ROUTE_PATHS.PERFORMANCE, component: PerformancePage },
];

/**
 * Admin-only routes configuration
 */
export const adminRoutes: RouteConfig[] = [
  { path: ROUTE_PATHS.USERS, component: UsersPage, requiresAdmin: true },
  { path: `${ROUTE_PATHS.USERS}/:id`, component: UserDetailsPage, requiresAdmin: true },
  { path: ROUTE_PATHS.PERMISSIONS, component: PermissionsPage, requiresAdmin: true },
  { path: ROUTE_PATHS.ERRORS, component: ErrorsPage, requiresSuperAdmin: true },
  { path: `${ROUTE_PATHS.ERRORS}/:id`, component: ErrorDetailsPage, requiresSuperAdmin: true },
  { path: ROUTE_PATHS.REPORTS, component: ReportsPage, requiresAdmin: true },
  { path: ROUTE_PATHS.SETTINGS, component: SettingsPage, requiresAdmin: true },
  { path: ROUTE_PATHS.NOTIFICATIONS, component: NotificationsPage, requiresAdmin: true },
];

export { NotFoundPage };
