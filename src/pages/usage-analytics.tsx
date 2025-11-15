import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Activity,
  Download,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { AnalyticsApiService, type UsageStats, type HourlyUsage, type TopEndpoint, type UserActivity } from '@/services/api/analytics/analytics-api';
import { toast } from 'sonner';

export default function UsageAnalyticsPage() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyUsage[]>([]);
  const [topEndpoints, setTopEndpoints] = useState<TopEndpoint[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [stats, hourly, endpoints, activity] = await Promise.all([
        AnalyticsApiService.getUsageStats(),
        AnalyticsApiService.getHourlyUsage(),
        AnalyticsApiService.getTopEndpoints(),
        AnalyticsApiService.getUserActivity(),
      ]);

      setUsageStats(stats);
      setHourlyData(hourly);
      setTopEndpoints(endpoints);
      setUserActivity(activity);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const getMaxHeight = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

  const maxRequests = hourlyData.length > 0 ? Math.max(...hourlyData.map(d => d.requests)) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Usage Analytics</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Usage Analytics</h1>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Usage Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            API usage patterns, trends, and user activity insights
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex-1 sm:flex-initial min-w-[100px]">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Calendar className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Last 24 Hours</span>
            <span className="sm:hidden">24h</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{usageStats?.totalRequests.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{usageStats?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{usageStats?.averageResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Average duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Peak Hourly</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{usageStats?.peakHourlyRequests.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Peak requests/hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Error Rate</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{usageStats?.errorRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Failed requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Hourly Request Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hourlyData.length > 0 ? (
              <>
                <div className="flex items-end space-x-0.5 sm:space-x-1 h-24 sm:h-32 overflow-x-auto">
                  {hourlyData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center min-w-[20px] sm:min-w-0">
                      <div 
                        className="w-full bg-primary rounded-t"
                        style={{ 
                          height: `${getMaxHeight(data.requests, maxRequests)}%`,
                          minHeight: '4px'
                        }}
                      ></div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 transform -rotate-45 origin-left whitespace-nowrap">
                        {data.hour}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Midnight</span>
                  <span>Noon</span>
                  <span>Midnight</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hourly data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Top Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {topEndpoints.length > 0 ? (
                topEndpoints.map((endpoint, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <code className="text-xs sm:text-sm bg-muted px-2 py-1 rounded break-all">
                        {endpoint.endpoint}
                      </code>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {endpoint.requests.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${endpoint.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {endpoint.percentage}% of total requests
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No endpoint data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {userActivity.length > 0 ? (
                userActivity.map((user, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{user.user}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Last active: {user.lastActive}
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="font-medium text-sm sm:text-base">{user.requests.toLocaleString()}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">requests</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No user activity data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
