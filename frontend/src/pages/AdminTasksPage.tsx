import { useState } from 'react';

import { AllTasksTable } from '@/components/admin/AllTasksTable';
import type { TaskPriority, TaskStatus } from '@/types/api';

export function AdminTasksPage() {
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [q, setQ] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(true);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Все задачи</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Поиск…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[200px] flex-1 rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus | '')}
          className="rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        >
          <option value="">Все статусы</option>
          <option value="todo">К выполнению</option>
          <option value="in_progress">В работе</option>
          <option value="done">Готово</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
          className="rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        >
          <option value="">Все приоритеты</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>

        <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="h-4 w-4"
          />
          Показывать удалённые
        </label>
      </div>

      <AllTasksTable
        filters={{
          status: status || undefined,
          priority: priority || undefined,
          q: q.trim() || undefined,
          include_deleted: includeDeleted,
        }}
      />
    </div>
  );
}