import type { AuditLog } from '@/types/audit';

export type ResponseTypeFilter = 'all' | 'monthly' | 'oneoff' | 'payment-link' | 'charge';
export type EndpointStatusFilter = 'all' | 'success' | 'client-error' | 'server-error';

/**
 * Filters logs by response type
 */
export function filterByResponseType(logs: AuditLog[], filter: ResponseTypeFilter): AuditLog[] {
  if (filter === 'all') {
    return logs;
  }

  return logs.filter(log => {
    const type = log.type?.toLowerCase();
    switch (filter) {
      case 'monthly':
        return type === 'post-monthly' || type === 'pledge';
      case 'oneoff':
        return type === 'post-oneoff' || type === 'oneoff';
      case 'payment-link':
        return type === 'payment-link';
      case 'charge':
        return type === 'charge';
      default:
        return true;
    }
  });
}

/**
 * Filters logs by endpoint status code range
 */
export function filterByEndpointStatus(logs: AuditLog[], filter: EndpointStatusFilter): AuditLog[] {
  if (filter === 'all') {
    return logs;
  }

  return logs.filter(log => {
    switch (filter) {
      case 'success':
        return log.statusCode >= 200 && log.statusCode < 300;
      case 'client-error':
        return log.statusCode >= 400 && log.statusCode < 500;
      case 'server-error':
        return log.statusCode >= 500;
      default:
        return true;
    }
  });
}

/**
 * Applies multiple client-side filters to logs
 */
export function applyClientSideFilters(
  logs: AuditLog[],
  options: {
    responseType?: ResponseTypeFilter;
    endpointStatus?: EndpointStatusFilter;
  }
): AuditLog[] {
  let filtered = [...logs];

  if (options.responseType) {
    filtered = filterByResponseType(filtered, options.responseType);
  }

  if (options.endpointStatus) {
    filtered = filterByEndpointStatus(filtered, options.endpointStatus);
  }

  return filtered;
}

