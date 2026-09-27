import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { TaskForm } from '@/components/tasks/TaskForm';
import { useDeleteTask } from '@/hooks/useTaskMutations';
import { useTask } from '@/hooks/useTask';

import { DeadlineCountdown } from '@/components/tasks/DeadlineCountdown';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: task, isLoading, isError } = useTask(taskId);
  const remove = useDeleteTask();

  function handleDelete() {
    if (!task) return;
    remove.mutate(task.id, {
      onSuccess: () => {
        navigate('/tasks', { replace: true });
      },
    });
  }

  if (isLoading) {
    return <p className="text-gray-500">Загрузка…</p>;
  }

  if (isError || !task) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-12 text-center">
        <h1 className="mb-2 text-xl font-semibold">Задача не найдена</h1>
        <p className="mb-4 text-gray-600">
          Возможно, она удалена или принадлежит другому пользователю.
        </p>
        <Link
          to="/tasks"
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
        >
          К списку задач
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">
          ← К списку
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
        >
          В корзину
        </button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Редактирование задачи</h1>
        {task.due_date && <DeadlineCountdown dueDate={task.due_date} />}
      </div>

      <TaskForm task={task} onSuccess={() => navigate('/tasks')} />

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold">Удалить задачу?</h2>
            <p className="mb-4 text-sm text-gray-600">
              Задача переместится в корзину. Её можно будет восстановить.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-md border px-3 py-1.5 text-gray-700 hover:bg-gray-100"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={remove.isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {remove.isPending ? 'Удаляем…' : 'В корзину'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}