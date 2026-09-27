import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/auth';

const commonLinks = [
  { to: '/tasks', label: 'Задачи' },
  { to: '/trash', label: 'Корзина' },
];

const adminLinks = [
  { to: '/admin/users', label: 'Админ: Пользователи' },
  { to: '/admin/tasks', label: 'Админ: Задачи' },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <nav className="flex flex-col gap-1 p-3">
        {commonLinks.map((link) => (
          <SidebarLink key={link.to} to={link.to} label={link.label} />
        ))}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Админ
            </div>
            {adminLinks.map((link) => (
              <SidebarLink key={link.to} to={link.to} label={link.label} />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
        )
      }
    >
      {label}
    </NavLink>
  );
}