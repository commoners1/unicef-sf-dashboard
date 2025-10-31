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
  FileText
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: 'None' | 'JWT' | 'API Key';
  category: string;
  icon: React.ReactNode;
}

const endpoints: Endpoint[] = [
  // Health & System
  {
    method: 'GET',
    path: '/health',
    description: 'System health check and status',
    auth: 'None',
    category: 'System',
    icon: <Heart className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/',
    description: 'API welcome message',
    auth: 'None',
    category: 'System',
    icon: <Globe className="h-4 w-4" />
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

  // User Management
  {
    method: 'GET',
    path: '/user/profile',
    description: 'Get current user profile',
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
    description: 'Get all users (Admin only)',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/user/:id',
    description: 'Get user by ID',
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
    description: 'Get available user roles',
    auth: 'JWT',
    category: 'User Management',
    icon: <Users className="h-4 w-4" />
  },

  // API Key Management
  {
    method: 'POST',
    path: '/api-key/generate',
    description: 'Generate a new API key',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/api-key/keys',
    description: 'Get user API keys',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/api-key/keys/:environment',
    description: 'Get API keys by environment',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/api-key/revoke',
    description: 'Revoke an API key',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/api-key/activate',
    description: 'Activate a revoked API key',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },
  {
    method: 'DELETE',
    path: '/api-key/:id',
    description: 'Delete an API key permanently',
    auth: 'JWT',
    category: 'API Key Management',
    icon: <Key className="h-4 w-4" />
  },

  // Audit & Logs
  {
    method: 'GET',
    path: '/audit/logs',
    description: 'Get user audit logs',
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
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/cron-jobs',
    description: 'Get undelivered cron job data',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
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
    path: '/audit/dashboard/logs',
    description: 'Get all audit logs (Admin)',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/dashboard/stats',
    description: 'Get dashboard audit statistics',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/actions',
    description: 'Get available audit actions',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/methods',
    description: 'Get available audit methods',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/audit/status-codes',
    description: 'Get available status codes',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/audit/export',
    description: 'Export audit logs in various formats',
    auth: 'JWT',
    category: 'Audit & Logs',
    icon: <FileText className="h-4 w-4" />
  },

  // Queue Management
  {
    method: 'GET',
    path: '/queue/monitor/health',
    description: 'Get queue health status',
    auth: 'None',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/monitor/detailed',
    description: 'Get detailed queue statistics',
    auth: 'None',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/monitor/metrics',
    description: 'Get queue performance metrics',
    auth: 'None',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'POST',
    path: '/queue/monitor/force-flush',
    description: 'Force flush batch processing',
    auth: 'None',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
  },
  {
    method: 'GET',
    path: '/queue/monitor/alerts',
    description: 'Get queue alerts and warnings',
    auth: 'None',
    category: 'Queue Management',
    icon: <Workflow className="h-4 w-4" />
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
  }
];


const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-800';
    case 'POST': return 'bg-blue-100 text-blue-800';
    case 'PUT': return 'bg-yellow-100 text-yellow-800';
    case 'DELETE': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAuthColor = (auth: string) => {
  switch (auth) {
    case 'None': return 'bg-gray-100 text-gray-800';
    case 'JWT': return 'bg-purple-100 text-purple-800';
    case 'API Key': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function EndpointsPage() {
  const renderEndpointsTable = (endpointsList: Endpoint[]) => (
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
              <code className="text-sm bg-muted px-2 py-1 rounded">
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Endpoints</h1>
        <div className="text-sm text-muted-foreground">
          {endpoints.length} total endpoints
        </div>
      </div>

      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integration
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Authentication & User Management
                <Badge variant="outline" className="ml-2">
                  {endpoints.filter(ep => ep.category === 'Authentication' || ep.category === 'User Management').length} endpoints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEndpointsTable(endpoints.filter(ep => ep.category === 'Authentication' || ep.category === 'User Management'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Key Management
                <Badge variant="outline" className="ml-2">
                  {endpoints.filter(ep => ep.category === 'API Key Management').length} endpoints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEndpointsTable(endpoints.filter(ep => ep.category === 'API Key Management'))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Audit & Logs
                <Badge variant="outline" className="ml-2">
                  {endpoints.filter(ep => ep.category === 'Audit & Logs').length} endpoints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEndpointsTable(endpoints.filter(ep => ep.category === 'Audit & Logs'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Salesforce Integration
                <Badge variant="outline" className="ml-2">
                  {endpoints.filter(ep => ep.category === 'Salesforce Integration').length} endpoints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEndpointsTable(endpoints.filter(ep => ep.category === 'Salesforce Integration'))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="h-5 w-5 mr-2" />
                Queue Management
                <Badge variant="outline" className="ml-2">
                  {endpoints.filter(ep => ep.category === 'Queue Management').length} endpoints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEndpointsTable(endpoints.filter(ep => ep.category === 'Queue Management'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                System & Health
                <Badge variant="outline" className="ml-2">
                  {endpoints.filter(ep => ep.category === 'System').length} endpoints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEndpointsTable(endpoints.filter(ep => ep.category === 'System'))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                API Usage Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Authentication Types</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><Badge className="bg-gray-100 text-gray-800 mr-2">None</Badge> No authentication required</li>
                    <li><Badge className="bg-purple-100 text-purple-800 mr-2">JWT</Badge> Requires JWT token in Authorization header</li>
                    <li><Badge className="bg-orange-100 text-orange-800 mr-2">API Key</Badge> Requires API key in X-API-Key header</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">HTTP Methods</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><Badge className="bg-green-100 text-green-800 mr-2">GET</Badge> Retrieve data</li>
                    <li><Badge className="bg-blue-100 text-blue-800 mr-2">POST</Badge> Create or process data</li>
                    <li><Badge className="bg-yellow-100 text-yellow-800 mr-2">PUT</Badge> Update data</li>
                    <li><Badge className="bg-red-100 text-red-800 mr-2">DELETE</Badge> Remove data</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {window.location.origin.replace('3000', '3001')}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}