import type { ExportColumn } from '@/lib/export-utils';
import type { Error } from '@/services/api/errors/errors-api';

/**
 * Designated export columns for Errors page
 */
export const errorsExportColumns: ExportColumn<Error>[] = [
  {
    key: 'id',
    header: 'ID',
    getValue: (error) => error.id || '',
  },
  {
    key: 'message',
    header: 'Message',
    getValue: (error) => error.message || '',
  },
  {
    key: 'type',
    header: 'Type',
    getValue: (error) => error.type || '',
  },
  {
    key: 'source',
    header: 'Source',
    getValue: (error) => error.source || '',
  },
  {
    key: 'environment',
    header: 'Environment',
    getValue: (error) => error.environment || '',
  },
  {
    key: 'resolved',
    header: 'Resolved',
    getValue: (error) => error.resolved ? 'Yes' : 'No',
  },
  {
    key: 'occurrences',
    header: 'Occurrences',
    getValue: (error) => error.occurrences || 0,
  },
  {
    key: 'firstSeen',
    header: 'First Seen',
    getValue: (error) => error.firstSeen ? new Date(error.firstSeen).toISOString() : '',
  },
  {
    key: 'lastSeen',
    header: 'Last Seen',
    getValue: (error) => error.lastSeen ? new Date(error.lastSeen).toISOString() : '',
  },
  {
    key: 'timestamp',
    header: 'Timestamp',
    getValue: (error) => error.timestamp ? new Date(error.timestamp).toISOString() : '',
  },
];

