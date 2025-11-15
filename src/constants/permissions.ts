/**
 * Application permission and role constants
 */

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Role-based access control configurations
 */
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    'view:overview',
    'view:dashboard',
    'view:metrics',
    'view:api-keys',
    'view:endpoints',
    'view:usage',
  ],
  [ROLES.ADMIN]: [
    'view:overview',
    'view:dashboard',
    'view:metrics',
    'view:api-keys',
    'view:endpoints',
    'view:usage',
    'view:users',
    'view:permissions',
    'view:queue',
    'view:jobs',
    'view:monitoring',
    'view:logs',
    'view:audit-logs',
    'view:cron-jobs',
    'view:errors',
    'view:performance',
    'view:reports',
    'view:settings',
    'view:notifications',
    'manage:users',
    'manage:permissions',
    'manage:api-keys',
  ],
  [ROLES.SUPER_ADMIN]: [
    'view:*',
    'manage:*',
  ],
} as const;

/**
 * Helper function to check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  const permissionArray = permissions as readonly string[];
  return permissionArray.includes(permission) || permissionArray.includes('*');
}

/**
 * Helper function to check if a role is in allowed roles array
 */
export function isRoleAllowed(userRole: Role | null, allowedRoles: readonly Role[] | Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Common role arrays for route protection
 */
export const ADMIN_ROLES: readonly Role[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

