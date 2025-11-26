import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { PageLoading } from '@/components/ui/loading';
import { usePaginatedFetch } from '@/hooks';
import { QueueApiService, type Job, type JobFilters } from '@/services/api/queue/queue-api';
import { getApiErrorMessage, downloadJSON } from '@/lib/utils';
import { handleExport as handleExportUtil } from '@/lib/exports/export-handler';
import { jobsExportColumns } from '@/lib/exports/export-columns/jobs-export-columns';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { startOfDay, isAfter, isBefore } from 'date-fns';
import { formatGMT7, formatGMT7Date, convertDateFilterToUTC, convertEndDateFilterToUTC } from '@/lib/utils/timezone.util';
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
  // Error state
  const [actionError, setActionError] = useState<string | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  // Filter state
  const [jobNameFilter, setJobNameFilter] = useState<string>('');
  const [queueFilter, setQueueFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const buildFilters = useCallback((): JobFilters => {
    const newFilters: JobFilters = {};
    
    // Job Name filter (using search)
    if (jobNameFilter && jobNameFilter.trim() !== '') {
      newFilters.search = jobNameFilter.trim();
    }

    // Queue filter
    if (queueFilter && queueFilter !== 'all') {
      newFilters.queue = queueFilter;
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      newFilters.status = statusFilter;
    }

    // Date filter
    if (startDate) {
      // Convert GMT+7 date to UTC for backend
      newFilters.startDate = convertDateFilterToUTC(startDate);
    }
    if (endDate) {
      // Convert GMT+7 end date to UTC (inclusive of full day)
      newFilters.endDate = convertEndDateFilterToUTC(endDate);
    }

    return newFilters;
  }, [jobNameFilter, queueFilter, statusFilter, startDate, endDate]);

  // Use the new paginated fetch hook
  const {
    data: jobs,
    loading,
    error: fetchError,
    pagination,
    filters,
    setFilters: setBaseFilters,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = usePaginatedFetch<Job>({
    fetchFn: useCallback(async (filters) => {
      const dateFilters = buildFilters();
      return QueueApiService.getJobs({
        ...filters,
        ...dateFilters,
      });
    }, [buildFilters]),
    initialFilters: {} as JobFilters,
    initialPageSize: 10,
    autoFetch: true,
    dataKey: 'data',
  });

  useEffect(() => {
    handleRefresh();
  }, [startDate, endDate, jobNameFilter, queueFilter, statusFilter]);

  const handleView = (_job: Job) => {
    // TODO: Open job details modal
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
        return;
      }

      setExporting(true);
      setExportProgress(null);

      const dateFilters = buildFilters();
      const serverFilters = includeFilters 
        ? {
            ...filters,
            ...dateFilters,
          }
        : {};

      await handleExportUtil({
        fetchFn: QueueApiService.getJobs,
        dataKey: 'data',
        exportColumns: jobsExportColumns,
        cleanFilters: cleanJobFilters,
        filenamePrefix: 'jobs',
        includeFilters,
        serverFilters,
        onProgress: (progress) => setExportProgress(progress),
        onError: (error) => setActionError(getApiErrorMessage(error)),
      });
    } catch (err) {
      // Error already handled by onError callback
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const clearFilters = useCallback(() => {
    setJobNameFilter('');
    setQueueFilter('all');
    setStatusFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setBaseFilters({});
  }, [setBaseFilters]);

  // Check if custom filters are active
  const hasCustomFiltersActive = jobNameFilter.trim() !== '' || 
                                  queueFilter !== 'all' || 
                                  statusFilter !== 'all' || 
                                  startDate !== undefined || 
                                  endDate !== undefined;

  // Handle filter change
  const handleFilterChange = (newFilters: JobFilters) => {
    const isEmpty = Object.keys(newFilters).length === 0 || 
                    Object.values(newFilters).every(v => v === undefined || v === '' || v === null || (typeof v === 'object' && Object.keys(v).length === 0));
    if (isEmpty) {
      clearFilters();
    } else {
      setBaseFilters(newFilters);
    }
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setJobNameFilter(searchTerm);
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
          <div className="text-left">
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
            {formatGMT7(createdAt)}
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
              <Button size="sm" disabled={loading || exporting} className="flex-1 sm:flex-initial min-w-[100px]">
                {exporting ? (
                  <RefreshCw className={`mr-1.5 sm:mr-2 h-4 w-4 animate-spin`} />
                ) : (
                  <Download className="mr-1.5 sm:mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
                <span className="sm:hidden">{exporting ? '...' : 'Export'}</span>
                {!exporting && <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport(undefined, false)} disabled={loading || exporting}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(undefined, true)} disabled={loading || exporting}>
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

      {/* Export Progress Indicator */}
      {exporting && exportProgress && (
        <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Exporting data...</span>
            <span className="text-muted-foreground">
              {exportProgress.current} / {exportProgress.total}
            </span>
          </div>
          <Progress 
            value={(exportProgress.current / exportProgress.total) * 100} 
            className="h-2" 
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(pagination.total).toLocaleString('id-ID')}</div>
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
              {jobs.filter(j => (j.status || 'unknown') === 'completed').length.toLocaleString('id-ID')}
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
              {jobs.filter(j => (j.status || 'unknown') === 'active').length.toLocaleString('id-ID')}
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
              {jobs.filter(j => (j.status || 'unknown') === 'failed').length.toLocaleString('id-ID')}
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
        onSort={(field, direction) => {
          const newFilters = { ...filters, sortBy: field, sortOrder: direction };
          setBaseFilters(newFilters as JobFilters);
        }}
        onFilter={handleFilterChange}
        onSearch={handleSearch}
        searchValue={jobNameFilter}
        searchPlaceholder="Search jobs by name..."
        actions={{
          view: handleView,
        }}
        rowKey="id"
        emptyMessage="No jobs found"
        showSelectionFilters={true}
        showSearchFilter={false}
        hasCustomFiltersActive={hasCustomFiltersActive}
        customFilters={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Job Name Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Job Name</label>
              <Input
                type="text"
                value={jobNameFilter}
                onChange={(e) => setJobNameFilter(e.target.value)}
                placeholder="Filter by Job Name"
                className="w-full"
              />
            </div>

            {/* Queue Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Queue</label>
              <Select value={queueFilter} onValueChange={setQueueFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select queue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="salesforce">Salesforce</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="notifications">Notifications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatGMT7Date(startDate) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateRangeChange(date, endDate)}
                    disabled={(date) => isAfter(startOfDay(date), startOfDay(new Date()))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatGMT7Date(endDate) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateRangeChange(startDate, date)}
                    disabled={(date) => {
                      const today = startOfDay(new Date());
                      const selectedDate = startOfDay(date);
                      if (isAfter(selectedDate, today)) return true;
                      if (startDate && isBefore(selectedDate, startOfDay(startDate))) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        }
      />
    </div>
  );
}