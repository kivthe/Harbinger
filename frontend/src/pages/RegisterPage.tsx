import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { useRegister } from '@/hooks/useAuth';
import type { ApiError } from '@/types/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    register.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate('/tasks', { replace: true });
        },
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.data) {
            const data = err.response.data as ApiError;
            setError(data.detail ?? 'Ошибка регистрации');
          } else {
            setError('Не удалось зарегистрироваться. Проверь соединение.');
          }
        },
      }
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Регистрация</h1>

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
              minLength={3}
              maxLength={50}
              autoFocus
              className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              3–50 символов: буквы, цифры, `.`, `_`, `-`
            </p>
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
              minLength={8}
              maxLength={72}
              className="w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">Минимум 8 символов</p>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {register.isPending ? 'Создаём…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}