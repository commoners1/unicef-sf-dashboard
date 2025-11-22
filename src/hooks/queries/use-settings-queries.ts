// src/hooks/queries/use-settings-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { SettingsApiService, type SettingsObject } from '@/services/api/settings/settings-api';

/**
 * ✅ CACHE - All settings (Tier 1: 5 minutes TTL)
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all(),
    queryFn: () => SettingsApiService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend)
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Mutation: Update settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettingsObject) => SettingsApiService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() });
    },
  });
}

