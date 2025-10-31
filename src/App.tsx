import { lazy, Suspense } from 'react';
import { MainLayout } from './components/layout/main-layout';
import { AuthGuard } from './components/auth/auth-guard';
import { RequireRole } from './components/auth/require-role';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const OverviewPage = lazy(() => import('./pages/overview'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const MetricsPage = lazy(() => import('./pages/metrics'));
const ApiKeysPage = lazy(() => import('./pages/api-keys'));
const EndpointsPage = lazy(() => import('./pages/endpoints'));
const UsageAnalyticsPage = lazy(() => import('./pages/usage-analytics'));
const UsersPage = lazy(() => import('./pages/users'));
const PermissionsPage = lazy(() => import('./pages/permissions'));
const QueuePageSimple = lazy(() => import('./pages/queue-simple'));
const JobsPage = lazy(() => import('./pages/jobs'));
const MonitoringPage = lazy(() => import('./pages/monitoring'));
const LogsPage = lazy(() => import('./pages/logs'));
const AuditLogsPage = lazy(() => import('./pages/audit-logs'));
const CronJobsPage = lazy(() => import('./pages/cron-jobs'));
const ErrorsPage = lazy(() => import('./pages/errors'));
const PerformancePage = lazy(() => import('./pages/performance'));
const ReportsPage = lazy(() => import('./pages/reports'));
const SettingsPage = lazy(() => import('./pages/settings'));
const NotificationsPage = lazy(() => import('./pages/notifications'));
const LoginPage = lazy(() => import('./pages/login'));
const UnauthorizedPage = lazy(() => import('./pages/unauthorized'));
const UserDetailsPage = lazy(() => import('./pages/user-details'));
const JobDetailsPage = lazy(() => import('./pages/job-details'));
const ErrorDetailsPage = lazy(() => import('./pages/error-details'));
const NotFoundPage = lazy(() => import('./pages/not-found'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            {/* All children below rendered via <Outlet /> in MainLayout */}
            <Route
              index
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <Navigate to="overview" />
                </Suspense>
              }
            />
            <Route
              path="overview"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <OverviewPage />
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="metrics"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <MetricsPage />
                </Suspense>
              }
            />
            <Route
              path="api-keys"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <ApiKeysPage />
                </Suspense>
              }
            />
            <Route
              path="endpoints"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <EndpointsPage />
                </Suspense>
              }
            />
            <Route
              path="usage"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <UsageAnalyticsPage />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <UsersPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="users/:id"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <UserDetailsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="permissions"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <PermissionsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="queue"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <QueuePageSimple />
                </Suspense>
              }
            />
            <Route
              path="jobs"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <JobsPage />
                </Suspense>
              }
            />
            <Route
              path="jobs/:id"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <JobDetailsPage />
                </Suspense>
              }
            />
            <Route
              path="monitoring"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <MonitoringPage />
                </Suspense>
              }
            />
            <Route
              path="logs"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <LogsPage />
                </Suspense>
              }
            />
            <Route
              path="audit-logs"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <AuditLogsPage />
                </Suspense>
              }
            />
            <Route
              path="cron-jobs"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <CronJobsPage />
                </Suspense>
              }
            />
            <Route
              path="errors"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <ErrorsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="errors/:id"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <ErrorDetailsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="performance"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <PerformancePage />
                </Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <ReportsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="settings"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <SettingsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="notifications"
              element={
                <RequireRole allowed={["ADMIN", "SUPER_ADMIN"]}>
                  <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                    <NotificationsPage />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<div className="text-center m-8">Loading...</div>}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;