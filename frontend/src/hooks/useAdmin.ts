import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminApi } from '@/api';
import type { AdminUserUpdate, TaskFilters } from '@/types/api';

// ─── Users ───────────────────────────────────────────────

export const adminUsersKey = ['admin', 'users'] as const;

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUsersKey,
    queryFn: () => adminApi.listUsers(),
    staleTime: 10_000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserUpdate }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersKey });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersKey });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
    },
  });
}

// ─── Tasks ───────────────────────────────────────────────

export const adminTasksKey = (filters: TaskFilters & { include_deleted?: boolean }) =>
  ['admin', 'tasks', filters] as const;

export function useAdminTasks(
  filters: TaskFilters & { include_deleted?: boolean } = {}
) {
  return useQuery({
    queryKey: adminTasksKey(filters),
    queryFn: () => adminApi.listAllTasks(filters),
    staleTime: 10_000,
  });
}