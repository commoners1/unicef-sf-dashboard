import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { AuthGuard, RequireRole } from '@/features/auth';
import { UsersPage, UserDetailsPage } from '@/features/users';
import { ADMIN_ROLES, ROLES } from '@/constants';
import { PageLoading } from '@/components/ui/loading';

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
const JobDetailsPage = lazy(() => import('@/pages/job-details'));
const ErrorDetailsPage = lazy(() => import('@/pages/error-details'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

const LoadingFallback = () => <PageLoading text="Loading page" subtitle="Please wait..." />;

/**
 * Wraps a lazy-loaded component with Suspense
 */
function LazyRoute({ component: Component }: { component: ComponentType }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

/**
 * Creates a protected route that requires admin roles
 */
function AdminRoute({ component: Component }: { component: ComponentType }) {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <LazyRoute component={Component} />
    </RequireRole>
  );
}

/**
 * Creates a protected route that requires SUPER_ADMIN role only
 */
function SuperAdminRoute({ component: Component }: { component: ComponentType }) {
  return (
    <RequireRole allowed={[ROLES.SUPER_ADMIN]}>
      <LazyRoute component={Component} />
    </RequireRole>
  );
}

/**
 * Route configuration type
 */
interface RouteConfig {
  path: string;
  component: ComponentType;
  requiresAdmin?: boolean;
  requiresSuperAdmin?: boolean;
}

/**
 * Creates a route from configuration
 */
function createRoute({ path, component, requiresAdmin, requiresSuperAdmin }: RouteConfig) {
  if (requiresSuperAdmin) {
    return <Route key={path} path={path} element={<SuperAdminRoute component={component} />} />;
  }
  if (requiresAdmin) {
    return <Route key={path} path={path} element={<AdminRoute component={component} />} />;
  }
  return <Route key={path} path={path} element={<LazyRoute component={component} />} />;
}

/**
 * Public routes configuration
 * Note: These paths are relative to the basename (/dashboard)
 */
const publicRoutes: RouteConfig[] = [
  { path: 'login', component: LoginPage },
  { path: 'unauthorized', component: UnauthorizedPage },
];

/**
 * Protected routes configuration (accessible to all authenticated users)
 */
const protectedRoutes: RouteConfig[] = [
  { path: 'overview', component: OverviewPage },
  { path: 'dashboard', component: DashboardPage },
  { path: 'metrics', component: MetricsPage },
  { path: 'api-keys', component: ApiKeysPage },
  { path: 'endpoints', component: EndpointsPage },
  { path: 'usage', component: UsageAnalyticsPage },
  { path: 'queue', component: QueuePageSimple },
  { path: 'jobs', component: JobsPage },
  { path: 'jobs/:id', component: JobDetailsPage },
  { path: 'monitoring', component: MonitoringPage },
  { path: 'logs', component: LogsPage },
  { path: 'audit-logs', component: AuditLogsPage },
  { path: 'salesforce-logs', component: SalesforceLogsPage },
  { path: 'cron-jobs', component: CronJobsPage },
  { path: 'performance', component: PerformancePage },
];

/**
 * Admin-only routes configuration
 */
const adminRoutes: RouteConfig[] = [
  { path: 'permissions', component: PermissionsPage, requiresAdmin: true },
  { path: 'errors', component: ErrorsPage, requiresSuperAdmin: true },
  { path: 'errors/:id', component: ErrorDetailsPage, requiresSuperAdmin: true },
  { path: 'reports', component: ReportsPage, requiresAdmin: true },
  { path: 'salesforce-response', component: SalesforceResponsePage, requiresAdmin: true },
  { path: 'settings', component: SettingsPage, requiresAdmin: true },
  { path: 'notifications', component: NotificationsPage, requiresAdmin: true },
];

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map(createRoute)}

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        {/* Root redirect */}
        <Route index element={<LazyRoute component={() => <Navigate to="overview" replace />} />} />

        {/* Protected routes (all authenticated users) */}
        {protectedRoutes.map(createRoute)}

        {/* Admin-only routes */}
        <Route
          path="users"
          element={
            <RequireRole allowed={ADMIN_ROLES}>
              <LazyRoute component={UsersPage} />
            </RequireRole>
          }
        />
        <Route
          path="users/:id"
          element={
            <RequireRole allowed={ADMIN_ROLES}>
              <LazyRoute component={UserDetailsPage} />
            </RequireRole>
          }
        />
        {adminRoutes.map(createRoute)}

        {/* 404 route */}
        <Route path="*" element={<LazyRoute component={NotFoundPage} />} />
      </Route>
    </Routes>
  );
}
