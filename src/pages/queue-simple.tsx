import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RefreshCw, 
  Workflow, 
  AlertTriangle,
  Activity,
  Download
} from 'lucide-react';
import { QueueApiService, type QueueHealth, type Job } from '@/services/api/queue/queue-api';
import { toast } from 'sonner';

export default function QueuePageSimple() {
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [health, jobs] = await Promise.all([
        QueueApiService.getQueueHealth(),
        QueueApiService.getJobs({ limit: 10, page: 1 })
      ]);

      setQueueHealth(health);
      setRecentJobs(jobs.data);
    } catch (error) {
      console.error('Failed to load queue data:', error);
      setError('Failed to load queue data');
      toast.error('Failed to load queue data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadQueueData();
  };

  const handleForceFlush = async () => {
    try {
      await QueueApiService.forceFlushBatch();
      toast.success('Batch flush completed');
      loadQueueData(); // Refresh data
    } catch (error) {
      console.error('Failed to force flush:', error);
      toast.error('Failed to force flush batch');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default">Active</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'active':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'waiting':
        return <Badge variant="outline">Waiting</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'waiting':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Queue Management</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading queue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Queue Management</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage background job processing
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salesforce Queue</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueHealth?.queues?.salesforce?.waiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
            {getStatusBadge(queueHealth?.queues?.salesforce?.health || 'unknown')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Queue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueHealth?.queues?.email?.waiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
            {getStatusBadge(queueHealth?.queues?.email?.health || 'unknown')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueHealth?.queues?.notifications?.waiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
            {getStatusBadge(queueHealth?.queues?.notifications?.health || 'unknown')}
          </CardContent>
        </Card>
      </div>

      {/* Queue Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={handleForceFlush}>
              <Play className="h-4 w-4 mr-2" />
              Force Flush Batch
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="outline" onClick={() => {
              // TODO: Implement export functionality
              toast.info('Export functionality coming soon');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${getJobStatusColor(job.status)}`}></div>
                    <div>
                      <div className="font-medium">{job.name || `${job.queue} Job`}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.status === 'active' ? 'Processing' : 
                         job.status === 'completed' ? `Completed ${formatTimestamp(job.finishedOn || job.processedOn || job.timestamp)}` :
                         job.status === 'failed' ? `Failed ${formatTimestamp(job.finishedOn || job.processedOn || job.timestamp)}` :
                         `Waiting since ${formatTimestamp(job.timestamp)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getJobStatusBadge(job.status)}
                    {job.attemptsMade > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {job.attemptsMade} attempts
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent jobs found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
