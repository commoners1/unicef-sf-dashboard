import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricsCard } from '@/components/dashboard/metrics-card';
import { useDashboardStore } from '@/stores/dashboard-store';
import { AuditApiService } from '@/services/audit-api';
import { QueueApiService } from '@/services/queue-api';
import { ExportApiService } from '@/services/export-api';
import { 
  Activity, 
  Database, 
  Server, 
  Workflow, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download
} from 'lucide-react';

export default function OverviewPage() {
  const { systemHealth, metrics } = useDashboardStore();
  const [auditStats, setAuditStats] = useState<any>(null);
  const [queueHealth, setQueueHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load real data from backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [stats, health] = await Promise.all([
        AuditApiService.getAuditStats(),
        QueueApiService.getQueueHealth(),
      ]);
      setAuditStats(stats);
      setQueueHealth(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading overview data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleExportOverview = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const exportData = {
        auditStats,
        queueHealth,
        systemHealth,
        metrics,
        timestamp: new Date().toISOString(),
      };

      if (format === 'json') {
        ExportApiService.exportToJSON([exportData], 'dashboard-overview');
      } else {
        // Convert to flat structure for CSV
        const flatData = [
          {
            metric: 'Total API Calls',
            value: auditStats?.total || 0,
            category: 'audit',
            timestamp: new Date().toISOString(),
          },
          {
            metric: 'Today API Calls',
            value: auditStats?.today || 0,
            category: 'audit',
            timestamp: new Date().toISOString(),
          },
          {
            metric: 'This Week API Calls',
            value: auditStats?.week || 0,
            category: 'audit',
            timestamp: new Date().toISOString(),
          },
          {
            metric: 'Success Rate',
            value: auditStats?.byStatus ? 
              Math.round((auditStats.byStatus.success / (auditStats.byStatus.success + auditStats.byStatus.error)) * 100) : 0,
            category: 'audit',
            timestamp: new Date().toISOString(),
          },
          ...(queueHealth?.queues ? Object.entries(queueHealth.queues).map(([key, queue]: [string, any]) => ({
            metric: `${key} Queue - Waiting`,
            value: queue.waiting || 0,
            category: 'queue',
            timestamp: queueHealth.timestamp,
          })) : []),
          ...(queueHealth?.queues ? Object.entries(queueHealth.queues).map(([key, queue]: [string, any]) => ({
            metric: `${key} Queue - Active`,
            value: queue.active || 0,
            category: 'queue',
            timestamp: queueHealth.timestamp,
          })) : []),
          ...(queueHealth?.queues ? Object.entries(queueHealth.queues).map(([key, queue]: [string, any]) => ({
            metric: `${key} Queue - Completed`,
            value: queue.completed || 0,
            category: 'queue',
            timestamp: queueHealth.timestamp,
          })) : []),
          ...(queueHealth?.queues ? Object.entries(queueHealth.queues).map(([key, queue]: [string, any]) => ({
            metric: `${key} Queue - Failed`,
            value: queue.failed || 0,
            category: 'queue',
            timestamp: queueHealth.timestamp,
          })) : []),
        ];

        ExportApiService.exportToCSV(flatData, 'dashboard-overview', [
          'metric', 'value', 'category', 'timestamp'
        ]);
      }
    } catch (err) {
      console.error('Error exporting overview data:', err);
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'healthy':
  //       return 'success';
  //     case 'warning':
  //       return 'warning';
  //     case 'error':
  //       return 'destructive';
  //     default:
  //       return 'secondary';
  //   }
  // };

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your Salesforce Middleware API performance and health
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your Salesforce Middleware API performance and health
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your Salesforce Middleware API performance and health
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportOverview('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportOverview('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon('healthy')}
              <Badge variant="success">
                HEALTHY
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon('healthy')}
              <Badge variant="success">
                HEALTHY
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected and responsive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon('healthy')}
              <Badge variant="success">
                HEALTHY
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cache operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue System</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(queueHealth?.status === 'healthy' ? 'healthy' : 'warning')}
              <Badge variant={queueHealth?.status === 'healthy' ? 'success' : 'warning'}>
                {queueHealth?.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {queueHealth?.status === 'healthy' ? 'Processing normally' : 'Check queue status'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total API Calls"
          value={auditStats?.total?.toLocaleString() || '0'}
          change={12.5}
          changeType="increase"
          description="All time"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Today's Calls"
          value={auditStats?.today?.toLocaleString() || '0'}
          change={8.1}
          changeType="increase"
          description="Last 24 hours"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Success Rate"
          value={auditStats?.byStatus ? 
            `${Math.round((auditStats.byStatus.success / (auditStats.byStatus.success + auditStats.byStatus.error)) * 100)}%` : 
            'N/A'
          }
          change={0.3}
          changeType="increase"
          description="API response success rate"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="This Week"
          value={auditStats?.week?.toLocaleString() || '0'}
          change={5.2}
          changeType="increase"
          description="Last 7 days"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Queue Status */}
      <div className="grid gap-4 md:grid-cols-3">
        {queueHealth?.queues && Object.entries(queueHealth.queues).map(([key, queue]: [string, any]) => {
          const queueName = key.charAt(0).toUpperCase() + key.slice(1) + ' Queue';
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{queueName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Waiting</span>
                    <span className="font-medium">{queue.waiting || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active</span>
                    <span className="font-medium">{queue.active || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium text-green-600">{queue.completed || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed</span>
                    <span className="font-medium text-red-600">{queue.failed || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Health</span>
                    <Badge variant={queue.health === 'healthy' ? 'success' : queue.health === 'warning' ? 'warning' : 'destructive'}>
                      {queue.health?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
