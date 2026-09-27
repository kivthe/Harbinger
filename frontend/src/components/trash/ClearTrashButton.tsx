import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useClearTrash } from '@/hooks/useTrashMutations';

interface Props {
  disabled?: boolean;
  count?: number;
}

export function ClearTrashButton({ disabled, count }: Props) {
  const [open, setOpen] = useState(false);
  const clear = useClearTrash();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || clear.isPending}
        className="rounded-md border border-red-200 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Очистить корзину
      </button>

      <ConfirmDialog
        open={open}
        title="Очистить корзину?"
        description={
          count
            ? `Будет безвозвратно удалено задач: ${count}. Действие нельзя отменить.`
            : 'Все задачи в корзине будут удалены навсегда. Действие нельзя отменить.'
        }
        confirmLabel="Очистить"
        variant="danger"
        isPending={clear.isPending}
        onConfirm={() =>
          clear.mutate(undefined, {
            onSuccess: () => setOpen(false),
          })
        }
        onCancel={() => setOpen(false)}
      />
    </>
  );
}