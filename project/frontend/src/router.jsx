import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import GoogleAuthSuccessPage from './features/auth/pages/GoogleAuthSuccessPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/google/success',
    element: <GoogleAuthSuccessPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
]);

export default router;