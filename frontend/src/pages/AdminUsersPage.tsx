import { useState } from 'react';

import { UsersTable } from '@/components/admin/UsersTable';
import { useAdminUsers } from '@/hooks/useAdmin';
import type { UserRole } from '@/types/api';

type RoleFilter = 'all' | UserRole;
type StatusFilter = 'all' | 'active' | 'inactive';

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [q, setQ] = useState('');

  const { data } = useAdminUsers();

  const filtered = (data ?? []).filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'inactive' && u.is_active) return false;
    if (q.trim() && !u.username.toLowerCase().includes(q.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <span className="text-sm text-gray-500">
          Всего: {data?.length ?? 0}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Поиск по имени…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[200px] flex-1 rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        >
          <option value="all">Все роли</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border px-3 py-2 outline-none focus:border-gray-900"
        >
          <option value="all">Все статусы</option>
          <option value="active">Только активные</option>
          <option value="inactive">Только отключённые</option>
        </select>
      </div>

      <UsersTable
        users={filtered}
        emptyMessage={
          data?.length === 0
            ? 'Пользователей нет'
            : 'Ничего не найдено по фильтрам'
        }
      />
    </div>
  );
}