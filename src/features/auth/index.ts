// Barrel exports for auth feature
export { AuthGuard } from './components/auth-guard';
export { RequireRole } from './components/require-role';
export { RoleGuard } from './components/role-guard';
export { useAuthStore } from './stores/auth-store';
export type { User, LoginCredentials, LoginResponse } from './types/auth.types';

