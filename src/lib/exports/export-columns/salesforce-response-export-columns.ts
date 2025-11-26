import type { ExportColumn } from '@/lib/export-utils';
import type { AuditLog } from '@/types/audit';

/**
 * Designated export columns for Salesforce Response page
 * These columns are used for export and can differ from table display columns
 */
export const salesforceResponseExportColumns: ExportColumn<AuditLog>[] = [
  {
    key: 'id',
    header: 'ID',
    getValue: (log) => log.id || '',
  },
  {
    key: 'user',
    header: 'User',
    getValue: (log) => log.user?.name || 'System',
  },
  {
    key: 'action',
    header: 'Action',
    getValue: (log) => log.action || '',
  },
  {
    key: 'method',
    header: 'Method',
    getValue: (log) => log.method || '',
  },
  {
    key: 'endpoint',
    header: 'Endpoint',
    getValue: (log) => log.endpoint || '',
  },
  {
    key: 'statusCode',
    header: 'Status Code',
    getValue: (log) => log.statusCode || '',
  },
  {
    key: 'ipAddress',
    header: 'IP Address',
    getValue: (log) => log.ipAddress || '',
  },
  {
    key: 'createdAt',
    header: 'Created At',
    getValue: (log) => log.createdAt ? new Date(log.createdAt).toISOString() : '',
  },
  {
    key: 'type',
    header: 'Type',
    getValue: (log) => log.type || '',
  },
  {
    key: 'referenceId',
    header: 'Reference ID',
    getValue: (log) => log.referenceId || '',
  },
  {
    key: 'salesforceId',
    header: 'Salesforce ID',
    getValue: (log) => log.salesforceId || '',
  },
  {
    key: 'statusMessage',
    header: 'Status Message',
    getValue: (log) => log.statusMessage || '',
  },
];

