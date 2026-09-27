import { apiClient } from '@/api/client';
import type { ClearTrashResponse, Task } from '@/types/api';

export async function list(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>('/trash');
  return response.data;
}

export async function restore(id: number): Promise<Task> {
  const response = await apiClient.patch<Task>(`/trash/${id}/restore`);
  return response.data;
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`/trash/${id}`);
}

export async function clear(): Promise<ClearTrashResponse> {
  const response = await apiClient.delete<ClearTrashResponse>('/trash');
  return response.data;
}