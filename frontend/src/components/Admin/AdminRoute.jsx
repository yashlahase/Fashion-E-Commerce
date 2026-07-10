import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const AdminRoute = () => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
