import { apiClient } from '@/api/client';
import type { User } from '@/types/api';

export async function me(): Promise<User> {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}