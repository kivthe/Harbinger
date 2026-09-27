import { Link } from 'react-router-dom';

import { TaskPriorityBadge, TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { useAdminTasks } from '@/hooks/useAdmin';
import { cn } from '@/lib/cn';
import type { TaskFilters, TaskPriority, TaskStatus } from '@/types/api';

interface Props {
  filters: TaskFilters & { include_deleted?: boolean };
}

export function AllTasksTable({ filters }: Props) {
  const { data: tasks, isLoading, isError } = useAdminTasks(filters);

  if (isLoading) {
    return <p className="text-gray-500">Загрузка…</p>;
  }

  if (isError) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-red-700">
        Не удалось загрузить задачи.
      </p>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-12 text-center">
        <p className="text-gray-500">Задач не найдено</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">Задача</th>
            <th className="px-3 py-2 font-medium">Статус</th>
            <th className="px-3 py-2 font-medium">Приоритет</th>
            <th className="px-3 py-2 font-medium">Владелец</th>
            <th className="px-3 py-2 font-medium">Удалено</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className={cn('border-b', task.deleted_at && 'opacity-60')}>
              <td className="px-3 py-2 text-gray-500">{task.id}</td>
              <td className="px-3 py-2">
                <Link
                  to={`/tasks/${task.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {task.title}
                </Link>
              </td>
              <td className="px-3 py-2">
                <TaskStatusBadge status={task.status as TaskStatus} />
              </td>
              <td className="px-3 py-2">
                <TaskPriorityBadge priority={task.priority as TaskPriority} />
              </td>
              <td className="px-3 py-2 text-gray-600">#{task.owner_id}</td>
              <td className="px-3 py-2 text-gray-500">
                {task.deleted_at ? (
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">
                    да
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}