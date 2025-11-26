import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_TITLES, ROUTE_PATHS, getFullPath } from '@/config/routes.config';

// Get site name from environment or use default
const SITE_NAME = import.meta.env.VITE_APP_TITLE || 'SF Middleware Dashboard';

// Helper function to get page title from route
const getPageTitle = (pathnameParam: string): string => {
  const usersPath = getFullPath(ROUTE_PATHS.USERS);
  const jobsPath = getFullPath(ROUTE_PATHS.JOBS);
  const errorsPath = getFullPath(ROUTE_PATHS.ERRORS);

  const pathname = getFullPath(pathnameParam);
  
  // Check for dynamic routes
  if (pathname.startsWith(`${usersPath}/`) && pathname !== usersPath) {
    return 'User Details';
  }
  if (pathname.startsWith(`${jobsPath}/`) && pathname !== jobsPath) {
    return 'Job Details';
  }
  if (pathname.startsWith(`${errorsPath}/`) && pathname !== errorsPath) {
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

