import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { BadgeProps } from '@/components/ui/badge';

export interface StatusClassification {
  label: string;
  variant: BadgeProps['variant'];
  icon: React.ReactNode;
}

/**
 * Classifies HTTP status codes into categories with appropriate labels, variants, and icons
 */
export function getStatusClassification(statusCode: number): StatusClassification {
  if (statusCode >= 200 && statusCode < 300) {
    return {
      label: 'Success',
      variant: 'default',
      icon: <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    };
  } else if (statusCode >= 300 && statusCode < 400) {
    return {
      label: 'Redirect',
      variant: 'outline',
      icon: <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    };
  } else if (statusCode >= 400 && statusCode < 500) {
    return {
      label: 'Client Error',
      variant: 'secondary',
      icon: <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
    };
  } else if (statusCode >= 500) {
    return {
      label: 'Server Error',
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    };
  } else {
    return {
      label: 'Unknown',
      variant: 'outline',
      icon: <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    };
  }
}

/**
 * Checks if a status code falls within a specific range
 */
export function isStatusCodeInRange(statusCode: number, range: 'success' | 'client-error' | 'server-error'): boolean {
  switch (range) {
    case 'success':
      return statusCode >= 200 && statusCode < 300;
    case 'client-error':
      return statusCode >= 400 && statusCode < 500;
    case 'server-error':
      return statusCode >= 500;
    default:
      return false;
  }
}

