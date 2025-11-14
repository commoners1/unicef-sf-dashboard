import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QueueApiService } from '@/services/queue-api';
import type { QueueHealth, DetailedStats } from '@/services/queue-api';
import { ExportApiService } from '@/services/export-api';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Workflow, 
  AlertTriangle,
  Activity,
  Download
} from 'lucide-react';

export function QueuePage() {
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load queue data
  const loadQueueData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [health, stats] = await Promise.all([
        QueueApiService.getQueueHealth(),
        QueueApiService.getDetailedStats(),
      ]);
      setQueueHealth(health);
      setDetailedStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue data');
      console.error('Error loading queue data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadQueueData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadQueueData, 30000);
    return () => clearInterval(interval);
  }, []);
  const handlePauseQueue = (_queueName: string) => {
    // TODO: Implement queue pause functionality
  };

  const handleResumeQueue = (_queueName: string) => {
    // TODO: Implement queue resume functionality
  };

  // const handleRetryJob = (jobId: string) => {
  //   console.log('Retry job:', jobId);
  //   // TODO: Implement job retry functionality
  // };

  // const handleDeleteJob = (jobId: string) => {
  //   console.log('Delete job:', jobId);
  //   // TODO: Implement job deletion functionality
  // };

  const handleForceFlush = async () => {
    try {
      await QueueApiService.forceFlushBatch();
      // Refresh data after flush
      loadQueueData();
    } catch (err) {
      console.error('Error forcing flush:', err);
    }
  };

  const handleExportQueueData = async (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
    try {
      const exportData = {
        queueHealth,
        detailedStats,
        timestamp: new Date().toISOString(),
      };

      if (format === 'json') {
        ExportApiService.exportToJSON([exportData], 'queue-data');
      } else {
        // Convert to flat structure for CSV
        const flatData = queueHealth ? Object.entries(queueHealth.queues).map(([key, queue]) => ({
          queueName: key,
          waiting: queue.waiting,
          active: queue.active,
          completed: queue.completed,
          failed: queue.failed,
          delayed: queue.delayed,
          paused: queue.paused,
          health: queue.health,
          timestamp: queueHealth.timestamp,
        })) : [];

        ExportApiService.exportToCSV(flatData, 'queue-data', [
          'queueName', 'waiting', 'active', 'completed', 'failed', 'delayed', 'paused', 'health', 'timestamp'
        ]);
      }
    } catch (err) {
      console.error('Error exporting queue data:', err);
    }
  };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'processing':
  //       return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
  //     case 'completed':
  //       return <CheckCircle className="h-4 w-4 text-green-500" />;
  //     case 'failed':
  //       return <XCircle className="h-4 w-4 text-red-500" />;
  //     case 'queued':
  //       return <Clock className="h-4 w-4 text-yellow-500" />;
  //     default:
  //       return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  //   }
  // };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'processing':
  //       return 'default';
  //     case 'completed':
  //       return 'success';
  //     case 'failed':
  //       return 'destructive';
  //     case 'queued':
  //       return 'warning';
  //     default:
  //       return 'secondary';
  //   }
  // };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage background job processing
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
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage background job processing
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
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage background job processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadQueueData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportQueueData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportQueueData('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={handleForceFlush}
          >
            <Activity className="h-4 w-4 mr-2" />
            Force Flush
          </Button>
        </div>
      </div>

      {/* Queue Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {queueHealth && Object.entries(queueHealth.queues).map(([key, queue]) => {
          const queueName = key.charAt(0).toUpperCase() + key.slice(1) + ' Queue';
          const isPaused = queue.paused > 0;
          // const totalJobs = queue.waiting + queue.active + queue.completed + queue.failed;
          const processingRate = detailedStats?.performance?.throughput || 0;
          
          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{queueName}</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={queue.health === 'healthy' ? 'success' : queue.health === 'warning' ? 'warning' : 'destructive'}>
                        {queue.health.toUpperCase()}
                      </Badge>
                      {isPaused ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResumeQueue(key)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePauseQueue(key)}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Waiting</span>
                      <span className="font-medium">{queue.waiting}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active</span>
                      <span className="font-medium">{queue.active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-medium text-green-600">{queue.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed</span>
                      <span className="font-medium text-red-600">{queue.failed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delayed</span>
                      <span className="font-medium text-yellow-600">{queue.delayed}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Throughput</span>
                      <span>{processingRate.toFixed(1)} jobs/min</span>
                    </div>
                    <Progress value={Math.min(processingRate * 10, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      {detailedStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Throughput</span>
                  <span className="font-medium">{detailedStats.performance.throughput.toFixed(1)} jobs/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Processing Time</span>
                  <span className="font-medium">{detailedStats.performance.avgProcessingTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate</span>
                  <span className="font-medium">{(detailedStats.performance.errorRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Queue Depth</span>
                  <span className="font-medium">{detailedStats.performance.queueDepth}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {detailedStats.alerts.length > 0 ? (
                  detailedStats.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 border rounded-lg"
                    >
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.type === 'critical' ? 'text-red-500' :
                        alert.type === 'error' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{alert.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {alert.queue} • {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No active alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
