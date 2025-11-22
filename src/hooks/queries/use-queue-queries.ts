// src/hooks/queries/use-queue-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { QueueApiService, type JobFilters } from '@/services/api/queue/queue-api';

/**
 * ✅ CACHE - Queue health (Tier 1: 10 seconds TTL)
 */
export function useQueueHealth() {
  return useQuery({
    queryKey: queryKeys.queue.health(),
    queryFn: () => QueueApiService.getQueueHealth(),
    staleTime: 10 * 1000, // 10 seconds (matches backend)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds
  });
}

/**
 * ✅ CACHE - Queue metrics (Tier 1: 15 seconds TTL)
 */
export function useQueueMetrics() {
  return useQuery({
    queryKey: queryKeys.queue.metrics(),
    queryFn: () => QueueApiService.getQueueMetrics(),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 15 * 1000,
  });
}

/**
 * ✅ CACHE - Detailed queue stats (Tier 1: 20 seconds TTL)
 */
export function useQueueDetailedStats() {
  return useQuery({
    queryKey: queryKeys.queue.detailed(),
    queryFn: () => QueueApiService.getDetailedStats(),
    staleTime: 20 * 1000, // 20 seconds (matches backend)
    gcTime: 5 * 60 * 1000,
    refetchInterval: 20 * 1000,
  });
}

/**
 * ✅ CACHE - Queue alerts (Tier 1: 15 seconds TTL)
 */
export function useQueueAlerts() {
  return useQuery({
    queryKey: queryKeys.queue.alerts(),
    queryFn: () => QueueApiService.getQueueAlerts(),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 15 * 1000,
  });
}

/**
 * ✅ CACHE - Queue stats (Tier 1: 15 seconds TTL)
 */
export function useQueueStats() {
  return useQuery({
    queryKey: queryKeys.queue.stats(),
    queryFn: () => QueueApiService.getQueueStats(),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 15 * 1000,
  });
}

/**
 * ✅ CACHE - Job counts (Tier 1: 10 seconds TTL)
 */
export function useQueueCounts() {
  return useQuery({
    queryKey: queryKeys.queue.counts(),
    queryFn: () => QueueApiService.getJobCounts(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 10 * 1000,
  });
}

/**
 * ✅ CACHE - Performance metrics (Tier 2: 30 seconds TTL)
 */
export function useQueuePerformance() {
  return useQuery({
    queryKey: queryKeys.queue.performance(),
    queryFn: () => QueueApiService.getPerformanceMetrics(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * ❌ NO CACHE - Real-time jobs with filters (Tier 3: Real-time data)
 */
export function useQueueJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: queryKeys.queue.jobs(filters),
    queryFn: () => QueueApiService.getJobs(filters),
    staleTime: 0, // Always stale - real-time data
    gcTime: 30 * 1000, // Keep for 30 seconds only
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds for real-time feel
  });
}

/**
 * ❌ NO CACHE - Specific job details (Tier 3: Real-time data)
 */
export function useJobById(id: string) {
  return useQuery({
    queryKey: queryKeys.queue.jobById(id),
    queryFn: () => QueueApiService.getJobById(id),
    staleTime: 0,
    gcTime: 30 * 1000,
    refetchInterval: 5 * 1000, // Refresh every 5 seconds for active monitoring
    enabled: !!id,
  });
}

/**
 * ❌ NO CACHE - Mutation: Retry failed job
 */
export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QueueApiService.retryJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.jobs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.counts() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Remove job
 */
export function useRemoveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QueueApiService.removeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.jobs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.counts() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Force flush batch
 */
export function useForceFlushBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => QueueApiService.forceFlushBatch(),
    onSuccess: () => {
      // Invalidate queue health/metrics after flush
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.health() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.metrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.detailed() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Pause queue
 */
export function usePauseQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueName: string) => QueueApiService.pauseQueue(queueName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.health() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.stats() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Resume queue
 */
export function useResumeQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueName: string) => QueueApiService.resumeQueue(queueName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.health() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.stats() });
    },
  });
}

/**
 * ❌ NO CACHE - Mutation: Clear queue
 */
export function useClearQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueName: string) => QueueApiService.clearQueue(queueName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.jobs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.counts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.stats() });
    },
  });
}

/**
 * ❌ NO CACHE - Export endpoint (on-demand generation)
 */
export function useExportJobs() {
  return useMutation({
    mutationFn: ({ filters, format = 'csv' }: { filters: JobFilters; format?: 'csv' | 'json' | 'xlsx' }) =>
      QueueApiService.exportJobs(filters, format),
  });
}

