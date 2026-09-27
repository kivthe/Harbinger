import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { TaskColumn } from './TaskColumn';
import { COLUMN_ORDER, useTasksGrouped } from '@/hooks/useTasksGrouped';
import { useUpdateTaskStatus } from '@/hooks/useTaskMutations';
import type { Task, TaskStatus } from '@/types/api';

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const grouped = useTasksGrouped(tasks);
  const updateStatus = useUpdateTaskStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // начинать drag только после 8px движения — чтобы клик не превращался в drag
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(String(active.id).replace('task-', ''));
    const newStatus = (over.data.current as { status?: TaskStatus } | undefined)
      ?.status;

    if (!newStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateStatus.mutate({ id: taskId, status: newStatus });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMN_ORDER.map((status) => (
          <TaskColumn key={status} status={status} tasks={grouped[status]} />
        ))}
      </div>
    </DndContext>
  );
}