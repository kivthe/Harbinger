import { TrashCard } from './TrashCard';
import type { Task } from '@/types/api';

export function TrashList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-12 text-center">
        <p className="text-gray-500">Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TrashCard key={task.id} task={task} />
      ))}
    </div>
  );
}