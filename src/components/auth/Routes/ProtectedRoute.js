// src/components/auth/Routes/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Fixed path

const ProtectedRoute = ({ children, requireAdmin = false, allowPublic = false }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If allowPublic is true, show children regardless of auth status
  if (allowPublic) {
    return children;
  }

  if (!currentUser) {
    // Store the intended destination for post-login redirect
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  if (requireAdmin && currentUser.type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;