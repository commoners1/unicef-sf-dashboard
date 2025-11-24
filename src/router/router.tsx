import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, RequireRole } from '@/features/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { PageLoading } from '@/components/ui/loading';
import { ADMIN_ROLES, ROLES } from '@/constants';
import { ROUTE_PATHS } from '@/config/routes.config';
import { adminRoutes, protectedRoutes, publicRoutes, NotFoundPage, type RouteConfig } from './routes';

const LoadingFallback = () => (
  <PageLoading text="Loading page" subtitle="Please wait..." />
);

const RouteElement = ({ component: Component, requiresAdmin, requiresSuperAdmin }: RouteConfig) => {
  let element = (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  if (requiresSuperAdmin) {
    element = <RequireRole allowed={[ROLES.SUPER_ADMIN]}>{element}</RequireRole>;
  } else if (requiresAdmin) {
    element = <RequireRole allowed={ADMIN_ROLES}>{element}</RequireRole>;
  }

  return element;
};

const createRoute = (config: RouteConfig) => (
  <Route key={config.path} path={config.path} element={<RouteElement {...config} />} />
);

export function AppRouter() {
  return (
    <Routes>
      {publicRoutes.map(createRoute)}

      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to={ROUTE_PATHS.OVERVIEW} replace />} />
        {protectedRoutes.map(createRoute)}
        {adminRoutes.map(createRoute)}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}