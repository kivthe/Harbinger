import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const links = [
  { to: '/tasks', label: 'Задачи' },
  { to: '/trash', label: 'Корзина' },
  { to: '/admin/users', label: 'Админ: Пользователи' },
  { to: '/admin/tasks', label: 'Админ: Задачи' },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <nav className="flex flex-col gap-1 p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}