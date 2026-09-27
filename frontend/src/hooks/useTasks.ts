import { useQuery } from '@tanstack/react-query';

import { tasksApi } from '@/api';
import type { Task, TaskFilters } from '@/types/api';

export function tasksQueryKey(filters: TaskFilters = {}) {
  return ['tasks', filters] as const;
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery<Task[]>({
    queryKey: tasksQueryKey(filters),
    queryFn: () => tasksApi.list(filters),
    staleTime: 10_000,
  });
}