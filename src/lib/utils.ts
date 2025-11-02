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