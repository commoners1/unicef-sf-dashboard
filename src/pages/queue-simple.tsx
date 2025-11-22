import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/loading';
import { 
  Play, 
  RefreshCw, 
  Workflow, 
  AlertTriangle,
  Activity,
  Download
} from 'lucide-react';
import { useDataFetching } from '@/hooks';
import { QueueApiService, type QueueHealth } from '@/services/api/queue/queue-api';
import { toast } from 'sonner';

export default function QueuePageSimple() {
  // Use the new data fetching hooks
  const {
    data: queueHealth,
    loading: isLoadingHealth,
    error: healthError,
    fetch: fetchHealth,
  } = useDataFetching<QueueHealth>({
    fetchFn: QueueApiService.getQueueHealth,
    autoFetch: true,
  });

  const {
    data: jobsResponse,
    loading: isLoadingJobs,
    error: jobsError,
    fetch: fetchJobs,
  } = useDataFetching({
    fetchFn: async () => QueueApiService.getJobs({ limit: 10, page: 1 }),
    autoFetch: true,
  });

  const isLoading = isLoadingHealth || isLoadingJobs;
  const error = healthError || jobsError;
  const recentJobs = jobsResponse?.data || [];

  // Combined refresh handler
  const handleRefresh = async () => {
    await Promise.all([fetchHealth(), fetchJobs()]);
  };

  const handleForceFlush = async () => {
    try {
      await QueueApiService.forceFlushBatch();
      toast.success('Batch flush completed');
      await handleRefresh(); // Refresh data
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Queue Management</h1>
        </div>
        <PageLoading text="Loading queue data" subtitle="Fetching job status and queue health information" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Queue Management</h1>
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-0 pb-6 sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Queue Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage background job processing
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} size="sm" className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-1.5 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Salesforce Queue</CardTitle>
            <Workflow className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {queueHealth?.queues?.salesforce?.waiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
            <div className="mt-2">
              {getStatusBadge(queueHealth?.queues?.salesforce?.health || 'unknown')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Email Queue</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {queueHealth?.queues?.email?.waiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
            <div className="mt-2">
              {getStatusBadge(queueHealth?.queues?.email?.health || 'unknown')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Notifications</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {queueHealth?.queues?.notifications?.waiting || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
            <div className="mt-2">
              {getStatusBadge(queueHealth?.queues?.notifications?.health || 'unknown')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Queue Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button onClick={handleForceFlush} size="sm" className="w-full sm:w-auto">
              <Play className="h-4 w-4 mr-2" />
              <span>Flush Batch</span>
            </Button>
            <Button variant="outline" onClick={handleRefresh} size="sm" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" onClick={() => {
              // TODO: Implement export functionality
              toast.info('Export functionality coming soon');
            }} size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getJobStatusColor(job.status)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{job.name || `${job.queue} Job`}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {job.status === 'active' ? 'Processing' : 
                         job.status === 'completed' ? `Completed ${formatTimestamp(job.finishedOn || job.processedOn || job.timestamp)}` :
                         job.status === 'failed' ? `Failed ${formatTimestamp(job.finishedOn || job.processedOn || job.timestamp)}` :
                         `Waiting since ${formatTimestamp(job.timestamp)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:space-x-2 flex-shrink-0">
                    {getJobStatusBadge(job.status)}
                    {job.attemptsMade > 0 && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {job.attemptsMade} attempts
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent jobs found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
