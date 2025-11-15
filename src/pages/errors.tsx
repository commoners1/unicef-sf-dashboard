import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
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
  Activity
} from 'lucide-react';

export default function ErrorsPage() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pagination, setPagination, handlePageChange: setPage } = usePagination();
  const [filters, setFilters] = useState<ErrorFilters>({});

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
      setError(getApiErrorMessage(err));
    }
  };

  // Helper functions
  const handleRefresh = async () => {
    await Promise.all([loadErrors(pagination.current, pagination.pageSize, filters), loadStats()]);
  };

  const handleView = (_error: Error) => {
    // TODO: Open error details modal
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
      filterOptions: [
        { label: 'All Levels', value: '' },
        { label: 'Critical', value: 'critical' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ],
      render: (error) => {
        const getLevelVariant = (level: string) => {
          switch (level) {
            case 'critical': return 'destructive';
            case 'error': return 'destructive';
            case 'warning': return 'secondary';
            case 'info': return 'default';
            default: return 'outline';
          }
        };
        
        return (
          <Badge variant={getLevelVariant(error.type)}>
            {error.type.toUpperCase()}
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
      render: (error) => (
        <div className="max-w-md">
          <div className="font-medium truncate">{error.message}</div>
          <div className="text-xs text-muted-foreground truncate">
            {error.source}
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
      render: (error) => (
        <div className="flex items-center space-x-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{error.source}</span>
        </div>
      ),
    },
    {
      key: 'occurrences',
      title: 'Occurrences',
      dataIndex: 'occurrences',
      sortable: true,
      render: (error) => (
        <div className="text-center">
          <div className="font-bold">{error.occurrences}</div>
          <div className="text-xs text-muted-foreground">
            {error.firstSeen && new Date(error.firstSeen).toLocaleDateString()}
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
      render: (error) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(error.lastSeen).toLocaleString()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and manage application errors and exceptions
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
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time errors
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unresolved}</div>
              <p className="text-xs text-muted-foreground">
                Active issues
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">
                High priority
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
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
    </div>
  );
}