import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading AgriLink marketplace…</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'BUYER') return <Navigate to="/buyer/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
