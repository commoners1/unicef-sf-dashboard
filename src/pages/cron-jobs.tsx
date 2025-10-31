import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Clock, 
  XCircle, 
  RefreshCw, 
  Play,
  Zap,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CronJobsApiService, type CronJob, type CronJobStats, type CronJobHistory, type CronSchedule } from '@/services/cron-jobs-api';

const CronJobsPage = () => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronJobStats | null>(null);
  const [history, setHistory] = useState<CronJobHistory[]>([]);
  const [schedules, setSchedules] = useState<CronSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [togglingJobs, setTogglingJobs] = useState<Set<string>>(new Set());

  // Load cron jobs data
  const loadCronJobs = async (page = 1, status?: string, type?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await CronJobsApiService.getCronJobs({
        page,
        limit: pagination.limit,
        status,
        type,
      });
      
      setCronJobs(response.jobs);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cron jobs';
      setError(errorMessage);
      console.error('Error loading cron jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await CronJobsApiService.getCronJobStats();
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Load history
  const loadHistory = async (page = 1, jobId?: string) => {
    try {
      const response = await CronJobsApiService.getCronJobHistory({
        page,
        limit: historyPagination.limit,
        jobId,
      });
      
      setHistory(response.history);
      setHistoryPagination(response.pagination);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  // Load schedules
  const loadSchedules = async () => {
    try {
      const response = await CronJobsApiService.getCronSchedules();
      setSchedules(response);
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    await Promise.all([
      loadCronJobs(),
      loadStats(),
      loadHistory(),
      loadSchedules(),
    ]);
  };

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    loadAllData();
  };

  // Handle run job
  const handleRunJob = async (jobType: string) => {
    try {
      await CronJobsApiService.runCronJob(jobType);
      // Refresh data after running
      loadAllData();
    } catch (err) {
      console.error('Error running job:', err);
    }
  };

  // Handle toggle job
  const handleToggleJob = async (jobType: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled;
    
    // Optimistically update the UI
    setSchedules(prev => prev.map(schedule => 
      schedule.type === jobType 
        ? { ...schedule, isEnabled: newEnabled }
        : schedule
    ));
    
    // Track which job is being toggled
    setTogglingJobs(prev => new Set(prev).add(jobType));
    
    try {
      await CronJobsApiService.toggleCronJob(jobType, newEnabled);
      // Refresh schedules to get the latest state
      await loadSchedules();
    } catch (err) {
      console.error('Error toggling cron job:', err);
      // Revert on error
      setSchedules(prev => prev.map(schedule => 
        schedule.type === jobType 
          ? { ...schedule, isEnabled: currentEnabled }
          : schedule
      ));
    } finally {
      setTogglingJobs(prev => {
        const next = new Set(prev);
        next.delete(jobType);
        return next;
      });
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get last status badge
  const getLastStatusBadge = (status: string | null) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format duration
  const formatDuration = (duration: number | null) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Cron Jobs</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cron Jobs</h1>
          <p className="text-muted-foreground">Manage and monitor scheduled tasks</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats removed per request */}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Jobs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cronJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{job.name}</h4>
                            {getStatusBadge(job.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{job.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Last run: {job.lastRun ? formatDistanceToNow(new Date(job.lastRun), { addSuffix: true }) : 'Never'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getLastStatusBadge(job.lastStatus)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRunJob(job.type)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Runs</span>
                      <span className="font-medium">{stats.totalRuns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Duration</span>
                      <span className="font-medium">{formatDuration(stats.averageDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed Jobs</span>
                      <span className="font-medium text-red-500">{stats.error}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paused Jobs</span>
                      <span className="font-medium text-yellow-500">{stats.paused}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Job {entry.jobId}</span>
                          {getLastStatusBadge(entry.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Started: {formatDistanceToNow(new Date(entry.startedAt), { addSuffix: true })}
                        </p>
                        {entry.message && (
                          <p className="text-sm text-muted-foreground">{entry.message}</p>
                        )}
                        {entry.error && (
                          <p className="text-sm text-red-500">{entry.error}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDuration(entry.duration)}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.completedAt ? formatDistanceToNow(new Date(entry.completedAt), { addSuffix: true }) : 'Running'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => {
                    const isToggling = togglingJobs.has(schedule.type);
                    return (
                      <div key={schedule.name} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold">{schedule.name}</h3>
                              <Badge variant="outline">{schedule.type}</Badge>
                              {schedule.isEnabled ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                              ) : (
                                <Badge variant="secondary">Disabled</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Schedule:</span>
                                <p className="font-mono">{schedule.schedule}</p>
                              </div>
                              {schedule.nextRun && (
                                <div>
                                  <span className="text-muted-foreground">Next Run:</span>
                                  <p className="text-muted-foreground">
                                    {formatDistanceToNow(new Date(schedule.nextRun), { addSuffix: true })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : null}
                            <div className="flex flex-col items-end space-y-1">
                              <Switch
                                checked={schedule.isEnabled}
                                onCheckedChange={() => handleToggleJob(schedule.type, schedule.isEnabled)}
                                disabled={isToggling}
                              />
                              <span className="text-xs text-muted-foreground">
                                {schedule.isEnabled ? 'On' : 'Off'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CronJobsPage;