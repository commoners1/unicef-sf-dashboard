import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { format, addDays, startOfDay, isAfter, isBefore } from 'date-fns';
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
  filterByResponseType, 
  filterByEndpointStatus,
  type ResponseTypeFilter,
  type EndpointStatusFilter 
} from '@/utils';
import { ErrorDisplay } from '@/components/shared';
import { getApiErrorMessage, downloadBlob, formatDateForFilename } from '@/lib/utils';
import { ExportApiService } from '@/services/api/export/export-api';
import { Progress } from '@/components/ui/progress';

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

  // Build filters function that includes date range - memoized to ensure latest values
  const buildFilters = useCallback((): AuditLogFilters => {
    const newFilters: AuditLogFilters = {};
    if (startDate) {
      // Format date in local timezone to avoid UTC conversion issues
      newFilters.startDate = format(startDate, 'yyyy-MM-dd');
    }
    if (endDate) {
      // Add one day to endDate to ensure the backend includes the full selected day
      // This handles cases where the backend treats endDate as exclusive
      // e.g., if user selects Nov 21, we send endDate as Nov 22
      // Backend will include all records up to (but not including) Nov 22, which includes all of Nov 21
      const endDatePlusOne = addDays(endDate, 1);
      newFilters.endDate = format(endDatePlusOne, 'yyyy-MM-dd');
    }
    return newFilters;
  }, [startDate, endDate]);

  // Check if client-side filters are active
  const hasClientSideFilters = responseTypeFilter !== 'all' || endpointStatusFilter !== 'all';

  // Use the new paginated fetch hook
  const {
    data: rawLogs,
    loading,
    error: fetchError,
    pagination: rawPagination,
    filters,
    setFilters: setBaseFilters,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = usePaginatedFetch<AuditLog>({
    fetchFn: useCallback(async (filters) => {
      const dateFilters = buildFilters();
      
      // When client-side filters are active, don't send search to server
      // Search will be applied on client side after client-side filters
      // This ensures search works on the filtered dataset, not the full dataset
      const serverFilters = { ...filters };
      if (hasClientSideFilters && serverFilters.search) {
        delete serverFilters.search;
      }
      
      return SalesforceLogsApiService.getSalesforceLogs({
        ...serverFilters,
        ...dateFilters,
      });
    }, [buildFilters, hasClientSideFilters]),
    initialFilters: {} as AuditLogFilters,
    initialPageSize: 10,
    autoFetch: true,
    dataKey: 'logs', // API returns 'logs' instead of 'data'
  });

  // Apply client-side filters for Response Type and Endpoint Status
  // When client-side filters are active, also apply search on client side
  // This ensures search works on the filtered dataset, not the full dataset
  const logs = useMemo(() => {
    let filtered = filterByResponseType(rawLogs, responseTypeFilter);
    filtered = filterByEndpointStatus(filtered, endpointStatusFilter);
    
    // Apply search filter on client side when client-side filters are active
    // This ensures search works correctly when combined with selection filters
    const hasClientSideFilters = responseTypeFilter !== 'all' || endpointStatusFilter !== 'all';
    const searchTerm = filters?.search?.toLowerCase().trim();
    
    if (hasClientSideFilters && searchTerm) {
      filtered = filtered.filter(log => {
        const type = log.type?.toLowerCase() || '';
        const referenceId = log.referenceId?.toLowerCase() || '';
        const salesforceId = log.salesforceId?.toLowerCase() || '';
        const statusMessage = log.statusMessage?.toLowerCase() || '';
        
        return (
          type.includes(searchTerm) ||
          referenceId.includes(searchTerm) ||
          salesforceId.includes(searchTerm) ||
          statusMessage.includes(searchTerm)
        );
      });
    }
    
    return filtered;
  }, [rawLogs, responseTypeFilter, endpointStatusFilter, filters?.search]);

  // Adjust pagination total when client-side filters are active
  const pagination = useMemo(() => {
    const isFiltering = responseTypeFilter !== 'all' || endpointStatusFilter !== 'all';
    return {
      ...rawPagination,
      total: isFiltering ? logs.length : rawPagination.total,
    };
  }, [rawPagination, logs.length, responseTypeFilter, endpointStatusFilter]);

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
    
    return cleaned;
  };

  const handleExport = async (includeFilters: boolean = false) => {
    try {
      setActionError(null);
      setExporting(true);
      setExportProgress(null);
      
      // Check if client-side filters are active
      const hasClientSideFilters = responseTypeFilter !== 'all' || endpointStatusFilter !== 'all';
      
      // If client-side filters are active and we want to export filtered data,
      // we need to fetch all data and apply client-side filters, then export client-side
      if (includeFilters && hasClientSideFilters) {
        // Fetch all data from server (with server-side filters like date range, search)
        const dateFilters = buildFilters();
        const serverFilters = cleanFilters({
          ...filters,
          ...dateFilters,
        });
        
        // First, fetch first page to know total pages
        const firstResponse = await SalesforceLogsApiService.getSalesforceLogs({
          ...serverFilters,
          page: 1,
          limit: 1000,
        });
        
        const totalPages = firstResponse.pagination.pages;
        const pageSize = 1000;
        let allLogs: AuditLog[] = [...firstResponse.logs];
        
        setExportProgress({ current: 1, total: totalPages });
        
        // Fetch remaining pages in parallel batches to speed up large exports
        // Fetch 3-5 pages at a time to balance speed and server load
        const batchSize = 5;
        const remainingPages = totalPages > 1 ? Array.from({ length: totalPages - 1 }, (_, i) => i + 2) : [];
        
        // Process pages in batches
        for (let i = 0; i < remainingPages.length; i += batchSize) {
          const batch = remainingPages.slice(i, i + batchSize);
          
          // Fetch batch in parallel
          const batchPromises = batch.map(page =>
            SalesforceLogsApiService.getSalesforceLogs({
              ...serverFilters,
              page,
              limit: pageSize,
            })
          );
          
          const batchResponses = await Promise.all(batchPromises);
          
          // Combine results
          batchResponses.forEach(response => {
            allLogs = [...allLogs, ...response.logs];
          });
          
          // Update progress
          const currentPage = Math.min(i + batchSize + 1, totalPages);
          setExportProgress({ current: currentPage, total: totalPages });
          
          // Yield to browser to keep UI responsive
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        // Apply client-side filters to the fetched data
        setExportProgress({ current: totalPages, total: totalPages + 1 });
        let filteredData = filterByResponseType(allLogs, responseTypeFilter);
        filteredData = filterByEndpointStatus(filteredData, endpointStatusFilter);
        
        // Prepare data for export in chunks to avoid blocking UI
        setExportProgress({ current: totalPages + 1, total: totalPages + 2 });
        
        // Process data in chunks for better performance
        const chunkSize = 1000;
        const exportData: any[] = [];
        
        for (let i = 0; i < filteredData.length; i += chunkSize) {
          const chunk = filteredData.slice(i, i + chunkSize);
          const chunkData = chunk.map((log: AuditLog) => ({
            'ID': log.id || '',
            'User': log.user?.name || 'System',
            'Action': log.action || '',
            'Method': log.method || '',
            'Endpoint': log.endpoint || '',
            'Status Code': log.statusCode || '',
            'IP Address': log.ipAddress || '',
            'Created At': log.createdAt ? new Date(log.createdAt).toISOString() : '',
            'Type': log.type || '',
            'Reference ID': log.referenceId || '',
            'Salesforce ID': log.salesforceId || '',
            'Status Message': log.statusMessage || '',
          }));
          exportData.push(...chunkData);
          
          // Yield to browser every chunk
          if (i + chunkSize < filteredData.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
        
        // Export client-side
        setExportProgress({ current: totalPages + 2, total: totalPages + 3 });
        await ExportApiService.exportToXLSX(
          exportData,
          `salesforce-responses-filtered-${formatDateForFilename()}`,
          ['ID', 'User', 'Action', 'Method', 'Endpoint', 'Status Code', 'IP Address', 'Created At', 'Type', 'Reference ID', 'Salesforce ID', 'Status Message']
        );
        
        setExportProgress(null);
      } else {
        // Use server-side export (no client-side filters or export all)
        // This is more efficient for large datasets as the backend handles everything
        let exportFilters: AuditLogFilters;
        
        if (includeFilters) {
          // Combine filters and date filters, then clean them
          const combinedFilters = {
            ...filters,
            ...buildFilters(),
          };
          exportFilters = cleanFilters(combinedFilters);
        } else {
          // Export all data - use empty filters
          exportFilters = {};
        }
        
        const blob = await SalesforceLogsApiService.exportSalesforceLogs({
          format: 'xlsx',
          filters: exportFilters,
        });
        
        const filename = includeFilters 
          ? `salesforce-responses-filtered-${formatDateForFilename()}.xlsx`
          : `salesforce-responses-all-${formatDateForFilename()}.xlsx`;
        downloadBlob(blob, filename);
      }
    } catch (err) {
      console.error('Export failed:', err);
      setActionError(getApiErrorMessage(err));
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  // Handle filter changes - triggers refetch with new date filters
  const handleFilterChange = (newFilters: AuditLogFilters) => {
    setBaseFilters(newFilters);
    // Refetch will happen automatically via useEffect when filters change
  };

  const handleResponseTypeChange = (value: ResponseTypeFilter) => {
    setResponseTypeFilter(value);
    // Client-side filter, no need to refetch
  };

  const handleEndpointStatusChange = (value: EndpointStatusFilter) => {
    setEndpointStatusFilter(value);
    // Client-side filter, no need to refetch
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
    // Refetch will be triggered by useEffect when dates change
  };

  const clearFilters = () => {
    setResponseTypeFilter('all');
    setEndpointStatusFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setBaseFilters({});
    // Don't call handleRefresh here - let useEffect handle it after state updates
  };

  // Update filters when date range changes (including when cleared)
  // buildFilters is memoized with startDate/endDate, so when dates change,
  // buildFilters is recreated, which recreates fetchFn, triggering auto-refresh
  // We still need this useEffect to ensure refresh happens immediately after state updates
  useEffect(() => {
    // Skip initial mount to avoid double fetch
    // This will trigger when dates change, including when cleared to undefined
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);


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
          {new Date(log.createdAt).toLocaleString()}
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
      align: 'center',
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
  if (loading && logs.length === 0 && !fetchError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          handleFilterChange(newFilters);
        }}
        searchValue={filters?.search || ''}
        searchPlaceholder="Search by type, reference ID, Salesforce ID, or status message..."
        showSelectionFilters={true}
        showSearchFilter={false}
        customFilters={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Selection Filters</span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Response Type Filter */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Response Type</label>
              <Select value={responseTypeFilter} onValueChange={handleResponseTypeChange}>
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
              <Select value={endpointStatusFilter} onValueChange={handleEndpointStatusChange}>
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
                    {startDate ? format(startDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateRangeChange(date, endDate)}
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
                    {endDate ? format(endDate, 'PPP') : 'Select date'}
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
                                  {statusInfo.label} ({selectedLog.statusCode})
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
                        <span className="text-xs sm:text-sm break-words text-right flex-1">{new Date(selectedLog.createdAt).toLocaleString()}</span>
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

