import { useState, useEffect } from 'react';
import { useAutoRefresh } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { PerformanceApiService, type PerformanceMetrics, type PerformanceAlert } from '@/services/api/performance/performance-api';

const METRIC_THRESHOLDS = {
  jobsPerSecond: { warning: 50, critical: 100 },
  errorRate: { warning: 0.03, critical: 0.1 }, // 3%/10%
  avgProcessingTime: { warning: 500, critical: 1000 }, // in ms
  memoryUsage: { warning: 0.8, critical: 0.95 }, // ratio
  cpuUsage: { warning: 0.8, critical: 0.95 },   // ratio
};

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [metricsRes, alertsRes] = await Promise.all([
        PerformanceApiService.getMetrics(),
        PerformanceApiService.getAlerts(),
      ]);
      setMetrics(metricsRes);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  
  // Auto-refresh every 60 seconds
  useAutoRefresh(loadData, { interval: 60000 });

  const handleRefresh = () => { loadData(); };
  // const handleExport = () => { /* TODO: Export feature */ };

  const getStatusBadge = (name: string, value: number) => {
    const thresholds = METRIC_THRESHOLDS[name as keyof typeof METRIC_THRESHOLDS];
    if (!thresholds) return <Badge variant="secondary">Healthy</Badge>;
    if (value >= thresholds.critical) return <Badge variant="destructive">Critical</Badge>;
    if (value >= thresholds.warning) return <Badge variant="default">Warning</Badge>;
    return <Badge variant="secondary">Healthy</Badge>;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-0 pb-6 sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time system performance metrics and analytics</p>
        </div>
        <div className="flex w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading} size="sm" className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-1.5 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      {error && (
        <Card><CardContent className="p-4 sm:p-6 text-center text-red-600 text-sm sm:text-base">{error}</CardContent></Card>
      )}
      {/* Metrics Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics ? metrics.jobsPerSecond.toFixed(2) : '--'} jobs/s</div>
            {metrics && <div className="mt-2">{getStatusBadge('jobsPerSecond', metrics.jobsPerSecond)}</div>}
            <div className="text-xs text-muted-foreground mt-1">Jobs completed per second</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics ? `${(metrics.errorRate*100).toFixed(2)}%` : '--'}</div>
            {metrics && <div className="mt-2">{getStatusBadge('errorRate', metrics.errorRate)}</div>}
            <div className="text-xs text-muted-foreground mt-1">Share of failed jobs/requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Processing Time</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics ? `${metrics.avgProcessingTime} ms` : '--'}</div>
            {metrics && <div className="mt-2">{getStatusBadge('avgProcessingTime', metrics.avgProcessingTime)}</div>}
            <div className="text-xs text-muted-foreground mt-1">Time spent on average per job/request</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Queue Depth</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics ? metrics.queueDepth : '--'}</div>
            <div className="text-xs text-muted-foreground mt-1">Jobs currently waiting across all queues</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics ? (metrics.cpuUsage*100).toFixed(1)+'%' : '--'}</div>
            {metrics && <div className="mt-2">{getStatusBadge('cpuUsage', metrics.cpuUsage)}</div>}
            <div className="text-xs text-muted-foreground mt-1">Current Node.js process CPU utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics ? (metrics.memoryUsage*100).toFixed(1)+'%' : '--'}</div>
            {metrics && <div className="mt-2">{getStatusBadge('memoryUsage', metrics.memoryUsage)}</div>}
            <div className="text-xs text-muted-foreground mt-1">Current Node.js memory usage</div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {alerts.length === 0 && <div className="text-xs sm:text-sm text-muted-foreground py-2">No alerts.</div>}
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 border rounded-lg"
              >
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <AlertTriangle 
                    className={`h-4 w-4 flex-shrink-0 mt-0.5 sm:mt-0 ${
                      alert.type === 'critical' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm break-words">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={alert.resolved ? 'secondary' : 'destructive'} className="text-xs sm:text-sm flex-shrink-0 w-fit">
                  {alert.resolved ? 'Resolved' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
