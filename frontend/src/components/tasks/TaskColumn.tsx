import { useDroppable } from '@dnd-kit/core';

import { DraggableTaskCard } from './DraggableTaskCard';
import { cn } from '@/lib/cn';
import { COLUMN_TITLES } from '@/hooks/useTasksGrouped';
import type { Task, TaskStatus } from '@/types/api';

interface Props {
  status: TaskStatus;
  tasks: Task[];
}

export function TaskColumn({ status, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[200px] flex-col rounded-lg border-2 border-dashed p-3 transition-colors',
        isOver ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {COLUMN_TITLES[status]}
        </h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">
            Перетащи сюда
          </p>
        )}
      </div>
    </div>
  );
}