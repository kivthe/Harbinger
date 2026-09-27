import { useQuery } from '@tanstack/react-query';

import { tasksApi } from '@/api';
import type { Task } from '@/types/api';

export function taskQueryKey(id: number) {
  return ['task', id] as const;
}

export function useTask(id: number | undefined) {
  return useQuery<Task>({
    queryKey: id ? taskQueryKey(id) : ['task', 'none'],
    queryFn: () => tasksApi.get(id!),
    enabled: typeof id === 'number' && !Number.isNaN(id),
    staleTime: 10_000,
  });
}