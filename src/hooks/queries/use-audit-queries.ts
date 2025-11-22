// src/hooks/queries/use-audit-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { AuditApiService } from '@/services/api/audit/audit-api';
import type { AuditLogFilters, AuditLogExportOptions } from '@/types/audit';

/**
 * ✅ CACHE - Dashboard stats (Tier 1: 2 minutes TTL)
 */
export function useAuditDashboardStats() {
  return useQuery({
    queryKey: queryKeys.audit.dashboardStats(),
    queryFn: () => AuditApiService.getAuditStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes (matches backend cache)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * ✅ CACHE - User-specific stats (Tier 1: 1 minute TTL)
 */
export function useAuditUserStats() {
  return useQuery({
    queryKey: queryKeys.audit.userStats(),
    queryFn: () => AuditApiService.getUserStats(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Filtered audit logs (Tier 3: Real-time/filtered data)
 */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.audit.logs(filters),
    queryFn: () => AuditApiService.getAuditLogs(filters),
    staleTime: 0, // Always consider stale
    gcTime: 1 * 60 * 1000, // Keep in cache for 1 minute only
    enabled: Object.keys(filters).length > 0 || true, // Always enabled
  });
}

/**
 * ❌ NO CACHE - Specific audit log (Tier 3: Real-time data)
 */
export function useAuditLogById(id: string) {
  return useQuery({
    queryKey: queryKeys.audit.logById(id),
    queryFn: () => AuditApiService.getAuditLogById(id),
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * ✅ CACHE - Static reference data (Tier 1: 1 hour TTL)
 */
export function useAuditActions() {
  return useQuery({
    queryKey: queryKeys.audit.actions(),
    queryFn: () => AuditApiService.getAuditActions(),
    staleTime: 60 * 60 * 1000, // 1 hour (matches backend)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * ✅ CACHE - Static reference data (Tier 1: 1 hour TTL)
 */
export function useAuditMethods() {
  return useQuery({
    queryKey: queryKeys.audit.methods(),
    queryFn: () => AuditApiService.getAuditMethods(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * ✅ CACHE - Static reference data (Tier 1: 1 hour TTL)
 */
export function useAuditStatusCodes() {
  return useQuery({
    queryKey: queryKeys.audit.statusCodes(),
    queryFn: () => AuditApiService.getAuditStatusCodes(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * ✅ CACHE - Analytics usage stats (Tier 1: 5 minutes TTL)
 */
export function useAuditUsageStats() {
  return useQuery({
    queryKey: queryKeys.audit.analytics.usageStats(),
    queryFn: () => AuditApiService.getAuditStats(), // Adjust when analytics endpoint is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Filtered cron jobs (Tier 3: Real-time/filtered data)
 */
export function useUndeliveredCronJobs(jobType?: string) {
  return useQuery({
    queryKey: queryKeys.audit.cronJobs(jobType),
    queryFn: () => AuditApiService.getUndeliveredCronJobs(jobType),
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Mutation: Mark jobs as delivered
 */
export function useMarkAsDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobIds: string[]) => AuditApiService.markAsDelivered(jobIds),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.dashboardStats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.cronJobs() });
    },
  });
}

/**
 * ❌ NO CACHE - Export endpoint (on-demand generation)
 */
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (options: AuditLogExportOptions) => AuditApiService.exportAuditLogs(options),
  });
}

