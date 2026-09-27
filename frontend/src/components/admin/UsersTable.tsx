import { UserRow } from './UserRow';
import { useAdminUsers } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types/api';

interface Props {
  /** Реакция на количество юзеров (например, показать «нет пользователей»). */
  emptyMessage?: string;
  /** Переопределить список (для фильтрации на странице). */
  users?: User[];
}

export function UsersTable({ emptyMessage = 'Пользователей нет', users }: Props) {
  const { data, isLoading, isError } = useAdminUsers();
  const me = useAuthStore((s) => s.user);

  const list = users ?? data ?? [];

  if (isLoading && !users) {
    return <p className="text-gray-500">Загрузка…</p>;
  }

  if (isError && !users) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-red-700">
        Не удалось загрузить пользователей.
      </p>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">Пользователь</th>
            <th className="px-3 py-2 font-medium">Роль</th>
            <th className="px-3 py-2 font-medium">Статус</th>
            <th className="px-3 py-2 font-medium text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {list.map((user) => (
            <UserRow key={user.id} user={user} isSelf={me?.id === user.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
}