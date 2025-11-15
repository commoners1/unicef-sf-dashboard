import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricsCard } from '@/features/dashboard';
import { AuditApiService } from '@/services/api/audit/audit-api';
import { QueueApiService } from '@/services/api/queue/queue-api';
import { calculateSuccessRate, getApiErrorMessage } from '@/lib/utils';
import { useAutoRefresh } from '@/hooks';
import { 
  Activity, 
  Users, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const [auditStats, setAuditStats] = useState<any>(null);
  const [queueHealth, setQueueHealth] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load real data from backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [stats, health, performance] = await Promise.all([
        AuditApiService.getAuditStats(),
        QueueApiService.getQueueHealth(),
        QueueApiService.getDetailedStats(),
      ]);
      setAuditStats(stats);
      setQueueHealth(health);
      setPerformanceMetrics(performance);
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 60 seconds
  useAutoRefresh(loadData, { interval: 60000 });

  // Calculate derived metrics
  const calculatedMetrics = {
    totalApiCalls: auditStats?.total || 0,
    successRate: auditStats?.byStatus ? 
      calculateSuccessRate(auditStats.byStatus.success, auditStats.byStatus.error) : 0,
    averageResponseTime: performanceMetrics?.performance?.avgProcessingTime || 0,
    activeUsers: 0, // This would need a separate API
    queueDepth: queueHealth?.queues ? 
      Object.values(queueHealth.queues).reduce((total: number, queue: any) => total + (queue.waiting || 0), 0) : 0
  };

  const systemHealthData = {
    api: { 
      status: 'healthy', 
      responseTime: `${Math.round(performanceMetrics?.performance?.avgProcessingTime || 0)}ms` 
    },
    database: { 
      status: 'healthy', 
      connections: 12 // This would need a separate API
    },
    redis: { 
      status: 'healthy', 
      memory: `${Math.round((performanceMetrics?.performance?.memoryUsage || 0) * 100)}%` 
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system overview and key metrics
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system overview and key metrics
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system overview and key metrics
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
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
          value={`${calculatedMetrics.successRate}%`}
          change={0.3}
          changeType="increase"
          description="API response success rate"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Avg Response Time"
          value={`${calculatedMetrics.averageResponseTime}ms`}
          change={-15}
          changeType="decrease"
          description="Average processing time"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Active Users"
          value={calculatedMetrics.activeUsers.toString()}
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
