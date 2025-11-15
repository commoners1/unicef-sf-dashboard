import { useState, useCallback } from 'react';

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  setPagination: (pagination: Partial<PaginationState>) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  reset: () => void;
}

/**
 * Reusable hook for managing pagination state
 * 
 * @example
 * const { pagination, handlePageChange } = usePagination();
 */
export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { initialPage = 1, initialPageSize = 10 } = options;

  const [pagination, setPaginationState] = useState<PaginationState>({
    current: initialPage,
    pageSize: initialPageSize,
    total: 0,
  });

  const setPagination = useCallback((updates: Partial<PaginationState>) => {
    setPaginationState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPaginationState((prev) => ({ ...prev, current: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPaginationState((prev) => ({ ...prev, pageSize, current: 1 }));
  }, []);

  const reset = useCallback(() => {
    setPaginationState({
      current: initialPage,
      pageSize: initialPageSize,
      total: 0,
    });
  }, [initialPage, initialPageSize]);

  return {
    pagination,
    setPagination,
    handlePageChange,
    handlePageSizeChange,
    reset,
  };
}

