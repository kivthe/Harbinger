import { useRestoreTask, useHardDeleteTask } from '@/hooks/useTrashMutations';
import { TaskPriorityBadge } from '@/components/tasks/TaskStatusBadge';
import type { Task } from '@/types/api';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Props {
  task: Task;
}

function formatDeletedAt(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} д назад`;
  if (hours > 0) return `${hours} ч назад`;
  if (minutes > 0) return `${minutes} мин назад`;
  return 'только что';
}

export function TrashCard({ task }: Props) {
  const restore = useRestoreTask();
  const hardDelete = useHardDeleteTask();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 font-medium text-gray-900">{task.title}</h3>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {task.description}
        </p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Удалено: {formatDeletedAt(task.deleted_at)}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => restore.mutate(task.id)}
          disabled={restore.isPending}
          className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {restore.isPending ? 'Восстанавливаем…' : 'Восстановить'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={hardDelete.isPending}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Удалить навсегда
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить навсегда?"
        description="Действие нельзя отменить. Задача исчезнет из базы данных."
        confirmLabel="Удалить"
        variant="danger"
        isPending={hardDelete.isPending}
        onConfirm={() =>
          hardDelete.mutate(task.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}