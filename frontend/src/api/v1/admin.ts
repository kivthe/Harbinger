import { apiClient } from '@/api/client';
import type { AdminUserUpdate, Task, TaskFilters, User } from '@/types/api';

export async function listUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/admin/users');
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await apiClient.get<User>(`/admin/users/${id}`);
  return response.data;
}

export async function updateUser(id: number, data: AdminUserUpdate): Promise<User> {
  const response = await apiClient.patch<User>(`/admin/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function listAllTasks(filters: TaskFilters & { include_deleted?: boolean } = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.q) params.set('q', filters.q);
  if (filters.include_deleted !== undefined) {
    params.set('include_deleted', String(filters.include_deleted));
  }
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const url = qs ? `/admin/tasks?${qs}` : '/admin/tasks';
  const response = await apiClient.get<Task[]>(url);
  return response.data;
}