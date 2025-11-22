// src/hooks/queries/use-cron-jobs-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { CronJobsApiService } from '@/services/api/cron-jobs/cron-jobs-api';

export interface CronJobFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface CronJobHistoryFilters {
  page?: number;
  limit?: number;
  jobId?: string;
}

/**
 * ✅ CACHE - Cron job stats (Tier 1: 1 minute TTL)
 */
export function useCronJobStats() {
  return useQuery({
    queryKey: queryKeys.cronJobs.stats(),
    queryFn: () => CronJobsApiService.getCronJobStats(),
    staleTime: 60 * 1000, // 1 minute (matches backend)
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * ✅ CACHE - Cron job states (Tier 1: 30 seconds TTL)
 * Note: This endpoint needs to be added to CronJobsApiService
 */
export function useCronJobStates() {
  return useQuery({
    queryKey: queryKeys.cronJobs.states(),
    queryFn: async () => {
      // TODO: Add getCronJobStates() to CronJobsApiService
      const { getApiClient } = await import('@/services/api/api-client');
      const apiClient = getApiClient();
      const response = await apiClient.get('/cron-jobs/states');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds (matches backend)
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * ✅ CACHE - Specific cron job state (Tier 1: 30 seconds TTL)
 * Note: This endpoint needs to be added to CronJobsApiService
 */
export function useCronJobState(type: string) {
  return useQuery({
    queryKey: queryKeys.cronJobs.state(type),
    queryFn: async () => {
      // TODO: Add getCronJobState() to CronJobsApiService
      const { getApiClient } = await import('@/services/api/api-client');
      const apiClient = getApiClient();
      const response = await apiClient.get(`/cron-jobs/${type}/state`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!type,
  });
}

/**
 * ✅ CACHE - Cron schedules (Tier 1: 1 hour TTL - static data)
 * Note: Cache is invalidated when jobs are toggled
 */
export function useCronSchedules() {
  return useQuery({
    queryKey: queryKeys.cronJobs.schedules(),
    queryFn: () => CronJobsApiService.getCronSchedules(),
    staleTime: 60 * 60 * 1000, // 1 hour (matches backend)
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnMount: 'always', // Always refetch when component mounts to ensure fresh data
  });
}

/**
 * ❌ NO CACHE - Filtered cron jobs list (Tier 3: Real-time/filtered data)
 */
export function useCronJobs(filters: CronJobFilters = {}) {
  return useQuery({
    queryKey: queryKeys.cronJobs.list(filters),
    queryFn: () => CronJobsApiService.getCronJobs(filters),
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000, // Keep for 1 minute only
  });
}

/**
 * ❌ NO CACHE - Cron job history (Tier 3: Real-time/filtered data)
 */
export function useCronJobHistory(filters: CronJobHistoryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.cronJobs.history(filters),
    queryFn: () => CronJobsApiService.getCronJobHistory(filters),
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Mutation: Run cron job
 */
export function useRunCronJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobType: string) => CronJobsApiService.runCronJob(jobType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cronJobs.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cronJobs.list() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Toggle cron job
 */
export function useToggleCronJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobType, enabled }: { jobType: string; enabled: boolean }) =>
      CronJobsApiService.toggleCronJob(jobType, enabled),
    onSuccess: (_, variables) => {
      // Invalidate all cron job related queries to ensure UI is up to date
      queryClient.invalidateQueries({ queryKey: queryKeys.cronJobs.states() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cronJobs.state(variables.jobType) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cronJobs.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cronJobs.schedules() }); // Invalidate schedules to update the toggle state
    },
  });
}

