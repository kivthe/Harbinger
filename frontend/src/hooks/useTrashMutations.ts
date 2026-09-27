import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trashApi } from '@/api';

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['trash'] });
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
  queryClient.invalidateQueries({ queryKey: ['task'] });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => trashApi.restore(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useHardDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => trashApi.remove(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useClearTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => trashApi.clear(),
    onSuccess: () => invalidateAll(queryClient),
  });
}