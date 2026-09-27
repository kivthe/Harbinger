import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskViewToggle, type TaskView } from '@/components/tasks/TaskViewToggle';
import { Modal } from '@/components/ui/Modal';
import { useTasks } from '@/hooks/useTasks';
import type { TaskPriority, TaskStatus } from '@/types/api';

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const view: TaskView = searchParams.get('view') === 'board' ? 'board' : 'list';

  const filters = {
    status: (searchParams.get('status') as TaskStatus | null) ?? undefined,
    priority: (searchParams.get('priority') as TaskPriority | null) ?? undefined,
    q: searchParams.get('q') ?? undefined,
  };

  const { data: tasks, isLoading, isError } = useTasks(filters);

  function updateFilters(next: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
  }) {
    const params = new URLSearchParams(searchParams);
    if (next.status) params.set('status', next.status);
    else params.delete('status');
    if (next.priority) params.set('priority', next.priority);
    else params.delete('priority');
    if (next.q) params.set('q', next.q);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  }

  function updateView(next: TaskView) {
    const params = new URLSearchParams(searchParams);
    if (next === 'board') params.set('view', 'board');
    else params.delete('view');
    setSearchParams(params, { replace: true });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Задачи</h1>
        <div className="flex items-center gap-3">
          <TaskViewToggle view={view} onChange={updateView} />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
          >
            Новая задача
          </button>
        </div>
      </div>

      <TaskFilters {...filters} onChange={updateFilters} />

      {isLoading && <p className="text-gray-500">Загрузка…</p>}

      {isError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-red-700">
          Не удалось загрузить задачи. Проверь, что backend запущен.
        </p>
      )}

      {tasks && view === 'list' && <TaskList tasks={tasks} />}
      {tasks && view === 'board' && <TaskBoard tasks={tasks} />}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Новая задача"
        size="lg"
      >
        <TaskForm onSuccess={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}