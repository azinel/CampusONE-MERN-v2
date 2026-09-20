import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingPage } from '@/components/layout/PageHeader';

export function StudentLayout() {
  const { user, loading, isStudent } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/unauthorized" replace />;
  return (
    <AppShell role="student">
      <Outlet />
    </AppShell>
  );
}

export function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return (
    <AppShell role="admin">
      <Outlet />
    </AppShell>
  );
}

export function GuestLayout() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return <Outlet />;
}
