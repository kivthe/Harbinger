import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { NotFound } from './components/common/NotFound';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { TrashPage } from './pages/TrashPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminTasksPage } from './pages/AdminTasksPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/tasks" element={<AdminTasksPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}