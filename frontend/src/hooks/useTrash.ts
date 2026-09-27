import { useQuery } from '@tanstack/react-query';

import { trashApi } from '@/api';
import type { Task } from '@/types/api';

export const trashQueryKey = ['trash'] as const;

export function useTrash() {
  return useQuery<Task[]>({
    queryKey: trashQueryKey,
    queryFn: () => trashApi.list(),
    staleTime: 10_000,
  });
}