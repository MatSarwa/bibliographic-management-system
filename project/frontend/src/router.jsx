import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import GoogleAuthSuccessPage from './features/auth/pages/GoogleAuthSuccessPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ErrorPage from './shared/components/ErrorPage';

export const router = createBrowserRouter([
  {
    // Pathless parent: a crash in any page below shows ErrorPage instead of the router's default screen.
    errorElement: <ErrorPage />,
    children: [
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
      {
        path: '*',
        element: <ErrorPage notFound />,
      },
    ],
  },
]);

export default router;
