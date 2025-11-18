import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageLoading } from '@/components/ui/loading';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Globe,
  Calendar,
  Eye,
  Code,
  Server,
  Hash,
  Cloud
} from 'lucide-react';
import type { AuditLog, AuditLogFilters, AuditLogStats } from '@/types/audit';
import { SalesforceLogsApiService } from '@/services/api/salesforce-logs/salesforce-logs-api';
import { getApiErrorMessage, downloadJSON, downloadBlob, formatDateForFilename } from '@/lib/utils';

export default function SalesforceLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadStats();
    loadLogs();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await SalesforceLogsApiService.getSalesforceStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (page = 1, limit = 10, newFilters: AuditLogFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SalesforceLogsApiService.getSalesforceLogs({
        page,
        limit,
        ...newFilters,
      });
      
      setLogs(response.logs);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      console.error('Error loading logs:', err);
      setError(getApiErrorMessage(err));
      setLogs([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadStats(), loadLogs(pagination.current, pagination.pageSize, filters)]);
  };

  const handleView = (log: AuditLog) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const handleExport = async (log?: AuditLog) => {
    try {
      if (log) {
        downloadJSON(log, `salesforce-log-${log.id}`);
      } else {
        const blob = await SalesforceLogsApiService.exportSalesforceLogs({
          format: 'csv',
          filters: filters,
          fields: ['id', 'action', 'method', 'endpoint', 'statusCode', 'user', 'ipAddress', 'createdAt'],
        });
        downloadBlob(blob, `salesforce-logs-${formatDateForFilename()}.csv`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError(getApiErrorMessage(err));
    }
  };

  const handlePageChange = (page: number) => {
    loadLogs(page, pagination.pageSize, filters);
  };

  const handleFilterChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    loadLogs(1, pagination.pageSize, newFilters);
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      filterOptions: [
        { label: 'All Actions', value: '' },
        { label: 'API Call', value: 'API_CALL' },
        { label: 'Job Started', value: 'JOB_STARTED' },
        { label: 'Job Completed', value: 'JOB_COMPLETED' },
        { label: 'Cron Job', value: 'CRON_JOB' },
        { label: 'Queue Job Added', value: 'QUEUE_JOB_ADDED' },
        { label: 'System Maintenance', value: 'SYSTEM_MAINTENANCE' },
      ],
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Cloud className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Badge variant="outline" className="font-mono text-xs break-words">
            {log.action}
          </Badge>
        </div>
      ),
    },
    {
      key: 'endpoint',
      title: 'Endpoint',
      dataIndex: 'endpoint',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      render: (_, log) => (
        <div className="flex items-center space-x-2 min-w-0">
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium font-mono text-sm break-words">{log.endpoint}</div>
            <div className="text-xs text-muted-foreground">{log.method}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      title: 'User',
      dataIndex: 'user',
      sortable: true,
      filterable: true,
      mobilePriority: 'primary',
      filterOptions: [
        { label: 'All Users', value: '' },
        ...Array.from(new Set(logs.map(l => l.user?.name).filter(Boolean))).map(name => ({
          label: name!,
          value: name!,
        })),
        { label: 'System', value: 'System' },
      ],
      render: (_, log) => (
        <div className="flex items-center space-x-2 min-w-0">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">
              {log.user ? log.user.name : 'System'}
            </div>
            {log.user && (
              <div className="text-xs text-muted-foreground truncate">{log.user.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'statusCode',
      title: 'Status',
      dataIndex: 'statusCode',
      sortable: true,
      filterable: true,
      mobilePriority: 'secondary',
      filterOptions: [
        { label: 'All Status', value: '' },
        { label: 'Success (2xx)', value: '2xx' },
        { label: 'Client Error (4xx)', value: '4xx' },
        { label: 'Server Error (5xx)', value: '5xx' },
      ],
      render: (_, log) => {
        const getStatusVariant = (code: number) => {
          if (code >= 200 && code < 300) return 'default';
          if (code >= 400 && code < 500) return 'secondary';
          if (code >= 500) return 'destructive';
          return 'outline';
        };
        
        return (
          <Badge variant={getStatusVariant(log.statusCode)} className="text-xs">
            {log.statusCode}
          </Badge>
        );
      },
    },
    {
      key: 'ipAddress',
      title: 'IP Address',
      dataIndex: 'ipAddress',
      sortable: true,
      filterable: true,
      mobilePriority: 'secondary',
      render: (_, log) => (
        <div className="font-mono text-xs sm:text-sm break-all">{log.ipAddress}</div>
      ),
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration',
      sortable: true,
      mobilePriority: 'secondary',
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-mono text-xs sm:text-sm">
            {log.duration ? `${log.duration}ms` : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'isDelivered',
      title: 'Delivered',
      dataIndex: 'isDelivered',
      sortable: true,
      filterable: true,
      mobilePriority: 'secondary',
      filterOptions: [
        { label: 'All', value: '' },
        { label: 'Delivered', value: 'true' },
        { label: 'Not Delivered', value: 'false' },
      ],
      render: (_, log) => (
        <Badge variant={log.isDelivered ? 'default' : 'secondary'} className="text-xs">
          {log.isDelivered ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      mobilePriority: 'secondary',
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs sm:text-sm">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ),
    },
  ];

  // Show initial loading state when page first loads
  if (loading && logs.length === 0 && !error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Salesforce Logs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and analyze Salesforce integration activity and API usage
          </p>
        </div>
        <PageLoading text="Loading Salesforce logs" subtitle="Fetching logs and statistics" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Salesforce Logs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and analyze Salesforce integration activity and API usage
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
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 sm:p-4">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-medium text-destructive">Error</h3>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-destructive/90 break-words">{error}</div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Today</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.week}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {stats.total > 0 ? ((stats.byStatus.success / stats.total) * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.byStatus.error} errors
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
        onPaginationChange={handlePageChange}
        onSort={(field, direction) => {
          const newFilters = { ...filters, sortBy: field, sortOrder: direction };
          handleFilterChange(newFilters);
        }}
        onFilter={handleFilterChange}
        onSearch={(searchTerm) => {
          const newFilters = { ...filters, search: searchTerm };
          handleFilterChange(newFilters);
        }}
        searchPlaceholder="Search logs by action, endpoint, user, or IP..."
        actions={{
          view: handleView,
          export: handleExport,
        }}
        rowKey="id"
        emptyMessage="No Salesforce logs found"
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] w-[95vw] sm:w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Salesforce Log Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Detailed information for Salesforce log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[70vh] sm:max-h-[60vh]">
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                      <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">ID:</span>
                        <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.id}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Action:</span>
                        <Badge variant="outline" className="text-xs font-mono">{selectedLog.action}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Method:</span>
                        <Badge 
                          className={`${
                            selectedLog.method === 'GET' ? 'bg-blue-600' :
                            selectedLog.method === 'POST' ? 'bg-green-600' :
                            selectedLog.method === 'PUT' ? 'bg-yellow-600' :
                            selectedLog.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                          } text-white font-semibold px-3 py-1 rounded-md text-xs`}
                        >
                          {selectedLog.method}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Status:</span>
                        <Badge 
                          className={`${
                            selectedLog.statusCode >= 200 && selectedLog.statusCode < 300 ? 'bg-green-500' :
                            selectedLog.statusCode >= 300 && selectedLog.statusCode < 400 ? 'bg-blue-500' :
                            selectedLog.statusCode >= 400 && selectedLog.statusCode < 500 ? 'bg-yellow-500' :
                            selectedLog.statusCode >= 500 ? 'bg-red-500' : 'bg-gray-500'
                          } text-white font-semibold px-3 py-1 rounded-md text-xs`}
                        >
                          {selectedLog.statusCode}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Timing & Location</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Created:</span>
                        <span className="text-xs sm:text-sm break-words text-right flex-1">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Duration:</span>
                        <span className="text-xs sm:text-sm font-mono text-right">{selectedLog.duration ? `${selectedLog.duration}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">IP Address:</span>
                        <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.ipAddress}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Delivered:</span>
                        <Badge variant={selectedLog.isDelivered ? 'default' : 'secondary'} className="text-xs">
                          {selectedLog.isDelivered ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Endpoint Information */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
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
                    {selectedLog.userAgent && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">User Agent:</span>
                        <div className="text-xs sm:text-sm text-muted-foreground bg-muted p-3 rounded-md break-all">
                          {selectedLog.userAgent}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>User Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedLog.user ? (
                      <div className="space-y-0">
                        <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Name:</span>
                          <span className="text-xs sm:text-sm break-words text-right flex-1">{selectedLog.user.name}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Email:</span>
                          <span className="text-xs sm:text-sm break-all text-right flex-1">{selectedLog.user.email}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 py-2.5">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">User ID:</span>
                          <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.user.id}</span>
                        </div>
                      </div>
                    ) : selectedLog.apiKey ? (
                      <div className="space-y-0">
                        <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">API Key Name:</span>
                          <span className="text-xs sm:text-sm break-words text-right flex-1">{selectedLog.apiKey.name}</span>
                        </div>
                        {selectedLog.apiKey.description && (
                          <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">Description:</span>
                            <span className="text-xs sm:text-sm break-words text-right flex-1">{selectedLog.apiKey.description}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3 py-2.5">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[100px]">API Key ID:</span>
                          <span className="font-mono text-xs sm:text-sm break-all text-right flex-1">{selectedLog.apiKeyId}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-muted-foreground text-center py-4">System generated log</div>
                    )}
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

