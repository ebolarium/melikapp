import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import './AppBar.css';

const AppBar = () => {
  const { user, logout } = useAuth();
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [showAnimationSelector, setShowAnimationSelector] = useState(false);

  const handleTestEmail = async () => {
    setEmailTesting(true);
    setEmailTestResult(null);
    
    try {
      await reportsAPI.testDailyReport();
      setEmailTestResult({ success: true, message: 'Test email sent successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setEmailTestResult(null), 3000);
    } catch (error) {
      setEmailTestResult({ 
        success: false, 
        message: error.response?.data?.error || 'Failed to send test email' 
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => setEmailTestResult(null), 5000);
    } finally {
      setEmailTesting(false);
    }
  };

  return (
    <div className="app-bar">
      <div className="app-bar-content">
        {/* Logo/Brand Section */}
        <div className="app-bar-brand">
          <div className="logo">
            <img src="/Logo.png" alt="Call Miner Logo" className="logo-image" />
            <span className="logo-text">Call Miner</span>
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
            {/* Email Test Button - Development/Testing - HIDDEN FOR PRODUCTION 
            <button 
              onClick={handleTestEmail}
              disabled={emailTesting}
              className="email-test-button"
              title="Test Daily Email Report"
            >
              {emailTesting ? '📧⏳' : '📧🧪'}
            </button>
            */}
            
            {/* Animation Test Button - HIDDEN FOR PRODUCTION
            <div className="animation-selector">
              <button 
                className="animation-test-btn"
                onClick={() => setShowAnimationSelector(!showAnimationSelector)}
                title="Test Call Animations"
              >
                🎬
              </button>
              
              {showAnimationSelector && (
                <div className="animation-dropdown">
                  <div className="animation-option" onClick={() => window.testAnimation?.('points')}>
                    ⭐ Points
                  </div>
                  <div className="animation-option" onClick={() => window.testAnimation?.('confetti')}>
                    🎉 Confetti
                  </div>
                  <div className="animation-option" onClick={() => window.testAnimation?.('celebration')}>
                    🎊 Celebration
                  </div>
                  <div className="animation-option" onClick={() => window.testAnimation?.('heart')}>
                    💝 Heart
                  </div>
                  <div className="animation-option" onClick={() => window.testAnimation?.('crown')}>
                    👑 Crown
                  </div>
                  <div className="animation-option" onClick={() => window.testAnimation?.('simple')}>
                    ✓ Simple
                  </div>
                  <div className="animation-option" onClick={() => window.testPeekAnimation?.()}>
                    👀 Peek
                  </div>
                  <div className="animation-option" onClick={() => window.testUnicornAnimation?.()}>
                    🦄 Unicorn
                  </div>
                </div>
              )}
            </div>
            */}
            
            {/* Email Test Result */}
            {emailTestResult && (
              <div className={`email-test-result ${emailTestResult.success ? 'success' : 'error'}`}>
                {emailTestResult.success ? '✅' : '❌'} {emailTestResult.message}
              </div>
            )}
            
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <div className="user-details">
                <span className="user-name">{user.userName}</span>
                <span className="user-points">⭐ {user.points || 0} puan</span>
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