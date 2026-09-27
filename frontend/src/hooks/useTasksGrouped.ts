import { useMemo } from 'react';

import type { Task, TaskStatus } from '@/types/api';

export interface GroupedTasks {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

export function useTasksGrouped(tasks: Task[] | undefined): GroupedTasks {
  return useMemo(() => {
    const result: GroupedTasks = { todo: [], in_progress: [], done: [] };
    if (!tasks) return result;

    for (const task of tasks) {
      result[task.status].push(task);
    }

    return result;
  }, [tasks]);
}

export const COLUMN_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
};