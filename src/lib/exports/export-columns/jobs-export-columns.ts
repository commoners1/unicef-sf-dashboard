import type { ExportColumn } from '@/lib/export-utils';
import type { Job } from '@/services/api/queue/queue-api';

/**
 * Designated export columns for Jobs page
 */
export const jobsExportColumns: ExportColumn<Job>[] = [
  {
    key: 'id',
    header: 'ID',
    getValue: (job) => job.id || '',
  },
  {
    key: 'name',
    header: 'Job Name',
    getValue: (job) => job.name || 'Unknown Job',
  },
  {
    key: 'queue',
    header: 'Queue',
    getValue: (job) => job.queue || '',
  },
  {
    key: 'status',
    header: 'Status',
    getValue: (job) => job.status || '',
  },
  {
    key: 'progress',
    header: 'Progress',
    getValue: (job) => job.progress || 0,
  },
  {
    key: 'attemptsMade',
    header: 'Attempts Made',
    getValue: (job) => job.attemptsMade || 0,
  },
  {
    key: 'failedReason',
    header: 'Failed Reason',
    getValue: (job) => job.failedReason || '',
  },
  {
    key: 'createdAt',
    header: 'Created At',
    getValue: (job) => job.createdAt ? new Date(job.createdAt).toISOString() : '',
  },
  {
    key: 'processedOn',
    header: 'Processed On',
    getValue: (job) => job.processedOn ? new Date(job.processedOn).toISOString() : '',
  },
  {
    key: 'finishedOn',
    header: 'Finished On',
    getValue: (job) => job.finishedOn ? new Date(job.finishedOn).toISOString() : '',
  },
];

