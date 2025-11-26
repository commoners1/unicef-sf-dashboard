import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Globe, 
  Shield, 
  Key, 
  Users, 
  Activity, 
  Workflow, 
  Heart,
  Database,
  FileText,
  Settings,
  AlertTriangle,
  Calendar,
  BarChart3,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { ResponsiveTable } from '@/components/shared/responsive-table';
// import { EndpointsApiService } from '@/services/api/endpoints/endpoints-api'; // Commented out - endpoint doesn't exist yet

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: 'None' | 'JWT' | 'API Key';
  category: string;
  icon: React.ReactNode;
}

// Comprehensive endpoints list - easily expandable
const getAllEndpoints = (): Endpoint[] => [
  // System & Health
  {
    method: 'GET',
    path: '/',
    description: 'API welcome message and information',
    auth: 'None',
    category: 'System',
    icon: <Globe className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/health',
    description: 'System health check and status',
    auth: 'None',
    category: 'System',
    icon: <Heart className="h-4 w-4" />
  },

  // Authentication
  {
    method: 'POST',
    path: '/auth/register',
    description: 'Register a new user account',
    auth: 'None',
    category: 'Authentication',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/auth/login',
    description: 'Authenticate user and get JWT token',
    auth: 'None',
    category: 'Authentication',
    icon: <Shield className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/auth/logout',
    description: 'Logout user and invalidate session',
    auth: 'JWT',
    category: 'Authentication',
    icon: <Shield className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    description: 'Refresh JWT access token',
    auth: 'JWT',
    category: 'Authentication',
    icon: <RefreshCw className="h-4 w-4" />
  },

  // User Management
  {
    method: 'GET',
    path: '/user/profile',
    description: 'Get current user profile information',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'PUT',
    path: '/user/profile',
    description: 'Update user profile information',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/user/all',
    description: 'Get all users with pagination (Admin only)',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/user/:id',
    description: 'Get user details by ID',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/user/:id/role',
    description: 'Update user role (Admin only)',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/user/roles/available',
    description: 'Get list of available user roles',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },

  // API Key Management
  {
    method: 'POST',
    path: '/api-key/generate',
    description: 'Generate a new API key with permissions',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/api-key/keys',
    description: 'Get all user API keys',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/api-key/keys/:environment',
    description: 'Get API keys filtered by environment',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/api-key/revoke',
    description: 'Revoke an active API key',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/api-key/activate',
    description: 'Reactivate a revoked API key',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'DELETE',
    path: '/api-key/:id',
    description: 'Permanently delete an API key',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },

  // Settings
  {
    method: 'GET',
    path: '/settings',
    description: 'Get all system settings',
    auth: 'JWT',
    category: 'Settings',
    icon: <Settings className="h-4 w-4" />
  },
  {
    method: 'PUT',
    path: '/settings',
    description: 'Update system settings (Admin only)',
    auth: 'JWT',
    category: 'Settings',
    icon: <Settings className="h-4 w-4" />
  },

  // Audit & Logs
  {
    method: 'GET',
    path: '/audit/logs',
    description: 'Get user audit logs with pagination',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/stats',
    description: 'Get user audit statistics',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/dashboard/stats',
    description: 'Get dashboard audit statistics (Admin)',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/dashboard/logs',
    description: 'Get all audit logs with filters (Admin)',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/dashboard/salesforce-logs',
    description: 'Get Salesforce-specific audit logs (Admin)',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/dashboard/salesforce-logs/stats',
    description: 'Get Salesforce logs statistics (Admin)',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/cron-jobs',
    description: 'Get undelivered cron job data',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/audit/mark-delivered',
    description: 'Mark cron jobs as delivered',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/actions',
    description: 'Get available audit action types',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/methods',
    description: 'Get available HTTP methods in audit logs',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/status-codes',
    description: 'Get available HTTP status codes',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/salesforce-logs/actions',
    description: 'Get Salesforce-specific audit actions',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/salesforce-logs/methods',
    description: 'Get methods used in Salesforce logs',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/salesforce-logs/status-codes',
    description: 'Get status codes from Salesforce logs',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/analytics/usage-stats',
    description: 'Get API usage statistics',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/analytics/hourly-usage',
    description: 'Get hourly API usage breakdown',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/analytics/top-endpoints',
    description: 'Get most frequently used endpoints',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/analytics/user-activity',
    description: 'Get user activity analytics',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/audit/export',
    description: 'Export audit logs in CSV, JSON, or XLSX format',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },

  // Queue Management
  {
    method: 'GET',
    path: '/queue/monitor/health',
    description: 'Get queue health status and metrics',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <Heart className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/monitor/detailed',
    description: 'Get detailed queue statistics and performance',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <Activity className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/monitor/metrics',
    description: 'Get queue performance metrics',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/monitor/alerts',
    description: 'Get queue alerts and warnings',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/queue/monitor/force-flush',
    description: 'Force flush batch processing queue',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/stats',
    description: 'Get overall queue statistics',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/counts',
    description: 'Get job counts by status and queue',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/performance',
    description: 'Get queue performance metrics',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <Activity className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/jobs',
    description: 'Get queue jobs with filters and pagination',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/jobs/:id',
    description: 'Get specific job details by ID',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/queue/jobs/:id/retry',
    description: 'Retry a failed job',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <RefreshCw className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/queue/jobs/export',
    description: 'Export queue jobs in CSV, JSON, or XLSX format',
    auth: 'JWT',
    category: 'Queue Management',
    icon: <FileText className="h-4 w-4" />
  },

  // Cron Jobs
  {
    method: 'GET',
    path: '/cron-jobs',
    description: 'Get all cron jobs with pagination and filters',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/cron-jobs/stats',
    description: 'Get cron job statistics',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/cron-jobs/states',
    description: 'Get all cron job states',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <Activity className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/cron-jobs/:type/state',
    description: 'Get specific cron job state by type',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <Activity className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/cron-jobs/schedules',
    description: 'Get all cron job schedules',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/cron-jobs/history',
    description: 'Get cron job execution history',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/cron-jobs/:type/run',
    description: 'Manually trigger a cron job',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <RefreshCw className="h-4 w-4" />
  },
  {
    method: 'PUT',
    path: '/cron-jobs/:type/toggle',
    description: 'Enable or disable a cron job',
    auth: 'JWT',
    category: 'Cron Jobs',
    icon: <Activity className="h-4 w-4" />
  },

  // Errors
  {
    method: 'GET',
    path: '/errors',
    description: 'Get error logs with filters and pagination',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/stats',
    description: 'Get error statistics and counts',
    auth: 'JWT',
    category: 'Errors',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/trends',
    description: 'Get error trends over time',
    auth: 'JWT',
    category: 'Errors',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/sources',
    description: 'Get list of error sources',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/types',
    description: 'Get list of error types',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/environments',
    description: 'Get list of error environments',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/:id',
    description: 'Get error details by ID',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/:id/details',
    description: 'Get detailed error information with stack trace',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/errors/:id/similar',
    description: 'Get similar errors',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'PATCH',
    path: '/errors/:id/resolve',
    description: 'Mark error as resolved',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'PATCH',
    path: '/errors/:id/unresolve',
    description: 'Mark error as unresolved',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'DELETE',
    path: '/errors/:id',
    description: 'Delete an error log',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'DELETE',
    path: '/errors/bulk',
    description: 'Bulk delete errors',
    auth: 'JWT',
    category: 'Errors',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/errors/export',
    description: 'Export errors in CSV or JSON format',
    auth: 'JWT',
    category: 'Errors',
    icon: <FileText className="h-4 w-4" />
  },

  // Reports
  {
    method: 'GET',
    path: '/reports',
    description: 'Get all available reports',
    auth: 'JWT',
    category: 'Reports',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/reports/:id/generate',
    description: 'Generate a report by ID',
    auth: 'JWT',
    category: 'Reports',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/reports/:id/download',
    description: 'Download a generated report',
    auth: 'JWT',
    category: 'Reports',
    icon: <FileText className="h-4 w-4" />
  },

  // Salesforce Integration
  {
    method: 'GET',
    path: '/v1/salesforce/token',
    description: 'Get Salesforce access token',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/v1/salesforce/token',
    description: 'Refresh Salesforce access token',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/v1/salesforce/pledge',
    description: 'Call Salesforce Pledge API',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/v1/salesforce/pledge-charge',
    description: 'Call Salesforce Pledge Charge API',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/v1/salesforce/oneoff',
    description: 'Call Salesforce One Off API',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/v1/salesforce/payment-link',
    description: 'Call Xendit Payment Link API',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/v1/salesforce/pledge-cron-jobs',
    description: 'Get Pledge cron job data',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/v1/salesforce/oneoff-cron-jobs',
    description: 'Get One Off cron job data',
    auth: 'API Key',
    category: 'Salesforce Integration',
    icon: <Database className="h-4 w-4" />
  },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'PATCH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getAuthColor = (auth: string) => {
  switch (auth) {
    case 'None': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'JWT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'API Key': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEndpoints = async () => {
      try {
        setLoading(true);
        setError(null);
        setEndpoints(getAllEndpoints());
      } catch (err) {
        console.error('Error loading endpoints:', err);
        setError('Failed to load endpoints');
        setEndpoints(getAllEndpoints());
      } finally {
        setLoading(false);
      }
    };

    loadEndpoints();
  }, []);

  const renderEndpointsTable = (endpointsList: Endpoint[]) => (
    <ResponsiveTable
      data={endpointsList}
      getRowKey={(_, index) => `endpoint-${index}`}
      renderMobileCard={(endpoint) => ({
        id: (
          <div className="flex items-center gap-2">
            <Badge className={getMethodColor(endpoint.method)}>
              {endpoint.method}
            </Badge>
            <code className="text-xs font-mono truncate">{endpoint.path}</code>
          </div>
        ),
        primaryFields: [
          {
            label: 'Description',
            value: <span className="text-xs">{endpoint.description}</span>,
          },
          {
            label: 'Authentication',
            value: <Badge className={getAuthColor(endpoint.auth)}>{endpoint.auth}</Badge>,
          },
        ],
      })}
      emptyMessage="No endpoints found"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Authentication</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpointsList.map((endpoint, index) => (
            <TableRow key={index}>
              <TableCell>
                <Badge className={getMethodColor(endpoint.method)}>
                  {endpoint.method}
                </Badge>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                  {endpoint.path}
                </code>
              </TableCell>
              <TableCell className="max-w-md">
                {endpoint.description}
              </TableCell>
              <TableCell>
                <Badge className={getAuthColor(endpoint.auth)}>
                  {endpoint.auth}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTable>
  );

  const categories = [
    { value: 'authentication', label: 'Auth', icon: Shield, includes: ['Authentication', 'User Management'] },
    { value: 'management', label: 'Management', icon: Users, includes: ['API Key Management', 'Settings', 'Audit & Logs'] },
    { value: 'integration', label: 'Integration', icon: Database, includes: ['Salesforce Integration', 'Queue Management'] },
    { value: 'system', label: 'System', icon: Activity, includes: ['System', 'Cron Jobs', 'Errors', 'Reports'] },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">API Endpoints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive list of all available API endpoints
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <Badge variant="outline" className="text-base">
            {endpoints.length} total endpoints
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat.value} 
              value={cat.value} 
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5"
            >
              <cat.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="space-y-4">
            {cat.includes.map((categoryName) => {
              const categoryEndpoints = endpoints.filter(ep => ep.category === categoryName);
              if (categoryEndpoints.length === 0) return null;

              return (
                <Card key={categoryName}>
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                      <div className="flex items-center gap-2">
                        {categoryEndpoints[0]?.icon}
                        <span className="text-base sm:text-lg">{categoryName}</span>
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm sm:ml-2">
                        {categoryEndpoints.length} endpoint{categoryEndpoints.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderEndpointsTable(categoryEndpoints)}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-base sm:text-lg">API Usage Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Authentication Types</h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 flex-shrink-0">None</Badge>
                      <span>No authentication required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex-shrink-0">JWT</Badge>
                      <span>Requires JWT token in Authorization header: <code className="text-xs">Bearer &lt;token&gt;</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex-shrink-0">API Key</Badge>
                      <span>Requires API key in <code className="text-xs">X-API-Key</code> header</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">HTTP Methods</h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex-shrink-0">GET</Badge>
                      <span>Retrieve data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0">POST</Badge>
                      <span>Create or process data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex-shrink-0">PUT</Badge>
                      <span>Update data (full replacement)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex-shrink-0">PATCH</Badge>
                      <span>Update data (partial)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex-shrink-0">DELETE</Badge>
                      <span>Remove data</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Base URL</h4>
                <code className="text-xs sm:text-sm bg-muted px-2 py-1 rounded break-all">
                  {typeof window !== 'undefined' ? window.location.origin.replace('3000', '3001') : 'http://localhost:3001'}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
