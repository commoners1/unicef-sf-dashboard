import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLoading } from '@/components/ui/loading';
import { ErrorsApiService, type Error, type ErrorFilters, type ErrorStats } from '@/services/api/errors/errors-api';
import { usePagination } from '@/hooks';
import { getApiErrorMessage, downloadJSON, downloadBlob, formatDateForFilename } from '@/lib/utils';
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
  Globe
} from 'lucide-react';

export default function ErrorsPage() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pagination, setPagination, handlePageChange: setPage } = usePagination();
  const [filters, setFilters] = useState<ErrorFilters>({});
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadErrors();
    loadStats();
  }, []);

  // Load errors from API
  const loadErrors = async (page = 1, limit = 10, newFilters: ErrorFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ErrorsApiService.getErrors({
        page,
        limit,
        ...newFilters,
      });
      
      setErrors(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      console.error('Error loading errors:', err);
      setError(getApiErrorMessage(err));
      setErrors([]);
      setPagination({ current: 1, pageSize: 10, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Load error statistics
  const loadStats = async () => {
    try {
      const statsData = await ErrorsApiService.getErrorStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Don't set error state for stats failure, just log it
      // Stats are not critical for the page to function
    }
  };

  // Helper functions
  const handleRefresh = async () => {
    await Promise.all([loadErrors(pagination.current, pagination.pageSize, filters), loadStats()]);
  };

  const handleView = (error: Error) => {
    setSelectedError(error);
    setIsViewModalOpen(true);
  };


  const handleDelete = async (error: Error) => {
    try {
      await ErrorsApiService.deleteError(error.id);
      await loadErrors(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      console.error('Delete failed:', err);
      setError(getApiErrorMessage(err));
    }
  };

  const handleExport = async (error?: Error) => {
    try {
      if (error) {
        downloadJSON(error, `error-${error.id}`);
      } else {
        const blob = await ErrorsApiService.exportErrors(filters, 'csv');
        downloadBlob(blob, `errors-${formatDateForFilename()}.csv`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError(getApiErrorMessage(err));
    }
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setPage(page);
    loadErrors(page, pagination.pageSize, filters);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    loadErrors(1, pagination.pageSize, newFilters);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm };
    handleFilterChange(newFilters);
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
  if (loading && errors.length === 0 && !error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage application errors and exceptions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="flex-1 sm:flex-initial min-w-[100px]">
            <RefreshCw className={`mr-1.5 sm:mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={() => handleExport()} className="flex-1 sm:flex-initial min-w-[100px]">
            <Download className="mr-1.5 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export All</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="mt-1">
            {error}
          </AlertDescription>
        </Alert>
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
        searchPlaceholder="Search errors by message, source, or level..."
        actions={{
          view: handleView,
          delete: handleDelete,
          export: handleExport,
        }}
        rowKey="id"
        emptyMessage="No errors found"
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