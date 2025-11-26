// Audit Log Types based on Prisma schema
export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  apiKeyId?: string;
  apiKey?: {
    name: string;
    description?: string;
  };
  action: string;
  endpoint: string;
  method: string;
  type?: string;
  referenceId?: string;
  salesforceId?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  statusCode: number;
  statusMessage?: string;
  ipAddress: string;
  userAgent?: string;
  duration?: number;
  isDelivered: boolean;
  createdAt: string;
}

import type { ColumnFilters } from './column-filters';

export interface AuditLogFilters {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting (dynamic, not hardcoded)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Standard filters
  userId?: string;
  apiKeyId?: string;
  action?: string;
  method?: string;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  isDelivered?: boolean;
  
  // Dynamic column filters for server-side filtering
  columnFilters?: ColumnFilters;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuditLogStats {
  today: number;
  week: number;
  total: number;
  byStatus: {
    success: number;
    error: number;
    warning: number;
  };
  byAction: Record<string, number>;
  byMethod: Record<string, number>;
}

export interface AuditLogExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters: AuditLogFilters;
  fields?: string[]; // Optional - not all export endpoints support field selection
}
