import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppBar from './components/AppBar';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import Firmalar from './components/Firmalar';
import Raporlar from './components/Raporlar';
import PeekAnimation from './components/PeekAnimation';
import UnicornAnimation from './components/UnicornAnimation';
import './App.css';

// Dashboard page wrapper with AppBar
const DashboardPage = () => {
  return (
    <div className="App">
      <AppBar />
      <Dashboard />
      <PeekAnimation />
      <UnicornAnimation />
    </div>
  );
};

// Firmalar page wrapper with AppBar
const FirmalarPage = () => {
  return (
    <div className="App">
      <AppBar />
      <Firmalar />
      <PeekAnimation />
      <UnicornAnimation />
    </div>
  );
};

// Raporlar page wrapper with AppBar
const RaporlarPage = () => {
  return (
    <div className="App">
      <AppBar />
      <Raporlar />
      <PeekAnimation />
      <UnicornAnimation />
    </div>
  );
};

// Loading component
const LoadingScreen = () => (
  <div className="App">
    <div className="main-content">
      <div className="content-container">
        <h1>🔄 Loading...</h1>
        <p>Please wait while we load your CRM dashboard.</p>
      </div>
    </div>
  </div>
);

// Main app component with authentication logic
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/firmalar" element={<FirmalarPage />} />
      <Route path="/raporlar" element={<RaporlarPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
