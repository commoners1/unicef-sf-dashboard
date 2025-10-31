import { useAuthStore } from '@/stores/auth-store';

export interface Permission {
  action: string;
  resource: string;
}

export const PERMISSIONS = {
  // Audit & Logs
  VIEW_AUDIT_LOGS: { action: 'read', resource: 'audit_logs' },
  EXPORT_AUDIT_LOGS: { action: 'export', resource: 'audit_logs' },
  MANAGE_CRON_JOBS: { action: 'manage', resource: 'cron_jobs' },
  
  // Queue Management
  VIEW_QUEUE_STATUS: { action: 'read', resource: 'queue' },
  MANAGE_QUEUE: { action: 'manage', resource: 'queue' },
  FORCE_FLUSH_QUEUE: { action: 'force_flush', resource: 'queue' },
  
  // User Management
  VIEW_USERS: { action: 'read', resource: 'users' },
  MANAGE_USERS: { action: 'manage', resource: 'users' },
  VIEW_API_KEYS: { action: 'read', resource: 'api_keys' },
  MANAGE_API_KEYS: { action: 'manage', resource: 'api_keys' },
  
  // System
  VIEW_SYSTEM_HEALTH: { action: 'read', resource: 'system' },
  MANAGE_SYSTEM: { action: 'manage', resource: 'system' },
} as const;

export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  operator: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_AUDIT_LOGS,
    PERMISSIONS.VIEW_QUEUE_STATUS,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_API_KEYS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
  ],
  viewer: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_QUEUE_STATUS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_API_KEYS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
  ],
} as const;

export function usePermissions() {
  const { user } = useAuthStore();
  
  // Development mode: allow all permissions if no user or in development
  const isDevelopmentMode = !user || import.meta.env.DEV || user.role === 'admin';

  const hasPermission = (permission: Permission): boolean => {
    // In development mode, allow all permissions
    if (isDevelopmentMode) return true;
    
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
    return userPermissions.some(p => 
      p.action === permission.action && p.resource === permission.resource
    );
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccess = (resource: string, action: string): boolean => {
    return hasPermission({ action, resource });
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    userRole: user?.role,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
    isViewer: user?.role === 'viewer',
  };
}
