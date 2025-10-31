import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface RequireRoleProps {
  allowed: string[];
  children: ReactNode;
}

export function RequireRole({ allowed, children }: RequireRoleProps) {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Assumes JWT token in localStorage for now; adjust for your real auth system
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const [, payloadBase64] = token.split('.');
        const payload = JSON.parse(atob(payloadBase64));
        setUserRole(payload.role);
      } catch {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, []);
  // While loading role (first render), don't block
  if (userRole === null) return null;
  if (!allowed.includes(userRole)) return <Navigate to="/unauthorized" />;
  return <>{children}</>;
}
