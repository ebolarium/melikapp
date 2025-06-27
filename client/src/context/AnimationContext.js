import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AnimationContext = createContext();

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider = ({ children }) => {
  const [animationSettings, setAnimationSettings] = useState({
    peekAnimationEnabled: true,
    unicornAnimationEnabled: true,
    callAnimationsEnabled: true
  });
  const [loading, setLoading] = useState(true);

  // Fetch animation configuration from server
  const fetchAnimationConfig = async () => {
    try {
      const response = await api.get('/animation-config');
      if (response.data.success) {
        const config = response.data.data;
        setAnimationSettings({
          peekAnimationEnabled: config.peekAnimationEnabled,
          unicornAnimationEnabled: config.unicornAnimationEnabled,
          callAnimationsEnabled: config.callAnimationsEnabled
        });
      }
    } catch (error) {
      console.error('Error fetching animation config:', error);
      // Keep default settings if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // Update animation settings
  const updateAnimationSettings = (newSettings) => {
    setAnimationSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Listen for animation config updates
  useEffect(() => {
    const handleAnimationConfigUpdate = (event) => {
      const newSettings = event.detail;
      updateAnimationSettings(newSettings);
    };

    window.addEventListener('animationConfigUpdated', handleAnimationConfigUpdate);
    
    return () => {
      window.removeEventListener('animationConfigUpdated', handleAnimationConfigUpdate);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAnimationConfig();
  }, []);

  const value = {
    animationSettings,
    updateAnimationSettings,
    loading,
    fetchAnimationConfig
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationContext; 