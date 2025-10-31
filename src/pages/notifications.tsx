import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, Mail, MessageSquare, Webhook, Plus, Edit, Trash2, Check, X, AlertTriangle, Activity, Clock } from 'lucide-react';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    title: 'System Performance Alert',
    message: 'CPU usage exceeded 80% for 5 minutes',
    type: 'warning',
    channel: 'email',
    status: 'sent',
    createdAt: '2024-01-20T14:30:00Z',
    read: false,
  },
  {
    id: '2',
    title: 'New User Registration',
    message: 'john.doe@example.com has registered for the platform',
    type: 'info',
    channel: 'slack',
    status: 'sent',
    createdAt: '2024-01-20T14:25:00Z',
    read: true,
  },
  {
    id: '3',
    title: 'API Rate Limit Exceeded',
    message: 'API key abc123 has exceeded rate limit of 1000 requests/hour',
    type: 'error',
    channel: 'webhook',
    status: 'failed',
    createdAt: '2024-01-20T14:20:00Z',
    read: false,
  },
  {
    id: '4',
    title: 'Database Backup Completed',
    message: 'Daily database backup completed successfully',
    type: 'success',
    channel: 'email',
    status: 'sent',
    createdAt: '2024-01-20T14:15:00Z',
    read: true,
  },
  {
    id: '5',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100',
    type: 'critical',
    channel: 'email',
    status: 'sent',
    createdAt: '2024-01-20T14:10:00Z',
    read: false,
  },
];

const notificationChannels = [
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    enabled: true,
    config: {
      smtp: 'smtp.example.com',
      port: 587,
      from: 'noreply@example.com',
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    enabled: true,
    config: {
      webhook: 'https://hooks.slack.com/services/...',
      channel: '#alerts',
    },
  },
  {
    id: 'webhook',
    name: 'Webhook',
    icon: Webhook,
    enabled: false,
    config: {
      url: 'https://api.example.com/webhook',
      secret: '***',
    },
  },
];

const notificationRules = [
  {
    id: '1',
    name: 'System Alerts',
    description: 'High CPU, memory, or disk usage alerts',
    conditions: ['cpu > 80%', 'memory > 90%', 'disk > 95%'],
    channels: ['email', 'slack'],
    enabled: true,
  },
  {
    id: '2',
    name: 'Security Events',
    description: 'Failed logins, suspicious activity, security breaches',
    conditions: ['failed_logins > 5', 'suspicious_ip', 'security_breach'],
    channels: ['email', 'webhook'],
    enabled: true,
  },
  {
    id: '3',
    name: 'User Activity',
    description: 'New registrations, API key creation, user changes',
    conditions: ['user_registration', 'api_key_created', 'user_updated'],
    channels: ['slack'],
    enabled: false,
  },
];

export default function NotificationsPage() {
  const [notifications] = useState(mockNotifications);
  const [channels] = useState(notificationChannels);
  const [rules] = useState(notificationRules);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<string>('notifications');

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    // TODO: Mark notification as read
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
    // TODO: Mark all notifications as read
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Deleting notification:', notificationId);
    // TODO: Delete notification
  };

  const handleEditChannel = (channelId: string) => {
    console.log('Editing channel:', channelId);
    // TODO: Edit channel configuration
  };

  const handleToggleChannel = (channelId: string) => {
    console.log('Toggling channel:', channelId);
    // TODO: Toggle channel enabled status
  };

  const handleEditRule = (ruleId: string) => {
    console.log('Editing rule:', ruleId);
    // TODO: Edit notification rule
  };

  const handleToggleRule = (ruleId: string) => {
    console.log('Toggling rule:', ruleId);
    // TODO: Toggle rule enabled status
  };

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = selectedType === 'all' || notification.type === selectedType;
    const channelMatch = selectedChannel === 'all' || notification.channel === selectedChannel;
    const statusMatch = selectedStatus === 'all' || notification.status === selectedStatus;
    return typeMatch && channelMatch && statusMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'secondary';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'default';
      default: return 'secondary';
    }
  };

  const getChannelIcon = (channel: string) => {
    const channelConfig = channels.find(c => c.id === channel);
    return channelConfig ? channelConfig.icon : Bell;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage system notifications and alert channels
          </p>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {channels.filter(c => c.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Configured channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {rules.filter(r => r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Notification rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Channels</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Rules</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="critical">Critical</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="info">Info</option>
                  </select>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="all">All Channels</option>
                    <option value="email">Email</option>
                    <option value="slack">Slack</option>
                    <option value="webhook">Webhook</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const ChannelIcon = getChannelIcon(notification.channel);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <ChannelIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <Badge variant={getTypeColor(notification.type) as any}>
                                  {notification.type}
                                </Badge>
                                <Badge variant={getStatusColor(notification.status) as any}>
                                  {notification.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how notifications are delivered
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{channel.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {channel.enabled ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={channel.enabled ? 'secondary' : 'outline'}>
                            {channel.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditChannel(channel.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleChannel(channel.id)}
                          >
                            {channel.enabled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-muted rounded text-sm">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Configuration:</p>
                        <div className="space-y-1">
                          {Object.entries(channel.config).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-xs text-muted-foreground">{key}:</span>
                              <span className="text-xs font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define when and how notifications are triggered
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant={rule.enabled ? 'secondary' : 'outline'}>
                            {rule.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground">Conditions:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rule.conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground">Channels:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rule.channels.map((channel, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                        >
                          {rule.enabled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Notification Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Notification volume over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Channel Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    const sentCount = notifications.filter(n => n.channel === channel.id && n.status === 'sent').length;
                    const failedCount = notifications.filter(n => n.channel === channel.id && n.status === 'failed').length;
                    const successRate = sentCount + failedCount > 0 ? Math.round((sentCount / (sentCount + failedCount)) * 100) : 0;
                    
                    return (
                      <div key={channel.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{channel.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {sentCount} sent, {failedCount} failed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{successRate}%</p>
                          <p className="text-xs text-muted-foreground">Success rate</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alert Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['critical', 'error', 'warning', 'success', 'info'].map((type) => {
                    const count = notifications.filter(n => n.type === type).length;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getTypeColor(type) as any}>{type}</Badge>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => {
                    const ChannelIcon = getChannelIcon(notification.channel);
                    return (
                      <div key={notification.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(notification.status) as any}>
                          {notification.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
