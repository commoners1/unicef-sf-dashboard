import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { MetricsCard } from '@/features/dashboard';
import { calculateSuccessRate } from '@/lib/utils';
import { getApiErrorMessage, isAuthenticationError } from '@/lib/error-handler';
import { getLoginUrl } from '@/config/routes.config';
import { 
  useAuditDashboardStats,
  useQueueHealth,
  useQueueDetailedStats,
  useAllUsersCount
} from '@/hooks/queries';
import { 
  Activity, 
  Users, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  LogIn
} from 'lucide-react';
export default function DashboardPage() {
  const { 
    data: auditStats, 
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useAuditDashboardStats();

  const { 
    data: queueHealth, 
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = useQueueHealth();

  const { 
    data: performanceMetrics, 
    isLoading: isLoadingPerformance,
    error: performanceError,
    refetch: refetchPerformance
  } = useQueueDetailedStats();

  const { 
    data: allUsersCount, 
    isLoading: isLoadingAllUsersCount, 
    error: allUsersCountError,
    refetch: refetchAllUsersCount
  } = useAllUsersCount();

  const isLoading = isLoadingStats || isLoadingHealth || isLoadingPerformance || isLoadingAllUsersCount;
  const error = statsError || healthError || performanceError || allUsersCountError;

  const handleRefresh = () => {
    refetchStats();
    refetchHealth();
    refetchPerformance();
    refetchAllUsersCount();
  };

  const calculatedMetrics = {
    totalApiCalls: auditStats?.total || 0,
    successRate: auditStats?.byStatus ? 
      calculateSuccessRate(auditStats.byStatus.success, auditStats.byStatus.error) : 0,
    averageResponseTime: performanceMetrics?.performance?.avgProcessingTime || 0,
    activeUsers: allUsersCount?.count.toLocaleString() || 0,
    queueDepth: queueHealth?.queues ? 
      Object.values(queueHealth.queues).reduce((total: number, queue: any) => total + (queue.waiting || 0), 0) : 0
  };

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return Number(num.toFixed(2)).toString();
  };

  const systemHealthData = {
    api: { 
      status: 'healthy', 
      responseTime: `${formatNumber(performanceMetrics?.performance?.avgProcessingTime || 0)}ms` 
    },
    database: { 
      status: 'healthy', 
      connections: 12
    },
    redis: { 
      status: 'healthy', 
      memory: `${formatNumber((performanceMetrics?.performance?.memoryUsage || 0) * 100)}%` 
    },
    queue: { 
      status: queueHealth?.status === 'healthy' ? 'healthy' : 'warning',
      pendingJobs: calculatedMetrics.queueDepth
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time system overview and key metrics
          </p>
        </div>
        <PageLoading text="Loading dashboard" subtitle="Fetching system metrics and health data" />
      </div>
    );
  }

  if (error) {
    const errorMessage = getApiErrorMessage(error);
    const isAuthError = isAuthenticationError(error);
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time system overview and key metrics
          </p>
        </div>
        <Card className={isAuthError ? 'border-yellow-500' : 'border-destructive'}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${isAuthError ? 'text-yellow-500' : 'text-destructive'}`} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {isAuthError ? 'Session Expired' : 'Error Loading Dashboard'}
                  </h3>
                  <p className={`text-sm ${isAuthError ? 'text-yellow-700 dark:text-yellow-400' : 'text-destructive'}`}>
                    {errorMessage}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {isAuthError ? (
                  <Button
                    onClick={() => {
                      window.location.href = getLoginUrl();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
                {!isAuthError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Reload Page
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time system overview and key metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            {getStatusIcon(systemHealthData.api.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealthData.api.status}</div>
            <p className="text-xs text-muted-foreground">
              Response time: {systemHealthData.api.responseTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            {getStatusIcon(systemHealthData.database.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealthData.database.status}</div>
            <p className="text-xs text-muted-foreground">
              {systemHealthData.database.connections} connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            {getStatusIcon(systemHealthData.redis.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealthData.redis.status}</div>
            <p className="text-xs text-muted-foreground">
              Memory: {systemHealthData.redis.memory}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue</CardTitle>
            {getStatusIcon(systemHealthData.queue.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealthData.queue.status}</div>
            <p className="text-xs text-muted-foreground">
              {systemHealthData.queue.pendingJobs} pending jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricsCard
          title="Total API Calls"
          value={calculatedMetrics.totalApiCalls.toLocaleString()}
          change={12.5}
          changeType="increase"
          description="All time"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Success Rate"
          value={`${formatNumber(calculatedMetrics.successRate)}%`}
          change={0.3}
          changeType="increase"
          description="API response success rate"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Avg Response Time"
          // value={`${formatNumber(calculatedMetrics.averageResponseTime)}ms`}
          value={`${calculatedMetrics.averageResponseTime.toLocaleString('id-ID', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}ms`}
          change={-15}
          changeType="decrease"
          description="Average processing time"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Active Users"
          value={allUsersCount?.count.toLocaleString() || 0}
          change={8}
          changeType="increase"
          description="Currently active"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Queue Depth"
          value={calculatedMetrics.queueDepth.toString()}
          change={-2}
          changeType="decrease"
          description="Pending jobs"
          icon={<Database className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* System Status and Queue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Endpoints</span>
                <Badge variant={systemHealthData.api.status === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealthData.api.status === 'healthy' ? 'Operational' : 'Issues'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant={systemHealthData.database.status === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealthData.database.status === 'healthy' ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Redis Cache</span>
                <Badge variant={systemHealthData.redis.status === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealthData.redis.status === 'healthy' ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Queue System</span>
                <Badge variant={systemHealthData.queue.status === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealthData.queue.status === 'healthy' ? 'Processing' : 'Issues'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Jobs</span>
                <Badge variant="default">Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queueHealth?.queues && Object.entries(queueHealth.queues).map(([key, queue]: [string, any]) => {
                const queueName = key.charAt(0).toUpperCase() + key.slice(1) + ' Queue';
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{queueName}</span>
                      <Badge variant={queue.health === 'healthy' ? 'default' : queue.health === 'warning' ? 'secondary' : 'destructive'}>
                        {queue.health?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Waiting: {queue.waiting || 0}</div>
                      <div>Active: {queue.active || 0}</div>
                      <div>Completed: {queue.completed || 0}</div>
                      <div>Failed: {queue.failed || 0}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
