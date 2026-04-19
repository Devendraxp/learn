import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // or a spinner

  if (!user || user?.publicMetadata?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
