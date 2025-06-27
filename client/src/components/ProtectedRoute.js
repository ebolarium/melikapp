import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, initialLoading } = useAuth();
  
  console.log('🛡️ ProtectedRoute: isAuthenticated:', isAuthenticated, 'user:', user?.userName, 'initialLoading:', initialLoading);
  
  // Show loading during initial authentication check
  if (initialLoading) {
    console.log('🛡️ ProtectedRoute: Showing loading screen');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#4a5568'
      }}>
        🔄 Yükleniyor...
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('🛡️ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected component
  console.log('🛡️ ProtectedRoute: Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute; 