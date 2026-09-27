import type { TaskPriority, TaskStatus } from '@/types/api';

interface TaskFiltersProps {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  onChange: (next: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
  }) => void;
}

export function TaskFilters({ status, priority, q, onChange }: TaskFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Поиск по названию и описанию…"
        value={q ?? ''}
        onChange={(e) => onChange({ status, priority, q: e.target.value || undefined })}
        className="min-w-[220px] flex-1 rounded-md border px-3 py-2 outline-none focus:border-gray-900"
      />

      <select
        value={status ?? ''}
        onChange={(e) =>
          onChange({
            status: (e.target.value || undefined) as TaskStatus | undefined,
            priority,
            q,
          })
        }
        className="rounded-md border px-3 py-2 outline-none focus:border-gray-900"
      >
        <option value="">Все статусы</option>
        <option value="todo">К выполнению</option>
        <option value="in_progress">В работе</option>
        <option value="done">Готово</option>
      </select>

      <select
        value={priority ?? ''}
        onChange={(e) =>
          onChange({
            status,
            priority: (e.target.value || undefined) as TaskPriority | undefined,
            q,
          })
        }
        className="rounded-md border px-3 py-2 outline-none focus:border-gray-900"
      >
        <option value="">Все приоритеты</option>
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>
    </div>
  );
}