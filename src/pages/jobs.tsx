import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { PageLoading } from '@/components/ui/loading';
import { usePaginatedFetch } from '@/hooks';
import { QueueApiService, type Job, type JobFilters } from '@/services/api/queue/queue-api';
import { getApiErrorMessage, downloadJSON, downloadBlob, formatDateForFilename } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function JobsPage() {
  const [actionError, setActionError] = useState<string | null>(null);

  // Use the new paginated fetch hook
  const {
    data: jobs,
    loading,
    error: fetchError,
    pagination,
    filters,
    setFilters,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = usePaginatedFetch<Job>({
    fetchFn: QueueApiService.getJobs,
    initialFilters: {} as JobFilters,
    initialPageSize: 10,
    autoFetch: true,
    dataKey: 'data',
  });

  const handleView = (_job: Job) => {
    // TODO: Open job details modal
  };

  const handleRetry = async (job: Job) => {
    try {
      setActionError(null);
      await QueueApiService.retryJob(job.id);
      await handleRefresh(); // Refresh the list after retry
    } catch (err) {
      console.error('Retry failed:', err);
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleRemove = async (job: Job) => {
    try {
      setActionError(null);
      await QueueApiService.removeJob(job.id);
      await handleRefresh(); // Refresh the list after removal
    } catch (err) {
      console.error('Remove failed:', err);
      setActionError(getApiErrorMessage(err));
    }
  };

  // Helper function to clean filters - remove undefined/null/empty values and pagination fields
  const cleanJobFilters = (inputFilters: JobFilters): JobFilters => {
    const cleaned: JobFilters = {};
    
    // List of valid filter fields for export (exclude pagination/sorting)
    if (inputFilters.queue && inputFilters.queue !== '') {
      cleaned.queue = inputFilters.queue;
    }
    if (inputFilters.status && inputFilters.status !== '') {
      cleaned.status = inputFilters.status;
    }
    if (inputFilters.search && inputFilters.search !== '') {
      cleaned.search = inputFilters.search;
    }
    if (inputFilters.startDate && inputFilters.startDate !== '') {
      cleaned.startDate = inputFilters.startDate;
    }
    if (inputFilters.endDate && inputFilters.endDate !== '') {
      cleaned.endDate = inputFilters.endDate;
    }
    
    return cleaned;
  };

  const handleExport = async (job?: Job, includeFilters: boolean = false) => {
    try {
      setActionError(null);
      if (job) {
        downloadJSON(job, `job-${job.id}`);
      } else {
        // If includeFilters is false, use empty filters to export all data
        // If true, clean filters to remove pagination fields and undefined values
        const exportFilters = includeFilters 
          ? cleanJobFilters(filters as JobFilters)
          : {} as JobFilters;
        
        const blob = await QueueApiService.exportJobs(exportFilters, 'xlsx');
        
        const filename = includeFilters
          ? `jobs-filtered-${formatDateForFilename()}.xlsx`
          : `jobs-all-${formatDateForFilename()}.xlsx`;
        downloadBlob(blob, filename);
      }
    } catch (err) {
      console.error('Export failed:', err);
      setActionError(getApiErrorMessage(err));
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters as JobFilters);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters as JobFilters);
  };

  const columns: Column<Job>[] = [
    {
      key: 'name',
      title: 'Job Name',
      dataIndex: 'name',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      render: (_, job) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{job.name || 'Unknown Job'}</div>
            <div className="text-xs text-muted-foreground">ID: {job.id || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'queue',
      title: 'Queue',
      dataIndex: 'queue',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      filterOptions: [
        { label: 'All Queues', value: '' },
        { label: 'Salesforce', value: 'salesforce' },
        { label: 'Email', value: 'email' },
        { label: 'Notifications', value: 'notifications' },
      ],
      render: (_, job) => (
        <Badge variant="outline" className="font-mono text-xs">
          {job.queue || 'unknown'}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      filterOptions: [
        { label: 'All Status', value: '' },
        { label: 'Completed', value: 'completed' },
        { label: 'Active', value: 'active' },
        { label: 'Failed', value: 'failed' },
        { label: 'Waiting', value: 'waiting' },
        { label: 'Delayed', value: 'delayed' },
        { label: 'Paused', value: 'paused' },
      ],
      render: (_, job) => {
        const getStatusIcon = (status: string) => {
          switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'active': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'waiting': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'delayed': return <Clock className="h-4 w-4 text-orange-500" />;
            case 'paused': return <AlertTriangle className="h-4 w-4 text-gray-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
          }
        };

        const getStatusVariant = (status: string) => {
          switch (status) {
            case 'completed': return 'default';
            case 'active': return 'secondary';
            case 'failed': return 'destructive';
            case 'waiting': return 'outline';
            case 'delayed': return 'outline';
            case 'paused': return 'outline';
            default: return 'outline';
          }
        };

        const status = job.status || 'unknown';
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <Badge variant={getStatusVariant(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'attemptsMade',
      title: 'Attempts',
      dataIndex: 'attemptsMade',
      sortable: true,
      mobilePriority: 'secondary',
      render: (_, job) => {
        const attempts = job.attemptsMade || 0;
        return (
          <div className="text-center">
            <div className="font-bold">{attempts}</div>
            {attempts > 1 && (
              <div className="text-xs text-muted-foreground">Retries</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'processedOn',
      sortable: true,
      mobilePriority: 'secondary',
      render: (_, job) => {
        const duration = job.finishedOn && job.processedOn 
          ? job.finishedOn - job.processedOn 
          : null;
        return (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">
              {duration ? `${(duration / 1000).toFixed(1)}s` : '-'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      mobilePriority: 'secondary',
      render: (_, job) => {
        const createdAt = job.createdAt || new Date().toISOString();
        return (
          <div className="text-sm">
            {new Date(createdAt).toLocaleString()}
          </div>
        );
      },
    },
  ];

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pt-6 sm:pt-0 pb-6 sm:pb-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Job Details</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor and manage queue jobs and their execution status
            </p>
          </div>
        </div>
        <PageLoading text="Loading jobs" subtitle="Fetching job information and execution status" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-0 pb-6 sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Job Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage queue jobs and their execution status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="flex-1 sm:flex-initial min-w-[100px]">
            <RefreshCw className={`mr-1.5 sm:mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={loading} className="flex-1 sm:flex-initial min-w-[100px]">
                <Download className="mr-1.5 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport(undefined, false)} disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(undefined, true)} disabled={loading}>
                <Filter className="mr-2 h-4 w-4" />
                Export Filtered
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(fetchError || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{fetchError || actionError}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              All time jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => (j.status || 'unknown') === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => (j.status || 'unknown') === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => (j.status || 'unknown') === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={jobs}
        columns={columns}
        loading={loading}
        serverSidePagination={true}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        onPaginationChange={(page, pageSize) => {
          if (pageSize && pageSize !== pagination.pageSize) {
            handlePageSizeChange(pageSize);
          } else {
            handlePageChange(page);
          }
        }}
        onSort={(_field, _direction) => {
          // TODO: Implement sorting
        }}
        onFilter={handleFilterChange}
        onSearch={handleSearch}
        searchValue={filters?.search || ''}
        searchPlaceholder="Search jobs by name, type, or status..."
        actions={{
          view: handleView,
          edit: handleRetry,
          delete: handleRemove,
          export: handleExport,
        }}
        rowKey="id"
        emptyMessage="No jobs found"
      />
    </div>
  );
}