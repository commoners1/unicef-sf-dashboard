import { useState, useCallback, useEffect } from 'react';
import { getApiErrorMessage } from '@/lib/utils';

/**
 * Options for useDataFetching hook
 */
export interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  autoFetch?: boolean; // Auto-fetch on mount
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

/**
 * Return type for useDataFetching hook
 */
export interface UseDataFetchingReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Reusable hook for non-paginated data fetching
 * Handles loading, error, and data states
 * 
 * @example
 * const {
 *   data,
 *   loading,
 *   error,
 *   fetch
 * } = useDataFetching({
 *   fetchFn: QueueApiService.getQueueHealth,
 *   autoFetch: true
 * });
 */
export function useDataFetching<T = any>(
  options: UseDataFetchingOptions<T>
): UseDataFetchingReturn<T> {
  const {
    fetchFn,
    autoFetch = true,
    onSuccess,
    onError,
    initialData = null,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn();
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);

      if (onError && err instanceof Error) {
        onError(err);
      } else if (!onError) {
        console.error('Error fetching data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Only run on mount or when autoFetch changes

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    fetch,
    reset,
  };
}

