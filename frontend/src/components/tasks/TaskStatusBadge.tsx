import { cn } from '@/lib/cn';
import type { TaskPriority, TaskStatus } from '@/types/api';

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
};

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-700',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        statusStyles[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        priorityStyles[priority]
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
}