import { Link } from 'react-router-dom';

import { DeadlineCountdown } from './DeadlineCountdown';
import { TaskPriorityBadge, TaskStatusBadge } from './TaskStatusBadge';
import { useToggleTask } from '@/hooks/useTaskMutations';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/api';

export function TaskCard({ task }: { task: Task }) {
  const toggle = useToggleTask();
  const isDone = task.status === 'done';

  return (
    <div
      className={cn(
        'group relative block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md',
        isDone && 'opacity-60'
      )}
    >
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => toggle.mutate(task.id)}
        disabled={toggle.isPending}
        className="absolute left-3 top-3 h-4 w-4 cursor-pointer rounded border-gray-300"
        aria-label="Отметить выполненной"
      />

      <Link to={`/tasks/${task.id}`} className="block pl-6">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              'line-clamp-2 font-medium text-gray-900',
              isDone && 'line-through decoration-gray-400'
            )}
          >
            {task.title}
          </h3>
          <TaskPriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <TaskStatusBadge status={task.status} />
          {task.due_date && <DeadlineCountdown dueDate={task.due_date} />}
        </div>
      </Link>
    </div>
  );
}