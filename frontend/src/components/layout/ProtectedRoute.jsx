import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white">Loading...</div>;
  }

  // Not logged in? Send to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role? Deny access.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="ml-4">Your role ({user.role}) does not have permission to view this page.</p>
      </div>
    );
  }

  // All good, render the requested page
  return <Outlet />;
};

export default ProtectedRoute;