import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Monitor, RefreshCw, AlertTriangle, CheckCircle, Clock, User, Key } from 'lucide-react';
import { LogsApiService, type AuditLog } from '@/services/api/logs/logs-api';

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    pages: 0,
  });
  const [filter, setFilter] = useState({
    level: 'all',
    search: '',
    method: 'all',
    statusCode: 'all',
  });

  // Load logs from API
  const loadLogs = async (page = 1, limit = 50) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {
        page,
        limit,
        search: filter.search || undefined,
        method: filter.method !== 'all' ? filter.method : undefined,
        statusCode: filter.statusCode !== 'all' ? parseInt(filter.statusCode) : undefined,
      };
      
      const response = await LogsApiService.getLogs(filters);
      
      setLogs(response.logs);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages,
      });
    } catch (err) {
      console.error('Error loading logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const responseData = (err as any)?.response?.data;
      console.error('Error details:', responseData);
      setError(`Failed to load logs: ${responseData?.message || errorMessage}`);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs on component mount
  useEffect(() => {
    loadLogs();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadLogs(pagination.current, pagination.pageSize);
    }, 30000);
    return () => clearInterval(interval);
  }, [pagination.current, pagination.pageSize]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    // Reset to first page when filters change
    loadLogs(1, pagination.pageSize);
  };

  const handleRefresh = () => {
    loadLogs(pagination.current, pagination.pageSize);
  };


  // Calculate statistics
  const errorCount = logs.filter(log => log.statusCode >= 400).length;
  const successCount = logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
  const warningCount = logs.filter(log => log.statusCode >= 300 && log.statusCode < 400).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Logs</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Monitor real-time system logs and events
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
              <span>Live Log Stream</span>
              <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isLoading && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Loading...</span>
                </Badge>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="flex-1 sm:flex-initial min-w-[100px]">
                <RefreshCw className={`h-4 w-4 mr-1.5 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
                <Download className="h-4 w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <Input
                  placeholder="Search log"
                  value={filter.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filter.method} onValueChange={(value) => handleFilterChange('method', value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter.statusCode} onValueChange={(value) => handleFilterChange('statusCode', value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="200">200 OK</SelectItem>
                  <SelectItem value="400">400 Bad Request</SelectItem>
                  <SelectItem value="401">401 Unauthorized</SelectItem>
                  <SelectItem value="403">403 Forbidden</SelectItem>
                  <SelectItem value="404">404 Not Found</SelectItem>
                  <SelectItem value="500">500 Server Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row items-start sm:items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:space-y-1 flex-shrink-0">
                      <div 
                        className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full w-fit text-white ${
                          log.statusCode >= 200 && log.statusCode < 300 
                            ? 'bg-blue-600' 
                            : log.statusCode >= 300 && log.statusCode < 400
                            ? 'bg-yellow-500'
                            : log.statusCode >= 400 && log.statusCode < 500
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {log.statusCode}
                      </div>
                      <div className="text-xs font-bold px-2 sm:px-4 py-1 sm:py-1.5 rounded-full w-fit bg-white border border-gray-300 text-gray-800">
                        {log.method}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        {log.user && (
                          <div className="flex items-center gap-1">
                            <span className="hidden sm:inline">•</span>
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{log.user.name || log.user.email}</span>
                          </div>
                        )}
                        {log.apiKey && (
                          <div className="flex items-center gap-1">
                            <span className="hidden sm:inline">•</span>
                            <Key className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[100px] sm:max-w-none">{log.apiKey.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="hidden sm:inline">•</span>
                          <span className="font-mono text-xs">{log.ipAddress}</span>
                        </div>
                        {log.duration && (
                          <div className="flex items-center gap-1">
                            <span className="hidden sm:inline">•</span>
                            <span>{log.duration}ms</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium break-words">{log.action}</p>
                      <p className="text-xs text-muted-foreground break-all">{log.endpoint}</p>
                      {log.userAgent && (
                        <p className="text-xs text-muted-foreground truncate max-w-full sm:max-w-md">
                          {log.userAgent}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center sm:items-start flex-shrink-0 self-start sm:self-center">
                      {log.isDelivered ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No logs found
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} logs
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(pagination.current - 1, pagination.pageSize)}
                    disabled={pagination.current <= 1 || isLoading}
                    className="text-xs sm:text-sm"
                  >
                    Previous
                  </Button>
                  <span className="text-xs sm:text-sm whitespace-nowrap">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(pagination.current + 1, pagination.pageSize)}
                    disabled={pagination.current >= pagination.pages || isLoading}
                    className="text-xs sm:text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Logs</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Success</CardTitle>
            <div className="text-xs font-bold px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
              SUCCESS
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {successCount}
            </div>
            <p className="text-xs text-muted-foreground">
              2xx responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Warnings</CardTitle>
            <div className="text-xs font-bold px-2 sm:px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
              WARN
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {warningCount}
            </div>
            <p className="text-xs text-muted-foreground">
              3xx responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Errors</CardTitle>
            <div className="text-xs font-bold px-2 sm:px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
              ERROR
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {errorCount}
            </div>
            <p className="text-xs text-muted-foreground">
              4xx & 5xx responses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}