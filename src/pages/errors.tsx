import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLoading } from '@/components/ui/loading';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { startOfDay, isAfter, isBefore } from 'date-fns';
import { formatGMT7Date, convertDateFilterToUTC, convertEndDateFilterToUTC } from '@/lib/utils/timezone.util';
import { ErrorsApiService, type Error, type ErrorFilters, type ErrorStats } from '@/services/api/errors/errors-api';
import { usePaginatedFetch, useDataFetching } from '@/hooks';
import { getApiErrorMessage, downloadJSON } from '@/lib/utils';
import { handleExport as handleExportUtil } from '@/lib/exports/export-handler';
import { errorsExportColumns } from '@/lib/exports/export-columns/errors-export-columns';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Bug, 
  XCircle, 
  RefreshCw, 
  Download,
  Clock,
  Code,
  Activity,
  Eye,
  Server,
  User,
  Hash,
  FileText,
  Globe,
  ChevronDown,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ErrorsPage() {
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const buildFilters = useCallback((): ErrorFilters => {
    const newFilters: ErrorFilters = {};
    
    // Type filter
    if (typeFilter && typeFilter !== 'all') {
      newFilters.type = typeFilter;
    }

    // Source filter
    if (sourceFilter && sourceFilter.trim() !== '') {
      newFilters.source = sourceFilter.trim();
    }

    // Environment filter
    if (environmentFilter && environmentFilter !== 'all') {
      newFilters.environment = environmentFilter;
    }

    // Resolved filter
    if (resolvedFilter && resolvedFilter !== 'all') {
      newFilters.resolved = resolvedFilter === 'resolved' ? true : false;
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
  }, [typeFilter, sourceFilter, environmentFilter, resolvedFilter, startDate, endDate]);

  // Use the new paginated fetch hook
  const {
    data: errors,
    loading,
    error: fetchError,
    pagination,
    filters,
    setFilters: setBaseFilters,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = usePaginatedFetch<Error>({
    fetchFn: useCallback(async (filters) => {
      const customFilters = buildFilters();
      return ErrorsApiService.getErrors({
        ...filters,
        ...customFilters,
      });
    }, [buildFilters]),
    initialFilters: {} as ErrorFilters,
    initialPageSize: 10,
    autoFetch: true,
    dataKey: 'data',
  });

  useEffect(() => {
    handleRefresh();
  }, [startDate, endDate, typeFilter, sourceFilter, environmentFilter, resolvedFilter]);

  // Use the new data fetching hook for stats
  const {
    data: stats,
    fetch: fetchStats,
  } = useDataFetching<ErrorStats>({
    fetchFn: ErrorsApiService.getErrorStats,
    autoFetch: true,
    onError: (err) => {
      // Don't show error for stats failure, just log it
      // Stats are not critical for the page to function
      console.error('Error loading stats:', err);
    },
  });

  // Combined refresh handler
  const handleRefreshAll = async () => {
    setActionError(null);
    await Promise.all([handleRefresh(), fetchStats()]);
  };

  const handleView = (error: Error) => {
    setSelectedError(error);
    setIsViewModalOpen(true);
  };

  // Helper function to clean filters - remove undefined/null/empty values and pagination fields
  const cleanErrorFilters = (inputFilters: ErrorFilters): ErrorFilters => {
    const cleaned: ErrorFilters = {};
    
    // List of valid filter fields for export (exclude pagination/sorting)
    if (inputFilters.type && inputFilters.type !== '') {
      cleaned.type = inputFilters.type;
    }
    if (inputFilters.source && inputFilters.source !== '') {
      cleaned.source = inputFilters.source;
    }
    if (inputFilters.environment && inputFilters.environment !== '') {
      cleaned.environment = inputFilters.environment;
    }
    if (inputFilters.resolved !== undefined && inputFilters.resolved !== null) {
      cleaned.resolved = inputFilters.resolved;
    }
    if (inputFilters.startDate && inputFilters.startDate !== '') {
      cleaned.startDate = inputFilters.startDate;
    }
    if (inputFilters.endDate && inputFilters.endDate !== '') {
      cleaned.endDate = inputFilters.endDate;
    }
    if (inputFilters.search && inputFilters.search !== '') {
      cleaned.search = inputFilters.search;
    }
    
    return cleaned;
  };

  const handleExport = async (error?: Error, includeFilters: boolean = false) => {
    try {
      setActionError(null);
      if (error) {
        downloadJSON(error, `error-${error.id}`);
        return;
      }

      setExporting(true);
      setExportProgress(null);

      const customFilters = buildFilters();
      const serverFilters = includeFilters 
        ? {
            ...filters,
            ...customFilters,
          }
        : {};

      await handleExportUtil({
        fetchFn: ErrorsApiService.getErrors,
        dataKey: 'data',
        exportColumns: errorsExportColumns,
        cleanFilters: cleanErrorFilters,
        filenamePrefix: 'errors',
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
    setTypeFilter('all');
    setSourceFilter('');
    setEnvironmentFilter('all');
    setResolvedFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setBaseFilters({});
  }, [setBaseFilters]);

  // Check if custom filters are active
  const hasCustomFiltersActive = typeFilter !== 'all' || 
                                  sourceFilter.trim() !== '' || 
                                  environmentFilter !== 'all' || 
                                  resolvedFilter !== 'all' || 
                                  startDate !== undefined || 
                                  endDate !== undefined;

  // Handle filter change
  const handleFilterChange = (newFilters: ErrorFilters) => {
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
    const newFilters = { ...filters, search: searchTerm };
    setBaseFilters(newFilters as ErrorFilters);
  };

  const columns: Column<Error>[] = [
    {
      key: 'level',
      title: 'Level',
      dataIndex: 'type',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      filterOptions: [
        { label: 'All Levels', value: '' },
        { label: 'Critical', value: 'critical' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ],
      render: (error) => {
        const getLevelVariant = (level: string) => {
          switch (level?.toLowerCase()) {
            case 'critical': return 'destructive';
            case 'error': return 'destructive';
            case 'warning': return 'secondary';
            case 'info': return 'default';
            default: return 'outline';
          }
        };
        
        // Safely handle undefined or null type
        const errorType = error.type || 'unknown';
        
        return (
          <Badge variant={getLevelVariant(errorType)} className="text-xs">
            {errorType.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'message',
      title: 'Message',
      dataIndex: 'message',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      render: (error) => (
        <div className="max-w-md min-w-0">
          <div className="font-medium truncate text-sm sm:text-base">{error.message || 'No message'}</div>
          <div className="text-xs text-muted-foreground truncate mt-1">
            {error.source || 'Unknown source'}
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      title: 'Source',
      dataIndex: 'source',
      sortable: true,
      filterable: true,
      mobilePriority: 'secondary',
      render: (error) => (
        <div className="flex items-center space-x-2 min-w-0">
          <Code className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-mono text-xs sm:text-sm truncate">{error.source || 'Unknown source'}</span>
        </div>
      ),
    },
    {
      key: 'occurrences',
      title: 'Occurrences',
      dataIndex: 'occurrences',
      sortable: true,
      mobilePriority: 'secondary',
      render: (error) => (
        <div className="text-center">
          <div className="font-bold">{error.occurrences ?? 0}</div>
          <div className="text-xs text-muted-foreground">
            {error.firstSeen ? new Date(error.firstSeen).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'resolved',
      title: 'Status',
      dataIndex: 'resolved',
      sortable: true,
      filterable: true,
      mobilePriority: 'secondary',
      filterOptions: [
        { label: 'All', value: '' },
        { label: 'Resolved', value: 'true' },
        { label: 'Unresolved', value: 'false' },
      ],
      render: (error) => (
        <Badge variant={error.resolved ? 'default' : 'destructive'}>
          {error.resolved ? 'Resolved' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'lastSeen',
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      sortable: true,
      mobilePriority: 'secondary',
      render: (error) => (
        <div className="flex items-center space-x-2 min-w-0">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">
            {error.lastSeen ? new Date(error.lastSeen).toLocaleString() : 'N/A'}
          </span>
        </div>
      ),
    },
  ];

  // Show initial loading state when page first loads
  if (loading && errors.length === 0 && !fetchError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="pt-6 sm:pt-0 pb-6 sm:pb-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage application errors and exceptions
          </p>
        </div>
        <PageLoading text="Loading errors" subtitle="Fetching error data and statistics" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-0 pb-6 sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage application errors and exceptions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={loading} className="flex-1 sm:flex-initial min-w-[100px]">
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
        <Alert variant="destructive" className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="mt-1">
            {fetchError || actionError}
          </AlertDescription>
        </Alert>
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

      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Errors</CardTitle>
              <Bug className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time errors
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Unresolved</CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-destructive">{stats.unresolved}</div>
              <p className="text-xs text-muted-foreground">
                Active issues
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Critical</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-destructive">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">
                High priority
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Today</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">
                New errors today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        data={errors}
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
        searchPlaceholder="Search errors by message, source, or level..."
        actions={{
          view: handleView,
        }}
        rowKey="id"
        emptyMessage="No errors found"
        showSelectionFilters={true}
        showSearchFilter={false}
        hasCustomFiltersActive={hasCustomFiltersActive}
        customFilters={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Source</label>
              <Input
                type="text"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                placeholder="Filter by source"
                className="w-full"
              />
            </div>

            {/* Environment Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Environment</label>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resolved Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Status</label>
              <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
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

      {/* View Error Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[85vh] w-[95vw] sm:w-full overflow-hidden flex flex-col p-0 m-0 sm:m-4">
          <DialogHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4 flex-shrink-0 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Error Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Detailed information for error entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <ScrollArea className="flex-1 overflow-y-auto min-w-0 w-full">
              <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 w-full min-w-0 box-border">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                  <Card className="w-full min-w-0 overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                        <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0 min-w-0 w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50 min-w-0 w-full">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">ID:</span>
                        <span className="font-mono text-xs sm:text-sm break-all sm:text-right flex-1 min-w-0 overflow-hidden">{selectedError.id}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Type:</span>
                        <Badge variant={selectedError.type === 'critical' || selectedError.type === 'error' ? 'destructive' : 'secondary'} className="text-xs w-fit">
                          {(selectedError.type || 'unknown').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Status:</span>
                        <Badge variant={selectedError.resolved ? 'default' : 'destructive'} className="text-xs w-fit">
                          {selectedError.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Occurrences:</span>
                        <span className="text-xs sm:text-sm font-bold">{selectedError.occurrences ?? 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full min-w-0 overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">Timing Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0 min-w-0 w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">First Seen:</span>
                        <span className="text-xs sm:text-sm break-words sm:text-right flex-1 min-w-0">
                          {selectedError.firstSeen ? new Date(selectedError.firstSeen).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">Last Seen:</span>
                        <span className="text-xs sm:text-sm break-words sm:text-right flex-1 min-w-0">
                          {selectedError.lastSeen ? new Date(selectedError.lastSeen).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">Timestamp:</span>
                        <span className="text-xs sm:text-sm break-words sm:text-right flex-1 min-w-0">
                          {selectedError.timestamp ? new Date(selectedError.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      {selectedError.resolvedAt && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">Resolved At:</span>
                          <span className="text-xs sm:text-sm break-words sm:text-right flex-1 min-w-0">
                            {new Date(selectedError.resolvedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Error Message */}
                <Card className="w-full min-w-0 overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">Error Message</span>
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="min-w-0 w-full overflow-hidden">
                    <div className="text-sm sm:text-base bg-muted p-2 sm:p-4 rounded-md break-words break-all min-w-0 w-full overflow-x-auto overflow-y-hidden">
                      {selectedError.message || 'No message available'}
                    </div>
                  </CardContent>
                </Card>

                {/* Source Information */}
                <Card className="w-full min-w-0 overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                      <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">Source Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 min-w-0 w-full overflow-hidden">
                    <div className="min-w-0 w-full overflow-hidden">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">Source:</span>
                      <div className="font-mono text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded-md break-all break-words min-w-0 w-full overflow-x-auto overflow-y-hidden">
                        {selectedError.source || 'Unknown source'}
                      </div>
                    </div>
                    {selectedError.environment && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">Environment:</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedError.environment}
                        </Badge>
                      </div>
                    )}
                    {selectedError.url && (
                      <div className="min-w-0 w-full overflow-hidden">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2 flex items-center gap-1.5">
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:inline-block flex-shrink-0" />
                          URL:
                        </span>
                        <div className="text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded-md break-all break-words min-w-0 w-full overflow-x-auto overflow-y-hidden">
                          {selectedError.url}
                        </div>
                      </div>
                    )}
                    {selectedError.method && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">Method:</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {selectedError.method}
                        </Badge>
                      </div>
                    )}
                    {selectedError.statusCode && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">Status Code:</span>
                        <Badge variant={selectedError.statusCode >= 500 ? 'destructive' : selectedError.statusCode >= 400 ? 'secondary' : 'default'} className="text-xs">
                          {selectedError.statusCode}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User & Request Information */}
                {(selectedError.userId || selectedError.ipAddress || selectedError.userAgent) && (
                  <Card className="w-full min-w-0 overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">User & Request Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0 min-w-0 w-full overflow-hidden">
                      {selectedError.userId && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50 min-w-0 w-full">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">User ID:</span>
                          <span className="font-mono text-xs sm:text-sm break-all sm:text-right flex-1 min-w-0 overflow-hidden">{selectedError.userId}</span>
                        </div>
                      )}
                      {selectedError.ipAddress && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2.5 border-b border-border/50 min-w-0 w-full">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">IP Address:</span>
                          <span className="font-mono text-xs sm:text-sm break-all sm:text-right flex-1 min-w-0 overflow-hidden">{selectedError.ipAddress}</span>
                        </div>
                      )}
                      {selectedError.userAgent && (
                        <div className="py-2.5 min-w-0 w-full overflow-hidden">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">User Agent:</span>
                          <div className="text-xs sm:text-sm text-muted-foreground bg-muted p-2 sm:p-3 rounded-md break-all break-words min-w-0 w-full overflow-x-auto overflow-y-hidden">
                            {selectedError.userAgent}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Stack Trace */}
                {selectedError.stackTrace && (
                  <Card className="w-full min-w-0 overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                        <Code className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">Stack Trace</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0 w-full overflow-hidden">
                      <pre className="text-xs sm:text-sm bg-muted p-2 sm:p-4 rounded-md overflow-auto max-h-40 sm:max-h-48 font-mono whitespace-pre-wrap break-words break-all min-w-0 w-full">
                        {selectedError.stackTrace}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                  <Card className="w-full min-w-0 overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">Metadata</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0 w-full overflow-hidden">
                      <pre className="text-xs sm:text-sm bg-muted p-2 sm:p-4 rounded-md overflow-auto max-h-40 sm:max-h-48 font-mono whitespace-pre-wrap break-words break-all min-w-0 w-full">
                        {JSON.stringify(selectedError.metadata, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {selectedError.tags && selectedError.tags.length > 0 && (
                  <Card className="w-full min-w-0 overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 min-w-0">
                        <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">Tags</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0 w-full overflow-hidden">
                      <div className="flex flex-wrap gap-2 min-w-0 w-full">
                        {selectedError.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}