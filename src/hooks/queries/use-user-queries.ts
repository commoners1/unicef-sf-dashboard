// src/hooks/queries/use-user-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { UserApiService } from '@/services/api/users/user-api';

/**
 * ✅ CACHE - User profile (Tier 1: 5 minutes TTL)
 */
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => UserApiService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend)
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * ✅ CACHE - All users (Tier 2: 1 minute TTL)
 */
export function useAllUsers(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.user.allUsers(page, limit),
    queryFn: () => UserApiService.getAllUsers(page, limit),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllUsersCount() {
  return useQuery({
    queryKey: queryKeys.user.allUsersCount(),
    queryFn: () => UserApiService.getAllUsersCount(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * ✅ CACHE - User by ID (Tier 2: 2 minutes TTL)
 */
export function useUserById(id: string) {
  return useQuery({
    queryKey: queryKeys.user.byId(id),
    queryFn: () => UserApiService.getUserById(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * ✅ CACHE - Available roles (Tier 1: 24 hours TTL - static data)
 */
export function useAvailableRoles() {
  return useQuery({
    queryKey: queryKeys.user.roles(),
    queryFn: () => UserApiService.getAvailableRoles(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (static data)
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * ❌ NO CACHE - Mutation: Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => UserApiService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

