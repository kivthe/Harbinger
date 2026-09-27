import { Link } from 'react-router-dom';

import { PlayerBar } from '@/components/player/PlayerBar';
import { useAuthStore } from '@/store/auth';
import { useLogout } from '@/hooks/useAuth';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <Link to="/tasks" className="text-lg font-semibold text-gray-800">
        Harbinger
      </Link>

      <div className="flex items-center gap-4">
        <PlayerBar />

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-700">
                {user.username}
                {user.role === 'admin' && (
                  <span className="ml-2 rounded bg-gray-900 px-2 py-0.5 text-xs text-white">
                    admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="rounded-md border px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {logout.isPending ? 'Выходим…' : 'Выйти'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-gray-900">
                Войти
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-gray-900 px-3 py-1 text-white hover:bg-gray-700"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}