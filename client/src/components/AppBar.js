import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppBar.css';

const AppBar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-bar">
      <div className="app-bar-content">
        {/* Logo/Brand Section */}
        <div className="app-bar-brand">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Nedir ki yani? APP</span>
          </div>
        </div>

        {/* Navigation Menu - only show if authenticated */}
        {user && (
          <nav className="app-bar-nav">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/firmalar" className="nav-link">Firmalar</Link>
            <Link to="/raporlar" className="nav-link">Raporlar</Link>
          </nav>
        )}

        {/* User Section - only show if authenticated */}
        {user && (
          <div className="app-bar-user">
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <div className="user-details">
                <span className="user-name">{user.userName}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="logout-button"
              title="Logout"
            >
              🚪
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBar; 