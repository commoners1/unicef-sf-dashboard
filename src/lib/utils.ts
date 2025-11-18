import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate success rate percentage safely (handles division by zero)
 * @param success - Number of successful requests
 * @param error - Number of failed requests
 * @returns Success rate as a number (0-100), or 0 if total is 0
 */
export function calculateSuccessRate(success: number, error: number): number {
  const total = success + error;
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
}

/**
 * Converts role names from underscore format to readable text
 * Examples: SUPER_ADMIN -> "Super Admin", USER -> "User", ADMIN -> "Admin"
 * @param role - Role name in underscore format (e.g., "SUPER_ADMIN")
 * @returns Formatted role name (e.g., "Super Admin")
 */
export function formatRoleName(role: string | null | undefined): string {
  if (!role) return 'User';
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Re-export error handler and file utils for convenience
export { getErrorMessage, getApiErrorMessage } from './error-handler';
export { downloadBlob, downloadJSON, downloadText, formatDateForFilename } from './file-utils';