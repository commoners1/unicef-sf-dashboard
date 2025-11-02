import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Get site name from environment or use default
const SITE_NAME = import.meta.env.VITE_APP_TITLE || 'SF Middleware Dashboard';

// Route to page title mapping
const routeTitleMap: Record<string, string> = {
  '/': 'Overview',
  '/overview': 'Overview',
  '/dashboard': 'Dashboard',
  '/metrics': 'Key Metrics',
  '/api-keys': 'API Keys',
  '/endpoints': 'Endpoints',
  '/usage': 'Usage Analytics',
  '/users': 'Users',
  '/permissions': 'Permissions',
  '/queue': 'Queue Management',
  '/jobs': 'Job Details',
  '/monitoring': 'Real-time Monitor',
  '/logs': 'Live Logs',
  '/audit-logs': 'Audit Trail',
  '/cron-jobs': 'Cron Jobs',
  '/errors': 'Error Tracking',
  '/performance': 'Performance',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/login': 'Login',
  '/unauthorized': 'Unauthorized',
  '/not-found': 'Not Found',
};

// Helper function to get page title from route
const getPageTitle = (pathname: string): string => {
  // Check for dynamic routes
  if (pathname.startsWith('/users/') && pathname !== '/users') {
    return 'User Details';
  }
  if (pathname.startsWith('/jobs/') && pathname !== '/jobs') {
    return 'Job Details';
  }
  if (pathname.startsWith('/errors/') && pathname !== '/errors') {
    return 'Error Details';
  }

  // Check for exact matches first
  if (routeTitleMap[pathname]) {
    return routeTitleMap[pathname];
  }

  // For unmatched routes (404), return "Not Found"
  // Note: React Router will catch these with the "*" route
  return 'Not Found';
};

/**
 * Hook to manage document title based on current route
 * Format: "<page title> | <site name>"
 */
export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    document.title = `${pageTitle} | ${SITE_NAME}`;
  }, [location.pathname]);
}

