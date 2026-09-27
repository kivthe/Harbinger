import { type FormEvent, useState } from 'react';
import { AxiosError } from 'axios';

import { useCreateTask, useUpdateTask } from '@/hooks/useTaskMutations';
import type {
  ApiError,
  Task,
  TaskCreate,
  TaskPriority,
  TaskUpdate,
} from '@/types/api';

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const isEdit = Boolean(task);

  const create = useCreateTask();
  const update = useUpdateTask();

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.due_date ?? null));
  const [error, setError] = useState<string | null>(null);

  const isPending = create.isPending || update.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const base = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    };

    if (isEdit && task) {
      const payload: TaskUpdate = base;
      update.mutate(
        { id: task.id, data: payload },
        {
          onSuccess: () => onSuccess?.(),
          onError: (err) => setError(parseError(err, 'Ошибка сохранения')),
        }
      );
    } else {
      const payload: TaskCreate = base;
      create.mutate(payload, {
        onSuccess: () => onSuccess?.(),
        onError: (err) => setError(parseError(err, 'Ошибка создания')),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Название
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          autoFocus
          className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={5000}
          className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Приоритет
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Дедлайн
          </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}

function parseError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError && err.response?.data) {
    return (err.response.data as ApiError).detail ?? fallback;
  }
  return fallback;
}