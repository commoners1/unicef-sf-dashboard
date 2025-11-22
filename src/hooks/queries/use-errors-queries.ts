// src/hooks/queries/use-errors-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { ErrorsApiService, type ErrorFilters } from '@/services/api/errors/errors-api';

/**
 * ✅ CACHE - Error stats (Tier 1: 2 minutes TTL)
 */
export function useErrorStats() {
  return useQuery({
    queryKey: queryKeys.errors.stats(),
    queryFn: () => ErrorsApiService.getErrorStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes (matches backend)
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * ✅ CACHE - Error trends (Tier 1: 5 minutes TTL)
 */
export function useErrorTrends(range: '24h' | '7d' | '30d' = '7d') {
  return useQuery({
    queryKey: queryKeys.errors.trends(range),
    queryFn: () => ErrorsApiService.getErrorTrends(range),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Filtered errors list (Tier 3: Real-time/filtered data)
 */
export function useErrors(filters: ErrorFilters = {}) {
  return useQuery({
    queryKey: queryKeys.errors.list(filters),
    queryFn: () => ErrorsApiService.getErrors(filters),
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000, // Keep for 1 minute only
  });
}

/**
 * ❌ NO CACHE - Specific error details (Tier 3: Real-time data)
 */
export function useErrorById(id: string) {
  return useQuery({
    queryKey: queryKeys.errors.byId(id),
    queryFn: () => ErrorsApiService.getErrorById(id),
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * ✅ CACHE - Static reference data (Tier 1: 1 hour TTL)
 */
export function useErrorSources() {
  return useQuery({
    queryKey: queryKeys.errors.sources(),
    queryFn: () => ErrorsApiService.getErrorSources(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * ✅ CACHE - Static reference data (Tier 1: 1 hour TTL)
 */
export function useErrorTypes() {
  return useQuery({
    queryKey: queryKeys.errors.types(),
    queryFn: () => ErrorsApiService.getErrorTypes(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * ✅ CACHE - Static reference data (Tier 1: 1 hour TTL)
 */
export function useErrorEnvironments() {
  return useQuery({
    queryKey: queryKeys.errors.environments(),
    queryFn: () => ErrorsApiService.getErrorEnvironments(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Mutation: Resolve error
 */
export function useResolveError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolvedBy }: { id: string; resolvedBy: string }) => 
      ErrorsApiService.resolveError(id, resolvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.list() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Unresolve error
 */
export function useUnresolveError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ErrorsApiService.unresolveError(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.list() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Delete error
 */
export function useDeleteError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ErrorsApiService.deleteError(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.list() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Bulk resolve errors
 */
export function useBulkResolveErrors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, resolvedBy }: { ids: string[]; resolvedBy: string }) =>
      ErrorsApiService.bulkResolveErrors(ids, resolvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.list() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Bulk delete errors
 */
export function useBulkDeleteErrors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => ErrorsApiService.bulkDeleteErrors(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.errors.list() });
    },
  });
}

/**
 * ❌ NO CACHE - Export endpoint (on-demand generation)
 */
export function useExportErrors() {
  return useMutation({
    mutationFn: ({ filters, format = 'csv' }: { filters: ErrorFilters; format?: 'csv' | 'json' }) =>
      ErrorsApiService.exportErrors(filters, format),
  });
}

