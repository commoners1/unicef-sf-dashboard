import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 * Centralized configuration for all React Query hooks
 * 
 * Note: Individual hooks can override these defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch on component mount if data is stale
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Only retry once for mutations
      retryDelay: 1000,
    },
  },
});

