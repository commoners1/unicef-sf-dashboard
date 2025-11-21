import { useState, useCallback, useEffect } from 'react';
import { usePagination } from './use-pagination';
import { getApiErrorMessage } from '@/lib/utils';

/**
 * Standard paginated API response structure
 */
export interface PaginatedResponse<T> {
  data?: T[];
  [key: string]: any; // Allow for variations like 'users', 'jobs', etc.
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    pages?: number;
  };
}

/**
 * Standard filters interface for paginated requests
 */
export interface PaginatedFilters {
  page?: number;
  limit?: number;
  [key: string]: any;
}

/**
 * Options for usePaginatedFetch hook
 */
export interface UsePaginatedFetchOptions<T> {
  fetchFn: (filters: PaginatedFilters) => Promise<PaginatedResponse<T>>;
  initialFilters?: Omit<PaginatedFilters, 'page' | 'limit'>;
  initialPageSize?: number;
  autoFetch?: boolean; // Auto-fetch on mount and filter changes
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
  // Handle different response structures
  dataKey?: string; // Default: 'data', but can be 'users', 'jobs', etc.
}

/**
 * Return type for usePaginatedFetch hook
 */
export interface UsePaginatedFetchReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: PaginatedFilters;
  setFilters: (filters: Partial<PaginatedFilters>) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleRefresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Reusable hook for paginated data fetching
 * Combines pagination state management with data fetching logic
 * 
 * @example
 * const {
 *   data,
 *   loading,
 *   error,
 *   pagination,
 *   handlePageChange,
 *   handleRefresh
 * } = usePaginatedFetch({
 *   fetchFn: ErrorsApiService.getErrors,
 *   initialFilters: { status: 'active' }
 * });
 */
export function usePaginatedFetch<T = any>(
  options: UsePaginatedFetchOptions<T>
): UsePaginatedFetchReturn<T> {
  const {
    fetchFn,
    initialFilters = {},
    initialPageSize = 10,
    autoFetch = true,
    onSuccess,
    onError,
    dataKey = 'data',
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PaginatedFilters>(initialFilters);

  const {
    pagination,
    setPagination,
    handlePageChange: handlePageChangeInternal,
    handlePageSizeChange: handlePageSizeChangeInternal,
    reset: resetPagination,
  } = usePagination({
    initialPage: 1,
    initialPageSize,
  });

  const fetchData = useCallback(
    async (page?: number, pageSize?: number, newFilters?: PaginatedFilters) => {
      try {
        setLoading(true);
        setError(null);

        const currentPage = page ?? pagination.current;
        const currentPageSize = pageSize ?? pagination.pageSize;
        const filtersToUse = newFilters ?? filters;

        const response = await fetchFn({
          page: currentPage,
          limit: currentPageSize,
          ...filtersToUse,
        });

        // Handle different response structures
        const responseData = response[dataKey] || response.data || [];
        const paginationData = response.pagination || {
          page: currentPage,
          limit: currentPageSize,
          total: Array.isArray(responseData) ? responseData.length : 0,
        };

        setData(Array.isArray(responseData) ? responseData : []);
        setPagination({
          current: paginationData.page,
          pageSize: paginationData.limit,
          total: paginationData.total,
        });

        if (onSuccess && Array.isArray(responseData)) {
          onSuccess(responseData);
        }
      } catch (err) {
        const errorMessage = getApiErrorMessage(err);
        setError(errorMessage);
        setData([]);
        setPagination({ current: 1, pageSize: pagination.pageSize, total: 0 });

        if (onError && err instanceof Error) {
          onError(err);
        } else if (!onError) {
          console.error('Error fetching paginated data:', err);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, filters, pagination.current, pagination.pageSize, dataKey, setPagination, onSuccess, onError]
  );

  // Auto-fetch on mount and when filters/pagination change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, pagination.current, pagination.pageSize, JSON.stringify(filters)]);

  const handlePageChange = useCallback(
    (page: number) => {
      handlePageChangeInternal(page);
      if (autoFetch) {
        fetchData(page);
      }
    },
    [handlePageChangeInternal, fetchData, autoFetch]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      handlePageSizeChangeInternal(pageSize);
      if (autoFetch) {
        fetchData(1, pageSize);
      }
    },
    [handlePageSizeChangeInternal, fetchData, autoFetch]
  );

  const setFilters = useCallback(
    (newFilters: Partial<PaginatedFilters>) => {
      setFiltersState((prev) => ({ ...prev, ...newFilters }));
      if (autoFetch) {
        // Reset to first page when filters change
        handlePageChangeInternal(1);
        fetchData(1, pagination.pageSize, { ...filters, ...newFilters });
      }
    },
    [autoFetch, handlePageChangeInternal, fetchData, pagination.pageSize, filters]
  );

  const handleRefresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setFiltersState(initialFilters);
    resetPagination();
    setData([]);
    setError(null);
    if (autoFetch) {
      fetchData(1, initialPageSize, initialFilters);
    }
  }, [initialFilters, initialPageSize, resetPagination, autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
    reset,
  };
}

