import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Страница не найдена</p>
      <Link
        to="/tasks"
        className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        На главную
      </Link>
    </div>
  );
}