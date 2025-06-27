import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimationProvider } from './context/AnimationContext';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import Firmalar from './components/Firmalar';
import Raporlar from './components/Raporlar';
import Admin from './components/Admin';
import AppBar from './components/AppBar';
import ProtectedRoute from './components/ProtectedRoute';
import PeekAnimation from './components/PeekAnimation';
import UnicornAnimation from './components/UnicornAnimation';
import './App.css';

function App() {
  // Set up global refresh functions at app level
  useEffect(() => {
    // Global calendar refresh function
    window.refreshCalendar = () => {
      console.log('🔄 Global calendar refresh triggered from App');
      // Try to find calendar component and refresh it
      const event = new CustomEvent('refreshCalendar');
      window.dispatchEvent(event);
    };

    // Global today's calls refresh function  
    window.refreshTodaysCalls = () => {
      console.log('🔄 Global today\'s calls refresh triggered from App');
      // Try to find today's calls component and refresh it
      const event = new CustomEvent('refreshTodaysCalls');
      window.dispatchEvent(event);
    };

    return () => {
      delete window.refreshCalendar;
      delete window.refreshTodaysCalls;
    };
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <AnimationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<AuthWrapper />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppBar />
                  <Dashboard />
                  <PeekAnimation />
                  <UnicornAnimation />
                </ProtectedRoute>
              } />
              <Route path="/firmalar" element={
                <ProtectedRoute>
                  <AppBar />
                  <Firmalar />
                  <PeekAnimation />
                  <UnicornAnimation />
                </ProtectedRoute>
              } />
              <Route path="/raporlar" element={
                <ProtectedRoute>
                  <AppBar />
                  <Raporlar />
                  <PeekAnimation />
                  <UnicornAnimation />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AppBar />
                  <Admin />
                  <PeekAnimation />
                  <UnicornAnimation />
                </ProtectedRoute>
              } />
              <Route path="/" element={<AuthWrapper />} />
            </Routes>
          </Router>
        </AnimationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
