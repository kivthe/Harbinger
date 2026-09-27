import { ClearTrashButton } from '@/components/trash/ClearTrashButton';
import { TrashList } from '@/components/trash/TrashList';
import { useTrash } from '@/hooks/useTrash';

export function TrashPage() {
  const { data: tasks, isLoading, isError } = useTrash();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Корзина</h1>
        <ClearTrashButton
          disabled={!tasks || tasks.length === 0}
          count={tasks?.length}
        />
      </div>

      {isLoading && <p className="text-gray-500">Загрузка…</p>}

      {isError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-red-700">
          Не удалось загрузить корзину. Проверь, что backend запущен.
        </p>
      )}

      {tasks && <TrashList tasks={tasks} />}
    </div>
  );
}