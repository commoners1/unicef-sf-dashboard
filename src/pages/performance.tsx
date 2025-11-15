import { useState, useEffect } from 'react';
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
  useEffect(() => {
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-muted-foreground">Real-time system performance metrics and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" style={{ display: isLoading ? 'inline' : 'none' }} />
            {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>
      {error && (
        <Card><CardContent className="p-6 text-center text-red-600">{error}</CardContent></Card>
      )}
      {/* Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? metrics.jobsPerSecond.toFixed(2) : '--'} jobs/s</div>
            {metrics && getStatusBadge('jobsPerSecond', metrics.jobsPerSecond)}
            <div className="text-xs text-muted-foreground mt-1">Jobs completed per second</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? `${(metrics.errorRate*100).toFixed(2)}%` : '--'}</div>
            {metrics && getStatusBadge('errorRate', metrics.errorRate)}
            <div className="text-xs text-muted-foreground mt-1">Share of failed jobs/requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? `${metrics.avgProcessingTime} ms` : '--'}</div>
            {metrics && getStatusBadge('avgProcessingTime', metrics.avgProcessingTime)}
            <div className="text-xs text-muted-foreground mt-1">Time spent on average per job/request</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Depth</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? metrics.queueDepth : '--'}</div>
            <div className="text-xs text-muted-foreground mt-1">Jobs currently waiting across all queues</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? (metrics.cpuUsage*100).toFixed(1)+'%' : '--'}</div>
            {metrics && getStatusBadge('cpuUsage', metrics.cpuUsage)}
            <div className="text-xs text-muted-foreground mt-1">Current Node.js process CPU utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? (metrics.memoryUsage*100).toFixed(1)+'%' : '--'}</div>
            {metrics && getStatusBadge('memoryUsage', metrics.memoryUsage)}
            <div className="text-xs text-muted-foreground mt-1">Current Node.js memory usage</div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 && <div className="text-sm text-muted-foreground">No alerts.</div>}
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle 
                    className={`h-4 w-4 ${
                      alert.type === 'critical' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} 
                  />
                  <div>
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
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
