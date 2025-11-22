import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
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
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function UsageAnalyticsPage() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyUsage[]>([]);
  const [topEndpoints, setTopEndpoints] = useState<TopEndpoint[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    
    // Check screen size for responsive chart
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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

  const maxRequests = hourlyData.length > 0 ? Math.max(...hourlyData.map(d => d.requests || 0)) : 0;
  
  // Format data for Recharts and adjust time labels for GMT+7
  const chartData = hourlyData.map(data => {
    // Parse hour string (e.g., "16:44") and add 7 hours for GMT+7
    const [hours, minutes] = data.hour.split(':').map(Number);
    const adjustedDate = new Date();
    adjustedDate.setHours(hours + 7, minutes, 0, 0);
    
    // Format back to HH:MM
    const adjustedHour = `${adjustedDate.getHours().toString().padStart(2, '0')}:${adjustedDate.getMinutes().toString().padStart(2, '0')}`;
    
    return {
      hour: adjustedHour,
      requests: data.requests || 0,
      users: data.users || 0,
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Usage Analytics</h1>
        </div>
        <PageLoading text="Loading analytics data" subtitle="Fetching usage statistics and trends" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-0 pb-6 sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Usage Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            API usage patterns, trends, and user activity insights
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex-1 sm:flex-initial min-w-[100px]">
            <RefreshCw className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Calendar className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Last 24 Hours</span>
            <span className="sm:hidden">24h</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Filter className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Download className="h-4 w-4 mr-1.5 sm:mr-2" />
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
          {hourlyData.length > 0 && maxRequests > 0 ? (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={isMobile ? 1 : 0}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Requests']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRequests)"
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-border/50 mt-2">
                <span className="font-medium">Midnight</span>
                <span className="font-medium">Noon</span>
                <span className="font-medium">Midnight</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {hourlyData.length === 0 ? 'No hourly data available' : 'No request data to display'}
            </div>
          )}
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
