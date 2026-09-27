import AppRoutes from './routes';
import { useMe } from './hooks/useAuth';

export default function App() {
  const { isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Загрузка…
      </div>
    );
  }

  return <AppRoutes />;
}