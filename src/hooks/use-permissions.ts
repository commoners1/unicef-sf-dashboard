import { useAuthStore } from '@/features/auth';

export interface Permission {
  action: string;
  resource: string;
}

export const PERMISSIONS = {
  // API Management
  VIEW_API: { action: 'read', resource: 'api' },
  MANAGE_API: { action: 'manage', resource: 'api' },
  CONFIGURE_API: { action: 'configure', resource: 'api' },
  
  // Audit & Logs
  VIEW_AUDIT_LOGS: { action: 'read', resource: 'audit_logs' },
  VIEW_SALESFORCE_RESPONSE: { action: 'read', resource: 'salesforce_response' },
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
  // SUPER_ADMIN: Full access to everything (all permissions)
  // In production mode, SUPER_ADMIN always has access to all menus
  SUPER_ADMIN: Object.values(PERMISSIONS),
  
  // ADMIN: Comprehensive access with management capabilities
  // RECOMMENDATION: ADMIN has full access to all permissions (same as SUPER_ADMIN)
  // This allows ADMIN to manage users, API keys, queues, cron jobs, and system settings
  // Alternative: If you want to restrict ADMIN, you can remove MANAGE_SYSTEM:
  // ADMIN: Object.values(PERMISSIONS).filter(p => p.resource !== 'system' || p.action !== 'manage'),
  ADMIN: Object.values(PERMISSIONS),
  // Legacy lowercase role support
  admin: Object.values(PERMISSIONS),
  
  // USER: Access to Overview, Queue Management, Analytics, and Reports sections
  USER: [
    PERMISSIONS.VIEW_QUEUE_STATUS,
    // PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_SALESFORCE_RESPONSE,
    // PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  // Legacy lowercase role support
  user: [
    PERMISSIONS.VIEW_QUEUE_STATUS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_SALESFORCE_RESPONSE,
    // PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  
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
  
  // Check if user is SUPER_ADMIN (uppercase or lowercase)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin';
  
  // Only allow full access if:
  // 1. User is SUPER_ADMIN (in any mode), OR
  // 2. No user is logged in AND in development mode (for testing without auth)
  // In production, only SUPER_ADMIN has full access
  // In development, if a user is logged in, respect their role permissions
  const isDevelopmentMode = import.meta.env.DEV;
  const hasFullAccess = (!user && isDevelopmentMode) || isSuperAdmin;

  const hasPermission = (permission: Permission): boolean => {
    // SUPER_ADMIN in production has full access to all permissions
    if (hasFullAccess) return true;
    
    if (!user) return false;
    
    // Normalize role to handle both uppercase and lowercase
    const normalizedRole = user.role?.toUpperCase() === 'SUPER_ADMIN' 
      ? 'SUPER_ADMIN' 
      : user.role?.toUpperCase() === 'ADMIN'
      ? 'ADMIN'
      : user.role?.toUpperCase() === 'USER'
      ? 'USER'
      : user.role?.toLowerCase();
    
    const userPermissions = ROLE_PERMISSIONS[normalizedRole as keyof typeof ROLE_PERMISSIONS] || [];
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
    isSuperAdmin: isSuperAdmin,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'admin',
    isUser: user?.role === 'USER' || user?.role === 'user',
    isOperator: user?.role === 'operator',
    isViewer: user?.role === 'viewer',
  };
}
