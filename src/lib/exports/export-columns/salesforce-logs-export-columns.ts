import type { ExportColumn } from '@/lib/export-utils';
import type { AuditLog } from '@/types/audit';

/**
 * Designated export columns for Salesforce Logs page
 */
export const salesforceLogsExportColumns: ExportColumn<AuditLog>[] = [
  {
    key: 'id',
    header: 'ID',
    getValue: (log) => log.id || '',
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
    key: 'user',
    header: 'User',
    getValue: (log) => log.user?.name || 'System',
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
    key: 'duration',
    header: 'Duration (ms)',
    getValue: (log) => log.duration || '',
  },
  {
    key: 'isDelivered',
    header: 'Delivered',
    getValue: (log) => log.isDelivered ? 'Yes' : 'No',
  },
  {
    key: 'createdAt',
    header: 'Created At',
    getValue: (log) => log.createdAt ? new Date(log.createdAt).toISOString() : '',
  },
];

