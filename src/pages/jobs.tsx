import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { QueueApiService, type Job, type JobFilters } from '@/services/api/queue/queue-api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<JobFilters>({});

  // Load data on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Load jobs from API
  const loadJobs = async (page = 1, limit = 10, newFilters: JobFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await QueueApiService.getJobs({
        page,
        limit,
        ...newFilters,
      });
      
      // Check if data is an array and has the expected structure
      if (!Array.isArray(response.data)) {
        console.error('Response data is not an array:', response.data);
      }
      
      setJobs(response.data || []);
      setPagination({
        current: Number(response.pagination.page) || 1,
        pageSize: Number(response.pagination.limit) || 10,
        total: Number(response.pagination.total) || 0,
      });
    } catch (err) {
      console.error('Error loading jobs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load jobs: ${errorMessage}`);
      setJobs([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const handleRefresh = async () => {
    await loadJobs(pagination.current, pagination.pageSize, filters);
  };

  const handleView = (_job: Job) => {
    // TODO: Open job details modal
  };

  const handleRetry = async (job: Job) => {
    try {
      await QueueApiService.retryJob(job.id);
      await loadJobs(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      console.error('Retry failed:', err);
      setError('Failed to retry job');
    }
  };

  const handleRemove = async (job: Job) => {
    try {
      await QueueApiService.removeJob(job.id);
      await loadJobs(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      console.error('Remove failed:', err);
      setError('Failed to remove job');
    }
  };

  const handleExport = async (job?: Job) => {
    try {
      if (job) {
        const data = JSON.stringify(job, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-${job.id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const blob = await QueueApiService.exportJobs(filters, 'csv');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jobs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed');
    }
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    loadJobs(page, pagination.pageSize, filters);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    loadJobs(1, pagination.pageSize, newFilters);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm };
    handleFilterChange(newFilters);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Details</h1>
            <p className="text-muted-foreground">
              Monitor and manage queue jobs and their execution status
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Job Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage queue jobs and their execution status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="flex-1 sm:flex-initial min-w-[100px]">
            <RefreshCw className={`sm:mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={() => handleExport()} className="flex-1 sm:flex-initial min-w-[100px]">
            <Download className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export All</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
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
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        onPaginationChange={handlePageChange}
        onSort={(_field, _direction) => {
          // TODO: Implement sorting
        }}
        onFilter={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Search jobs by name, type, or status..."
        actions={{
          view: handleView,
          edit: handleRetry,
          delete: handleRemove,
          export: handleExport,
        }}
        rowKey="id"
        emptyMessage="No jobs found"
        serverSidePagination={true}
      />
    </div>
  );
}