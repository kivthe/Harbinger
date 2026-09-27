import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';

import { useLogin } from '@/hooks/useAuth';
import type { ApiError } from '@/types/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    login.mutate(
      { username, password },
      {
        onSuccess: () => {
          const next = searchParams.get('next') ?? '/tasks';
          navigate(next, { replace: true });
        },
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.data) {
            const data = err.response.data as ApiError;
            setError(data.detail ?? 'Ошибка входа');
          } else {
            setError('Не удалось войти. Проверь соединение.');
          }
        },
      }
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Вход</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {login.isPending ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-gray-900 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}