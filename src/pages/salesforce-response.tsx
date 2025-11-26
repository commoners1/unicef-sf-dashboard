import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageLoading } from '@/components/ui/loading';
import { usePaginatedFetch } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { startOfDay, isAfter, isBefore } from 'date-fns';
import { formatGMT7, formatGMT7Date, convertDateFilterToUTC, convertEndDateFilterToUTC } from '@/lib/utils/timezone.util';
import { 
  RefreshCw, 
  Eye,
  Code,
  Hash,
  MessageSquare,
  Tag,
  AlertTriangle,
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
import type { AuditLog, AuditLogFilters } from '@/types/audit';
import { SalesforceLogsApiService } from '@/services/api/salesforce-logs/salesforce-logs-api';
import { 
  getStatusClassification, 
  getMethodBadgeColor,
  type ResponseTypeFilter,
  type EndpointStatusFilter 
} from '@/utils';
import { ColumnFilterBuilder, type ColumnFilters } from '@/types/column-filters';
import { ErrorDisplay } from '@/components/shared';
import { getApiErrorMessage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { handleExport as handleExportUtil } from '@/lib/exports/export-handler';
import { salesforceResponseExportColumns } from '@/lib/exports/export-columns/salesforce-response-export-columns';

export default function SalesforceResponsePage() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Filter states
  const [responseTypeFilter, setResponseTypeFilter] = useState<ResponseTypeFilter>('all');
  const [endpointStatusFilter, setEndpointStatusFilter] = useState<EndpointStatusFilter>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  const buildFilters = useCallback((): AuditLogFilters => {
    const newFilters: AuditLogFilters = {};
    if (startDate) {
      // Convert GMT+7 date to UTC for backend
      newFilters.startDate = convertDateFilterToUTC(startDate);
    }
    if (endDate) {
      // Convert GMT+7 end date to UTC (inclusive of full day)
      newFilters.endDate = convertEndDateFilterToUTC(endDate);
    }

    const columnFilters: ColumnFilters = {};

    if (responseTypeFilter !== 'all') {
      let types: string[] = [];
      switch (responseTypeFilter) {
        case 'monthly':
          types = ['post-monthly', 'pledge'];
          break;
        case 'oneoff':
          types = ['post-oneoff', 'oneoff'];
          break;
        case 'payment-link':
          types = ['payment-link'];
          break;
        case 'charge':
          types = ['charge'];
          break;
      }
      if (types.length > 0) {
        columnFilters.type = ColumnFilterBuilder.responseType(types);
      }
    }

    // Endpoint Status filter
    if (endpointStatusFilter !== 'all') {
      switch (endpointStatusFilter) {
        case 'success':
          columnFilters.statusCode = ColumnFilterBuilder.statusCodeRange(200, 299);
          break;
        case 'client-error':
          columnFilters.statusCode = ColumnFilterBuilder.statusCodeRange(400, 499);
          break;
        case 'server-error':
          columnFilters.statusCode = ColumnFilterBuilder.statusCodeRange(500, 599);
          break;
      }
    }

    if (Object.keys(columnFilters).length > 0) {
      newFilters.columnFilters = columnFilters;
    }

    return newFilters;
  }, [startDate, endDate, responseTypeFilter, endpointStatusFilter]);

  // Use the new paginated fetch hook
  const {
    data: logs,
    loading,
    error: fetchError,
    pagination,
    filters,
    setFilters: setBaseFilters,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = usePaginatedFetch<AuditLog>({
    fetchFn: useCallback(async (filters) => {
      const dateAndColumnFilters = buildFilters();
      
      return SalesforceLogsApiService.getSalesforceLogs({
        ...filters,
        ...dateAndColumnFilters,
      });
    }, [buildFilters]),
    initialFilters: {} as AuditLogFilters,
    initialPageSize: 10,
    autoFetch: true,
    dataKey: 'logs', // API returns 'logs' instead of 'data'
  });

  const handleView = (log: AuditLog) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  // Helper function to clean filters - remove undefined/null/empty values and pagination fields
  const cleanFilters = (inputFilters: AuditLogFilters): AuditLogFilters => {
    const cleaned: AuditLogFilters = {};
    
    // List of valid filter fields for export (exclude pagination/sorting)
    if (inputFilters.userId && inputFilters.userId !== '') {
      cleaned.userId = inputFilters.userId;
    }
    if (inputFilters.apiKeyId && inputFilters.apiKeyId !== '') {
      cleaned.apiKeyId = inputFilters.apiKeyId;
    }
    if (inputFilters.action && inputFilters.action !== '') {
      cleaned.action = inputFilters.action;
    }
    if (inputFilters.method && inputFilters.method !== '') {
      cleaned.method = inputFilters.method;
    }
    if (inputFilters.statusCode !== undefined && inputFilters.statusCode !== null) {
      cleaned.statusCode = inputFilters.statusCode;
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
    if (inputFilters.isDelivered !== undefined && inputFilters.isDelivered !== null) {
      cleaned.isDelivered = inputFilters.isDelivered;
    }
    if (inputFilters.columnFilters && Object.keys(inputFilters.columnFilters).length > 0) {
      cleaned.columnFilters = inputFilters.columnFilters;
    }
    
    return cleaned;
  };

  const handleExport = async (includeFilters: boolean = false) => {
    try {
      setActionError(null);
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
        fetchFn: SalesforceLogsApiService.getSalesforceLogs,
        dataKey: 'logs',
        exportColumns: salesforceResponseExportColumns,
        cleanFilters,
        clientSideFilter: undefined, // No client-side filtering needed, all done server-side
        filenamePrefix: 'salesforce-responses',
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

  // Handle filter changes - triggers refetch with new date filters
  const handleFilterChange = (newFilters: AuditLogFilters) => {
    const isEmpty = Object.keys(newFilters).length === 0 || 
                    Object.values(newFilters).every(v => v === undefined || v === '' || v === null || (typeof v === 'object' && Object.keys(v).length === 0));
    if (isEmpty) {
      clearFilters();
    } else {
      setBaseFilters(newFilters);
    }
    // Refetch will happen automatically via useEffect when filters change
  };


  const clearFilters = () => {
    setResponseTypeFilter('all');
    setEndpointStatusFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setBaseFilters({});
    // Don't call handleRefresh here - let useEffect handle it after state updates
  };

  // Check if custom filters are active
  const hasCustomFiltersActive = responseTypeFilter !== 'all' || 
                                  endpointStatusFilter !== 'all' || 
                                  startDate !== undefined || 
                                  endDate !== undefined;

  useEffect(() => {
    handleRefresh();
  }, [startDate, endDate, responseTypeFilter, endpointStatusFilter]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'type',
      title: 'Response Type',
      dataIndex: 'type',
      sortable: true,
      filterable: false,
      mobilePriority: 'primary',
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Badge variant="outline" className="font-mono text-xs break-words">
            {log.type || 'N/A'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'referenceId',
      title: 'Reference ID',
      dataIndex: 'referenceId',
      sortable: true,
      filterable: false,
      mobilePriority: 'primary',
      render: (_, log) => (
        <div className="flex items-center space-x-2 min-w-0">
          <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="font-mono text-xs sm:text-sm break-all min-w-0 flex-1">
            {log.referenceId || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'statusCode',
      title: 'Endpoint Status',
      dataIndex: 'statusCode',
      sortable: true,
      filterable: false,
      mobilePriority: 'primary',
      render: (_, log) => {
        const statusInfo = getStatusClassification(log.statusCode);
        return (
          <div className="flex items-center space-x-2">
            {statusInfo.icon}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <Badge variant={statusInfo.variant} className="text-xs">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      key: 'salesforceId',
      title: 'Salesforce ID',
      dataIndex: 'salesforceId',
      sortable: true,
      filterable: false,
      mobilePriority: 'secondary',
      render: (_, log) => (
        <div className="font-mono text-xs sm:text-sm break-all">
          {log.salesforceId || 'N/A'}
        </div>
      ),
    },
    {
      key: 'statusMessage',
      title: 'Status Message',
      dataIndex: 'statusMessage',
      sortable: true,
      filterable: false,
      mobilePriority: 'secondary',
      render: (_, log) => (
        <div className="flex items-center space-x-2 min-w-0">
          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="text-xs sm:text-sm break-words min-w-0 flex-1">
            {log.statusMessage || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      dataIndex: 'createdAt',
      sortable: true,
      mobilePriority: 'secondary',
      render: (_, log) => (
        <span className="text-xs sm:text-sm">
          {formatGMT7(log.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      sortable: false,
      filterable: false,
      mobilePriority: 'primary',
      width: '100px',
      align: 'left',
      render: (_, log) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleView(log)}
          aria-label="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Show initial loading state when page first loads
  if (loading && (!logs || logs.length === 0) && !fetchError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="pt-6 sm:pt-0 pb-6 sm:pb-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Salesforce Response</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and analyze Salesforce API responses and status information
          </p>
        </div>
        <PageLoading text="Loading Salesforce responses" subtitle="Fetching response data" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-0 pb-6 sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Salesforce Response</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and analyze Salesforce API responses and status information
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
              <DropdownMenuItem onClick={() => handleExport(false)} disabled={loading || exporting}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(true)} disabled={loading || exporting}>
                <Filter className="mr-2 h-4 w-4" />
                Export Filtered
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {fetchError && <ErrorDisplay error={fetchError} />}
      {actionError && <ErrorDisplay error={actionError} />}

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

      {/* Custom Filters - will be shown inside DataTable's "Search & Filters" section */}

      <DataTable
        data={logs}
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
          handleFilterChange(newFilters);
        }}
        onFilter={handleFilterChange}
        onSearch={(searchTerm) => {
          const newFilters = { 
            ...filters, 
            search: searchTerm && searchTerm.trim() ? searchTerm.trim() : undefined 
          };
          setBaseFilters(newFilters);
        }}
        searchValue={filters?.search || ''}
        searchPlaceholder="Search by type, reference ID, Salesforce ID, or status message..."
        showSelectionFilters={true}
        showSearchFilter={false}
        hasCustomFiltersActive={hasCustomFiltersActive}
        customFilters={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Response Type Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Response Type</label>
              <Select value={responseTypeFilter} onValueChange={(value) => setResponseTypeFilter(value as ResponseTypeFilter)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select response type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="oneoff">One Off</SelectItem>
                  <SelectItem value="payment-link">Payment Link</SelectItem>
                  <SelectItem value="charge">Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Endpoint Status Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Endpoint Status</label>
              <Select value={endpointStatusFilter} onValueChange={(value) => setEndpointStatusFilter(value as EndpointStatusFilter)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success (2xx)</SelectItem>
                  <SelectItem value="client-error">Client Error (4xx)</SelectItem>
                  <SelectItem value="server-error">Server Error (5xx)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range - Split into two grid items */}
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
                    onSelect={(date) => setStartDate(date)}
                    disabled={(date) => {
                      // Disable dates after today
                      return isAfter(startOfDay(date), startOfDay(new Date()));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

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
                    onSelect={(date) => setEndDate(date)}
                    disabled={(date) => {
                      const today = startOfDay(new Date());
                      const selectedDate = startOfDay(date);
                      
                      // Disable dates after today
                      if (isAfter(selectedDate, today)) {
                        return true;
                      }
                      
                      // Disable dates before the selected start date (if start date is selected)
                      if (startDate && isBefore(selectedDate, startOfDay(startDate))) {
                        return true;
                      }
                      
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        }
        rowKey="id"
        emptyMessage="No Salesforce responses found"
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] w-[95vw] sm:w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Salesforce Response Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Detailed information for Salesforce response entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[70vh] sm:max-h-[60vh]">
              <div className="space-y-4 sm:space-y-6">
                {/* Response Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>Response Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                      <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">ID:</span>
                        <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.id}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Type:</span>
                        <Badge variant="outline" className="text-xs font-mono">{selectedLog.type || 'N/A'}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Reference ID:</span>
                        <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.referenceId || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Salesforce ID:</span>
                        <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.salesforceId || 'N/A'}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span>Status Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Status Code:</span>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const statusInfo = getStatusClassification(selectedLog.statusCode);
                            return (
                              <>
                                {statusInfo.icon}
                                <Badge variant={statusInfo.variant} className="text-xs">
                                  {statusInfo.label}
                                </Badge>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Status Message:</span>
                        <span className="text-xs sm:text-sm break-words text-right flex-1">{selectedLog.statusMessage || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Created:</span>
                        <span className="text-xs sm:text-sm break-words text-right flex-1">{formatGMT7(selectedLog.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Method:</span>
                        <Badge 
                          className={`${getMethodBadgeColor(selectedLog.method)} text-white font-semibold px-3 py-1 rounded-md text-xs`}
                        >
                          {selectedLog.method}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Endpoint Information */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span>Endpoint Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">Endpoint:</span>
                      <div className="font-mono text-xs sm:text-sm bg-muted p-3 rounded-md break-all">
                        {selectedLog.endpoint}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Request/Response Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span>Request Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-md overflow-auto max-h-40 sm:max-h-48 font-mono">
                        {selectedLog.requestData ? JSON.stringify(selectedLog.requestData, null, 2) : 'No request data available'}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span>Response Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-md overflow-auto max-h-40 sm:max-h-48 font-mono">
                        {selectedLog.responseData ? JSON.stringify(selectedLog.responseData, null, 2) : 'No response data available'}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

