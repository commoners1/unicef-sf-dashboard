import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';

interface RequireRoleProps {
  allowed: readonly string[] | string[];
  children: ReactNode;
}

/**
 * Component that protects routes by requiring specific user roles
 * Uses the auth store for consistent role checking
 */
export function RequireRole({ allowed, children }: RequireRoleProps) {
  const { user, isLoading } = useAuthStore();

  // Show nothing while loading to prevent flash of content
  if (isLoading) {
    return null;
  }

  // Redirect to unauthorized if user doesn't have required role
  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

