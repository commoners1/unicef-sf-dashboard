import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/loading';
import { MonitoringApiService, type MonitoringHealth, type DetailedStats } from '@/services/api/monitoring/monitoring-api';
import { 
  Monitor, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';

export default function MonitoringPage() {
  const [healthData, setHealthData] = useState<MonitoringHealth | null>(null);
  const [_detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load monitoring data
  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [health, stats] = await Promise.all([
        MonitoringApiService.getHealth(),
        MonitoringApiService.getDetailedStats(),
      ]);
      setHealthData(health);
      setDetailedStats(stats);
      setIsConnected(true);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
      setIsConnected(false);
      console.error('Error loading monitoring data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadMonitoringData();
  }, []);

  // Auto-refresh every 5 seconds for real-time monitoring
  useEffect(() => {
    const interval = setInterval(loadMonitoringData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle queue actions
  const handlePauseQueue = async (queueName: string) => {
    try {
      await MonitoringApiService.pauseQueue(queueName);
      loadMonitoringData(); // Refresh data
    } catch (err) {
      console.error('Error pausing queue:', err);
    }
  };

  const handleResumeQueue = async (queueName: string) => {
    try {
      await MonitoringApiService.resumeQueue(queueName);
      loadMonitoringData(); // Refresh data
    } catch (err) {
      console.error('Error resuming queue:', err);
    }
  };

  const handleForceFlush = async () => {
    try {
      await MonitoringApiService.forceFlushBatch();
      loadMonitoringData(); // Refresh data
    } catch (err) {
      console.error('Error forcing flush:', err);
    }
  };

  // Generate recent activity from current data
  const generateRecentActivity = () => {
    if (!healthData) return [];
    
    const activities = [];
    
    // Add queue status changes
    Object.entries(healthData.queues).forEach(([queueName, queue]) => {
      if (queue.active > 0) {
        activities.push({
          id: `${queueName}-active-${Date.now()}`,
          type: 'job_processing',
          message: `${queueName} queue processing ${queue.active} jobs`,
          timestamp: 'now',
          level: 'info'
        });
      }
      if (queue.failed > 0) {
        activities.push({
          id: `${queueName}-failed-${Date.now()}`,
          type: 'job_failed',
          message: `${queueName} queue has ${queue.failed} failed jobs`,
          timestamp: 'now',
          level: 'warning'
        });
      }
    });

    // Add performance alerts
    if (healthData.performance.errorRate > 0.1) {
      activities.push({
        id: 'error-rate-high',
        type: 'performance_warning',
        message: `High error rate detected: ${(healthData.performance.errorRate * 100).toFixed(1)}%`,
        timestamp: 'now',
        level: 'warning'
      });
    }

    return activities.slice(0, 5); // Limit to 5 recent activities
  };

  const recentActivity = generateRecentActivity();

  const getQueueStatusIcon = (queue: any) => {
    if (queue.active > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (queue.paused > 0) {
      return <Pause className="h-4 w-4 text-yellow-500" />;
    } else if (queue.failed > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getQueueStatusBadge = (queue: any) => {
    if (queue.active > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>;
    } else if (queue.paused > 0) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Paused</Badge>;
    } else if (queue.failed > 0) {
      return <Badge variant="destructive">Error</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Idle</Badge>;
    }
  };

  const getActivityIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading && !healthData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        <PageLoading text="Loading monitoring data" subtitle="Fetching system health and performance metrics" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load monitoring data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadMonitoringData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Real-time Monitor</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Live monitoring of queue processing and system health
              {lastUpdate && (
                <span className="block sm:inline sm:ml-2 text-xs mt-1 sm:mt-0">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleForceFlush} className="flex-1 sm:flex-initial">
                <Settings className="h-4 w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Force Flush</span>
              </Button>
              <Button size="sm" onClick={loadMonitoringData} disabled={isLoading} className="flex-1 sm:flex-initial">
                <RefreshCw className={`h-4 w-4 mr-1.5 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData ? `${(healthData.performance.cpuUsage * 100).toFixed(1)}%` : '0%'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${healthData ? healthData.performance.cpuUsage * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData ? `${(healthData.performance.memoryUsage * 100).toFixed(1)}%` : '0%'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${healthData ? healthData.performance.memoryUsage * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Per Second</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData ? healthData.performance.jobsPerSecond.toFixed(2) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Processing rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData ? `${(healthData.performance.errorRate * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Failed jobs rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {healthData && Object.entries(healthData.queues).filter(([key]) => key !== 'total').map(([key, queue]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getQueueStatusIcon(queue)}
                  <span className="capitalize">{key} Queue</span>
                </div>
                {getQueueStatusBadge(queue)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{queue.waiting}</div>
                    <div className="text-xs text-muted-foreground">Waiting</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{queue.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{queue.completed.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{queue.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delayed</span>
                    <span className="font-medium">{'delayed' in queue ? queue.delayed : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Processing Time</span>
                    <span className="font-medium">
                      {'avgProcessingTime' in queue && queue.avgProcessingTime ? `${queue.avgProcessingTime.toFixed(0)}ms` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleResumeQueue(key)}
                    disabled={('paused' in queue ? queue.paused : 0) === 0}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handlePauseQueue(key)}
                    disabled={queue.active === 0 && queue.waiting === 0}
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
