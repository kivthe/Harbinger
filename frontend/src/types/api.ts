export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface ClearTrashResponse {
  deleted: number;
}