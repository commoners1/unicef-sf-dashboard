import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Activity,
  Key,
  Shield,
  Monitor,
  AlertTriangle,
  TrendingUp,
  Bell,
  Clock,
  Cloud,
  X
} from 'lucide-react';
import { useDashboardStore } from '@/features/dashboard';
import { usePermissions, PERMISSIONS } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  isAlwaysVisible?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Overview',
    items: [
      { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, isAlwaysVisible: true },
      { key: 'dashboard', label: 'Dashboard', icon: <Activity className="h-4 w-4" />, isAlwaysVisible: true },
      { key: 'metrics', label: 'Key Metrics', icon: <TrendingUp className="h-4 w-4" />, isAlwaysVisible: true },
    ]
  },
  {
    title: 'API Management',
    items: [
      { key: 'api-keys', label: 'API Keys', icon: <Key className="h-4 w-4" />, permission: 'VIEW_API_KEYS' },
      { key: 'endpoints', label: 'Endpoints', icon: <Monitor className="h-4 w-4" />, permission: 'VIEW_SYSTEM_HEALTH' },
      { key: 'usage', label: 'Usage Analytics', icon: <BarChart3 className="h-4 w-4" />, permission: 'VIEW_SYSTEM_HEALTH' },
    ]
  },
  {
    title: 'Queue Management',
    items: [
      { key: 'queue', label: 'Queue Management', icon: <Workflow className="h-4 w-4" />, permission: 'VIEW_QUEUE_STATUS' },
      { key: 'jobs', label: 'Job Details', icon: <FileText className="h-4 w-4" />, permission: 'VIEW_QUEUE_STATUS' },
      { key: 'monitoring', label: 'Real-time Monitor', icon: <Monitor className="h-4 w-4" />, permission: 'VIEW_QUEUE_STATUS' },
    ]
  },
  {
    title: 'User Management',
    items: [
      { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" />, permission: 'VIEW_USERS' },
      { key: 'permissions', label: 'Permissions', icon: <Shield className="h-4 w-4" />, permission: 'MANAGE_USERS' },
    ]
  },
  {
    title: 'Logs & Audit',
    items: [
      { key: 'logs', label: 'Live Logs', icon: <Monitor className="h-4 w-4" />, permission: 'VIEW_AUDIT_LOGS' },
      { key: 'audit-logs', label: 'Audit Trail', icon: <FileText className="h-4 w-4" />, permission: 'VIEW_AUDIT_LOGS' },
      { key: 'salesforce-logs', label: 'Salesforce Logs', icon: <Cloud className="h-4 w-4" />, permission: 'VIEW_AUDIT_LOGS' },
      { key: 'cron-jobs', label: 'Cron Jobs', icon: <Clock className="h-4 w-4" />, permission: 'MANAGE_CRON_JOBS' },
      { key: 'errors', label: 'Error Tracking', icon: <AlertTriangle className="h-4 w-4" />, permission: 'SUPER_ADMIN_ONLY' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { key: 'performance', label: 'Performance', icon: <TrendingUp className="h-4 w-4" />, permission: 'VIEW_SYSTEM_HEALTH' },
      { key: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" />, permission: 'VIEW_SYSTEM_HEALTH' },
    ]
  },
  {
    title: 'System',
    items: [
      { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, permission: 'MANAGE_SYSTEM' },
      { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, permission: 'MANAGE_SYSTEM' },
    ]
  }
];

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, setSidebarOpen } = useDashboardStore();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const location = useLocation();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  
  // Check if we're on mobile/tablet (lg breakpoint is 1024px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Helper function to check if menu item should be visible
  const isMenuItemVisible = (item: MenuItem): boolean => {
    if (item.isAlwaysVisible) return true;
    if (!item.permission) return true;
    
    // Special case for SUPER_ADMIN_ONLY
    if (item.permission === 'SUPER_ADMIN_ONLY') {
      return isSuperAdmin;
    }
    
    const permission = PERMISSIONS[item.permission as keyof typeof PERMISSIONS];
    if (permission) return hasPermission(permission);
    return true;
  };
  
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(isMenuItemVisible)
  })).filter(group => group.items.length > 0);

  // Close mobile sidebar when link is clicked
  const handleLinkClick = () => {
    if (isMobileOrTablet) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={cn('pb-12', className)}>
      {/* Close button for mobile/tablet */}
      {isMobileOrTablet && (
        <div className="flex items-center justify-between px-4 py-3 border-b lg:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <div className="space-y-4 py-4">
        <div className="px-2 sm:px-3 py-2">
          <div className="space-y-4 sm:space-y-6">
            {filteredMenuGroups.map((group, groupIndex) => (
              <div key={group.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 sm:px-4 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const to = `/${item.key}`;
                    const isActive = location.pathname === to;
                    return (
                      <Link
                        key={item.key}
                        to={to}
                        onClick={handleLinkClick}
                        className={cn(
                          "w-full flex items-center rounded-md px-3 sm:px-4 py-2 text-left transition-colors text-sm",
                          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                        )}
                        style={{ textDecoration: 'none' }}
                      >
                        {item.icon}
                        {!sidebarCollapsed && <span className="ml-2 truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
                {groupIndex < filteredMenuGroups.length - 1 && !sidebarCollapsed && (
                  <div className="mx-3 sm:mx-4 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
