import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — guards routes by authentication and role.
 * @param {string[]} allowedRoles - roles permitted to access (e.g. ['citizen'], ['admin'], ['driver'])
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Not authenticated → go to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  const effectiveRole = role || 'citizen';
  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    // Redirect to appropriate dashboard based on role, avoiding same-page loop
    if (effectiveRole === 'admin' && location.pathname !== '/admin/dashboard') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (effectiveRole === 'driver' && location.pathname !== '/driver/dashboard') {
      return <Navigate to="/driver/dashboard" replace />;
    }
    if (effectiveRole === 'citizen' && location.pathname !== '/dashboard') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
