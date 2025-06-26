import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TodaysCalls.css';

const TodaysCalls = () => {
  const [todaysCalls, setTodaysCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);

  // Fetch today's calls
  const fetchTodaysCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/users/todays-calls');
      
      if (response.data.success) {
        setTodaysCalls(response.data.data);
      } else {
        setError('Failed to fetch today\'s calls');
      }
    } catch (err) {
      console.error('Error fetching today\'s calls:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Listen for global refresh events
  useEffect(() => {
    const handleRefreshTodaysCalls = () => {
      console.log('📞 TodaysCalls received refresh event');
      fetchTodaysCalls();
    };

    window.addEventListener('refreshTodaysCalls', handleRefreshTodaysCalls);
    
    return () => {
      window.removeEventListener('refreshTodaysCalls', handleRefreshTodaysCalls);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    fetchTodaysCalls();
  }, []);

  // Handle company click
  const handleCompanyClick = (call) => {
    setSelectedCall(selectedCall?._id === call._id ? null : call);
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get call result color
  const getCallResultColor = (result) => {
    switch (result) {
      case 'Potansiyel':
        return '#4caf50';
      case 'Lab Şefi':
        return '#2196f3';
      case 'Satınalma':
        return '#ff9800';
      case 'Sekreter':
        return '#9c27b0';
      case 'İhtiyaç Yok':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <div className="todays-calls minimal">
        <div className="calls-header">
          <h3>Bugünkü Aramalar</h3>
        </div>
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="todays-calls minimal">
        <div className="calls-header">
          <h3>Bugünkü Aramalar</h3>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="todays-calls minimal">
      <div className="calls-header">
        <h3>Bugünkü Aramalar</h3>
        <span className="call-count">{todaysCalls.length}</span>
      </div>
      
      {todaysCalls.length === 0 ? (
        <div className="no-calls">Bugün henüz arama yapılmamış</div>
      ) : (
        <div className="calls-list">
          {todaysCalls.map((call) => (
            <div key={call._id} className="call-item">
              <div 
                className="company-info"
                onClick={() => handleCompanyClick(call)}
              >
                <div className="company-name">{call.company.companyName}</div>
                <div className="call-time">{formatTime(call.callDate)}</div>
              </div>
              
              {selectedCall?._id === call._id && (
                <div className="call-details">
                  <div className="detail-row">
                    <span className="label">Sonuç:</span>
                    <span 
                      className="value result"
                      style={{ color: getCallResultColor(call.callResult) }}
                    >
                      {call.callResult}
                    </span>
                  </div>
                  {call.company.person && (
                    <div className="detail-row">
                      <span className="label">Kişi:</span>
                      <span className="value">{call.company.person}</span>
                    </div>
                  )}
                  {call.company.phone && (
                    <div className="detail-row">
                      <span className="label">Tel:</span>
                      <span className="value">{call.company.phone}</span>
                    </div>
                  )}
                  {call.company.city && (
                    <div className="detail-row">
                      <span className="label">Şehir:</span>
                      <span className="value">{call.company.city}</span>
                    </div>
                  )}
                  {call.notes && (
                    <div className="detail-row">
                      <span className="label">Not:</span>
                      <span className="value notes">{call.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaysCalls; 