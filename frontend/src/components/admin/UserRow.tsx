import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useUpdateUser, useDeleteUser } from '@/hooks/useAdmin';
import { cn } from '@/lib/cn';
import type { User, UserRole } from '@/types/api';

interface Props {
  user: User;
  isSelf: boolean;
}

export function UserRow({ user, isSelf }: Props) {
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function changeRole(role: UserRole) {
    update.mutate({ id: user.id, data: { role } });
  }

  function toggleActive() {
    update.mutate({ id: user.id, data: { is_active: !user.is_active } });
  }

  return (
    <tr className={cn('border-b text-sm', !user.is_active && 'opacity-60')}>
      <td className="px-3 py-2 text-gray-500">{user.id}</td>

      <td className="px-3 py-2">
        <span className="font-medium text-gray-900">{user.username}</span>
        {isSelf && (
          <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            это вы
          </span>
        )}
      </td>

      <td className="px-3 py-2">
        <select
          value={user.role}
          onChange={(e) => changeRole(e.target.value as UserRole)}
          disabled={isSelf || update.isPending}
          className="rounded-md border px-2 py-1 text-sm outline-none focus:border-gray-900 disabled:opacity-50"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </td>

      <td className="px-3 py-2">
        <button
          type="button"
          onClick={toggleActive}
          disabled={isSelf || update.isPending}
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50',
            user.is_active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          )}
        >
          {user.is_active ? 'Активен' : 'Отключён'}
        </button>
      </td>

      <td className="px-3 py-2 text-right">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isSelf}
          className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Удалить
        </button>
      </td>

      <ConfirmDialog
        open={confirmOpen}
        title={`Удалить «${user.username}»?`}
        description="Пользователь и все его задачи будут удалены навсегда. Действие нельзя отменить."
        confirmLabel="Удалить"
        variant="danger"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(user.id, { onSuccess: () => setConfirmOpen(false) })
        }
        onCancel={() => setConfirmOpen(false)}
      />
    </tr>
  );
}