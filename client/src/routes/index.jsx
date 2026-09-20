import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestLayout, StudentLayout, AdminLayout } from '@/layouts/AppLayouts';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import { UnauthorizedPage, NotFoundPage } from '@/pages/public/ErrorPages';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentComplaintsPage from '@/pages/student/StudentComplaintsPage';
import CreateComplaintPage from '@/pages/student/CreateComplaintPage';
import ComplaintDetailPage from '@/pages/student/ComplaintDetailPage';
import StudentMessPage from '@/pages/student/StudentMessPage';
import MessFeedbackPage from '@/pages/student/MessFeedbackPage';
import StudentEventsPage from '@/pages/student/StudentEventsPage';
import EventDetailPage from '@/pages/student/EventDetailPage';
import NotificationsPage from '@/pages/student/NotificationsPage';
import ProfilePage, { AdminSettingsPage } from '@/pages/student/ProfilePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminComplaintsPage from '@/pages/admin/AdminComplaintsPage';
import AdminComplaintDetailPage from '@/pages/admin/AdminComplaintDetailPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import AdminMessPage from '@/pages/admin/AdminMessPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import UsersPage from '@/pages/admin/UsersPage';

export const router = createBrowserRouter([
  {
    element: <GuestLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'complaints', element: <StudentComplaintsPage /> },
      { path: 'complaints/new', element: <CreateComplaintPage /> },
      { path: 'complaints/:id', element: <ComplaintDetailPage basePath="/student/complaints" /> },
      { path: 'mess', element: <StudentMessPage /> },
      { path: 'mess/feedback', element: <MessFeedbackPage /> },
      { path: 'events', element: <StudentEventsPage /> },
      { path: 'events/:id', element: <EventDetailPage basePath="/student/events" /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'complaints', element: <AdminComplaintsPage /> },
      { path: 'complaints/:id', element: <AdminComplaintDetailPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'mess', element: <AdminMessPage /> },
      { path: 'events', element: <AdminEventsPage /> },
      { path: 'events/:id', element: <EventDetailPage basePath="/admin/events" /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <NotFoundPage /> },
]);
