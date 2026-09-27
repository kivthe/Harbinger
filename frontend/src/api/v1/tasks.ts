import { apiClient } from '@/api/client';
import type {
  Task,
  TaskCreate,
  TaskFilters,
  TaskUpdate,
} from '@/types/api';

export async function list(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.q) params.set('q', filters.q);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const url = qs ? `/tasks?${qs}` : '/tasks';
  const response = await apiClient.get<Task[]>(url);
  return response.data;
}

export async function get(id: number): Promise<Task> {
  const response = await apiClient.get<Task>(`/tasks/${id}`);
  return response.data;
}

export async function create(data: TaskCreate): Promise<Task> {
  const response = await apiClient.post<Task>('/tasks', data);
  return response.data;
}

export async function update(id: number, data: TaskUpdate): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
  return response.data;
}

export async function updateStatus(
  id: number,
  status: Task['status']
): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
  return response.data;
}

export async function toggle(id: number): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}/toggle`);
  return response.data;
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}