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

  const handleMarkAsRead = (_notificationId: string) => {
    // TODO: Mark notification as read
  };

  const handleMarkAllAsRead = () => {
    // TODO: Mark all notifications as read
  };

  const handleDeleteNotification = (_notificationId: string) => {
    // TODO: Delete notification
  };

  const handleEditChannel = (_channelId: string) => {
    // TODO: Edit channel configuration
  };

  const handleToggleChannel = (_channelId: string) => {
    // TODO: Toggle channel enabled status
  };

  const handleEditRule = (_ruleId: string) => {
    // TODO: Edit notification rule
  };

  const handleToggleRule = (_ruleId: string) => {
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage system notifications and alert channels
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="flex-1 sm:flex-initial min-w-[100px]">
              <Check className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Mark All Read</span>
              <span className="sm:hidden">Mark Read</span>
            </Button>
          )}
          <Button size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Rule</span>
            <span className="sm:hidden">New Rule</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unread</CardTitle>
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Channels</CardTitle>
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {channels.filter(c => c.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Configured channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {rules.filter(r => r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Notification rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Channels</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Rules</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-1.5 sm:py-1 border rounded-md text-xs sm:text-sm w-full sm:w-auto bg-background"
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
                    className="px-3 py-1.5 sm:py-1 border rounded-md text-xs sm:text-sm w-full sm:w-auto bg-background"
                  >
                    <option value="all">All Channels</option>
                    <option value="email">Email</option>
                    <option value="slack">Slack</option>
                    <option value="webhook">Webhook</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-1.5 sm:py-1 border rounded-md text-xs sm:text-sm w-full sm:w-auto bg-background"
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
                        className={`p-3 sm:p-4 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : ''}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <ChannelIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                <h4 className="font-medium text-xs sm:text-sm break-words">{notification.title}</h4>
                                <Badge variant={getTypeColor(notification.type) as any} className="text-xs">
                                  {notification.type}
                                </Badge>
                                <Badge variant={getStatusColor(notification.status) as any} className="text-xs">
                                  {notification.status}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0 self-start sm:self-center">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="h-8 w-8 p-0"
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
        <TabsContent value="channels" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Notification Channels</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Configure how notifications are delivered
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base">{channel.name}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {channel.enabled ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge variant={channel.enabled ? 'secondary' : 'outline'} className="text-xs">
                            {channel.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditChannel(channel.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleChannel(channel.id)}
                            className="h-8 w-8 p-0"
                          >
                            {channel.enabled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-muted rounded text-xs sm:text-sm">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Configuration:</p>
                        <div className="space-y-1">
                          {Object.entries(channel.config).map(([key, value]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                              <span className="text-xs text-muted-foreground">{key}:</span>
                              <span className="text-xs font-mono break-all">{value}</span>
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
        <TabsContent value="rules" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Notification Rules</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Define when and how notifications are triggered
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm sm:text-base">{rule.name}</h4>
                          <Badge variant={rule.enabled ? 'secondary' : 'outline'} className="text-xs">
                            {rule.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{rule.description}</p>
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
                      <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                          className="h-8 w-8 p-0"
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
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Notification Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4" />
                    <p className="text-xs sm:text-sm">Chart visualization would go here</p>
                    <p className="text-xs">Notification volume over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Channel Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    const sentCount = notifications.filter(n => n.channel === channel.id && n.status === 'sent').length;
                    const failedCount = notifications.filter(n => n.channel === channel.id && n.status === 'failed').length;
                    const successRate = sentCount + failedCount > 0 ? Math.round((sentCount / (sentCount + failedCount)) * 100) : 0;
                    
                    return (
                      <div key={channel.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 border rounded">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{channel.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {sentCount} sent, {failedCount} failed
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
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
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Alert Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {['critical', 'error', 'warning', 'success', 'info'].map((type) => {
                    const count = notifications.filter(n => n.type === type).length;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getTypeColor(type) as any} className="text-xs">{type}</Badge>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {notifications.slice(0, 5).map((notification) => {
                    const ChannelIcon = getChannelIcon(notification.channel);
                    return (
                      <div key={notification.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 border rounded">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <ChannelIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(notification.status) as any} className="text-xs flex-shrink-0 w-fit">
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
