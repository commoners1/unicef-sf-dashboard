import { useState, useCallback } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  onError?: (error: Error) => void;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAsyncData<T = any>(
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFn();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        if (options.onError && err instanceof Error) {
          options.onError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(options.initialData || null);
    setError(null);
    setLoading(false);
  }, [options.initialData]);

  return { data, loading, error, execute, reset };
}

