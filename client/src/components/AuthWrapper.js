import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, user, initialLoading } = useAuth();

  // Show loading during initial auth check
  if (initialLoading) {
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

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {isLogin ? (
        <Login onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

export default AuthWrapper; 