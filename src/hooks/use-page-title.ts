import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_TITLES } from '@/constants';

// Get site name from environment or use default
const SITE_NAME = import.meta.env.VITE_APP_TITLE || 'SF Middleware Dashboard';

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
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
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

