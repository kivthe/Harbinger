import { Link, Outlet } from 'react-router-dom';

import { PlayerBar } from '@/components/player/PlayerBar';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex h-14 items-center justify-between border-b bg-white px-6">
        <Link to="/login" className="text-lg font-semibold text-gray-800">
          Harbinger
        </Link>
        <PlayerBar />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}