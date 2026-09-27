import { Modal } from './Modal';
import { cn } from '@/lib/cn';

type ConfirmVariant = 'default' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantClasses: Record<ConfirmVariant, string> = {
  default: 'bg-gray-900 hover:bg-gray-700',
  danger: 'bg-red-600 hover:bg-red-700',
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  variant = 'default',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      {description && (
        <p className="mb-4 text-sm text-gray-600">{description}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm text-white disabled:opacity-50',
            variantClasses[variant]
          )}
        >
          {isPending ? 'Обработка…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}