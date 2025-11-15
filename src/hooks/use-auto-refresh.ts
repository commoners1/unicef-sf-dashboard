import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Reusable hook for auto-refreshing data at regular intervals
 * 
 * @example
 * const { refresh } = useAsyncData();
 * useAutoRefresh(() => refresh(() => ApiService.getData()), { interval: 60000 });
 */
export function useAutoRefresh(
  refreshFn: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 60000, enabled = true } = options;
  const refreshFnRef = useRef(refreshFn);

  // Update ref when function changes
  useEffect(() => {
    refreshFnRef.current = refreshFn;
  }, [refreshFn]);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      refreshFnRef.current();
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);
}

