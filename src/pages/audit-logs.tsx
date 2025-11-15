import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Monitor,
  Calendar,
  Eye,
  Code,
  Server,
  Hash
} from 'lucide-react';
import type { AuditLog, AuditLogFilters, AuditLogStats } from '@/types/audit';
import { AuditApiService } from '@/services/api/audit/audit-api';

export default function AuditLogsPage() {
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
      const statsData = await AuditApiService.getAuditStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (page = 1, limit = 10, newFilters: AuditLogFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuditApiService.getAuditLogs({
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
      setError('Failed to load audit logs');
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
        const data = JSON.stringify(log, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${log.id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const blob = await AuditApiService.exportAuditLogs({
          format: 'csv',
          filters: filters,
          fields: ['id', 'action', 'method', 'endpoint', 'statusCode', 'user', 'ipAddress', 'createdAt'],
        });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
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
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="font-mono text-xs">
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
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium font-mono text-sm">{log.endpoint}</div>
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
      filterOptions: [
        { label: 'All Users', value: '' },
        ...Array.from(new Set(logs.map(l => l.user?.name).filter(Boolean))).map(name => ({
          label: name!,
          value: name!,
        })),
        { label: 'System', value: 'System' },
      ],
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {log.user ? log.user.name : 'System'}
            </div>
            {log.user && (
              <div className="text-xs text-muted-foreground">{log.user.email}</div>
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
      filterOptions: [
        { label: 'All Status', value: '' },
        { label: 'Success (2xx)', value: '2xx' },
        { label: 'Client Error (4xx)', value: '4xx' },
        { label: 'Server Error (5xx)', value: '5xx' },
      ],
      render: (log) => {
        const getStatusVariant = (code: number) => {
          if (code >= 200 && code < 300) return 'default';
          if (code >= 400 && code < 500) return 'secondary';
          if (code >= 500) return 'destructive';
          return 'outline';
        };
        
        return (
          <Badge variant={getStatusVariant(log.statusCode)}>
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
      render: (_, log) => (
        <div className="font-mono text-sm">{log.ipAddress}</div>
      ),
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration',
      sortable: true,
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">
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
      filterOptions: [
        { label: 'All', value: '' },
        { label: 'Delivered', value: 'true' },
        { label: 'Not Delivered', value: 'false' },
      ],
      render: (_, log) => (
        <Badge variant={log.isDelivered ? 'default' : 'secondary'}>
          {log.isDelivered ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      render: (_, log) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze system activity and API usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExport()}>
            <Download className="mr-2 h-4 w-4" />
            Export All
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

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.week}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.byStatus.success / stats.total) * 100).toFixed(1)}%
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
        emptyMessage="No audit logs found"
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Audit Log Details</span>
            </DialogTitle>
            <DialogDescription>
              Detailed information for audit log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ID:</span>
                        <span className="font-mono text-sm">{selectedLog.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Action:</span>
                        <Badge variant="outline">{selectedLog.action}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Method:</span>
                        <Badge 
                          className={`${
                            selectedLog.method === 'GET' ? 'bg-blue-600' :
                            selectedLog.method === 'POST' ? 'bg-green-600' :
                            selectedLog.method === 'PUT' ? 'bg-yellow-600' :
                            selectedLog.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                          } text-white font-bold px-3 py-1 rounded-full`}
                        >
                          {selectedLog.method}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge 
                          className={`${
                            selectedLog.statusCode >= 200 && selectedLog.statusCode < 300 ? 'bg-green-500' :
                            selectedLog.statusCode >= 300 && selectedLog.statusCode < 400 ? 'bg-blue-500' :
                            selectedLog.statusCode >= 400 && selectedLog.statusCode < 500 ? 'bg-yellow-500' :
                            selectedLog.statusCode >= 500 ? 'bg-red-500' : 'bg-gray-500'
                          } text-white font-bold px-3 py-1 rounded-full`}
                        >
                          {selectedLog.statusCode}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Timing & Location</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="text-sm">{selectedLog.duration ? `${selectedLog.duration}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">IP Address:</span>
                        <span className="font-mono text-sm">{selectedLog.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Delivered:</span>
                        <Badge variant={selectedLog.isDelivered ? 'default' : 'secondary'}>
                          {selectedLog.isDelivered ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Endpoint Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Server className="h-4 w-4" />
                      <span>Endpoint Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm bg-muted p-3 rounded-md">
                      {selectedLog.endpoint}
                    </div>
                    {selectedLog.userAgent && (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">User Agent:</span>
                        <div className="text-xs text-muted-foreground mt-1 break-all">
                          {selectedLog.userAgent}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>User Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedLog.user ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="text-sm">{selectedLog.user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm">{selectedLog.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">User ID:</span>
                          <span className="font-mono text-sm">{selectedLog.user.id}</span>
                        </div>
                      </div>
                    ) : selectedLog.apiKey ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">API Key Name:</span>
                          <span className="text-sm">{selectedLog.apiKey.name}</span>
                        </div>
                        {selectedLog.apiKey.description && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Description:</span>
                            <span className="text-sm">{selectedLog.apiKey.description}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">API Key ID:</span>
                          <span className="font-mono text-sm">{selectedLog.apiKeyId}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">System generated log</div>
                    )}
                  </CardContent>
                </Card>

                {/* Request/Response Data - Always show both sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Code className="h-4 w-4" />
                        <span>Request Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                        {selectedLog.requestData ? JSON.stringify(selectedLog.requestData, null, 2) : 'No request data available'}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Code className="h-4 w-4" />
                        <span>Response Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
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