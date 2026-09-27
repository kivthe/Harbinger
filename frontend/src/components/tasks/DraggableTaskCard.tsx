import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

import { TaskPriorityBadge } from './TaskStatusBadge';
import { DeadlineCountdown } from './DeadlineCountdown';
import { useToggleTask } from '@/hooks/useTaskMutations';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/api';

interface Props {
  task: Task;
}

export function DraggableTaskCard({ task }: Props) {
  const toggle = useToggleTask();
  const isDone = task.status === 'done';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group relative cursor-grab select-none rounded-lg border bg-white p-3 shadow-sm hover:shadow-md',
        isDragging && 'opacity-50',
        isDone && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => toggle.mutate(task.id)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={toggle.isPending}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300"
          aria-label="Отметить выполненной"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/tasks/${task.id}`}
              className={cn(
                'line-clamp-2 flex-1 font-medium text-gray-900 hover:underline',
                isDone && 'line-through decoration-gray-400'
              )}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {task.title}
            </Link>
            <TaskPriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
              {task.description}
            </p>
          )}

          {task.due_date && (
            <div className="mt-2">
              <DeadlineCountdown dueDate={task.due_date} variant="inline" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}