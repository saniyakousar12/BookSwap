import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isLoggedIn, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is logged in
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access if adminOnly is true
  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is admin and trying to access regular dashboard, redirect to admin
  if (!adminOnly && user?.role === 'ADMIN' && window.location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  // User is authenticated and authorized
  return children;
};