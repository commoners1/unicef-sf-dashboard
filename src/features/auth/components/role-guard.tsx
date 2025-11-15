import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/auth-store';
import UnauthorizedPage from '@/pages/unauthorized';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user) {
    return fallback || <UnauthorizedPage />;
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || <UnauthorizedPage />;
  }

  return <>{children}</>;
}

