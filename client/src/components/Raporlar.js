import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Raporlar.css';

const Raporlar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [todaysCompanies, setTodaysCompanies] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current month and year
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch calendar data for the month
  const fetchCalendarData = async () => {
    try {
      if (!user?.id) return;

      const response = await api.get(`/users/daily-history?year=${currentYear}&month=${currentMonth}&userId=${user.id}`);
      if (response.data.success) {
        setCalendarData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  // Fetch today's called companies
  const fetchTodaysCompanies = async () => {
    try {
      const response = await api.get('/users/todays-calls');
      if (response.data.success) {
        setTodaysCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today\'s companies:', error);
    }
  };

  // Get today's stats
  const getTodaysStats = () => {
    if (!calendarData?.days) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayData = calendarData.days.find(day => day.isToday);
    
    return todayData ? {
      callsMade: todayData.callsMade,
      target: todayData.target,
      targetReached: todayData.targetReached,
      progress: todayData.target > 0 ? Math.round((todayData.callsMade / todayData.target) * 100) : 0
    } : null;
  };

  // Load data when component mounts or date changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCalendarData(),
        fetchTodaysCompanies()
      ]);
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, currentYear, currentMonth]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefreshReports = () => {
      console.log('📊 Reports received refresh event');
      if (user?.id) {
        fetchCalendarData();
        fetchTodaysCompanies();
      }
    };

    window.addEventListener('refreshCalendar', handleRefreshReports);
    window.addEventListener('refreshTodaysCalls', handleRefreshReports);
    
    return () => {
      window.removeEventListener('refreshCalendar', handleRefreshReports);
      window.removeEventListener('refreshTodaysCalls', handleRefreshReports);
    };
  }, [user?.id, currentYear, currentMonth]);

  // Update daily stats when calendar data changes
  useEffect(() => {
    setDailyStats(getTodaysStats());
  }, [calendarData]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    if (!calendarData?.days) return [];

    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add actual days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayData = calendarData.days.find(d => d.date === dateStr);
      const currentDayDate = new Date(currentYear, currentMonth - 1, day);
      currentDayDate.setHours(0, 0, 0, 0);
      
      const isFutureDay = currentDayDate > today;
      
      days.push({
        day,
        dateStr,
        callsMade: dayData?.callsMade || 0,
        target: dayData?.target || user?.targetCallNumber || 20,
        targetReached: dayData?.targetReached || false,
        isToday: dayData?.isToday || false,
        isFuture: isFutureDay
      });
    }

    return days;
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="content-container">
          <div className="loading">📊 Raporlar yükleniyor...</div>
        </div>
      </main>
    );
  }

  const calendarDays = generateCalendarDays();
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('tr-TR', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <main className="main-content">
      <div className="content-container">
        <div className="reports-header">
          <h1>📊 Raporlar</h1>
        </div>

        {/* 3-Column Layout */}
        <div className="three-column-layout">
          {/* Calendar - 1/3 */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button onClick={goToPreviousMonth} className="nav-btn">‹</button>
              <h2>{monthName}</h2>
              <button onClick={goToNextMonth} className="nav-btn">›</button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              
              <div className="calendar-days">
                {calendarDays.map((dayData, index) => (
                                  <div key={index} className={`calendar-day ${
                  !dayData ? 'empty' : 
                  dayData.isToday ? 'today' :
                  dayData.isFuture ? 'future' :
                  dayData.targetReached ? 'success' : 'incomplete'
                }`}>
                    {dayData && (
                      <>
                        <div className="day-number">{dayData.day}</div>
                        <div className="day-calls">{dayData.callsMade}</div>
                        {dayData.targetReached && <div className="success-icon">✓</div>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Called Companies - 1/3 */}
          <div className="todays-companies">
            <h2>📞 Bugün ({todaysCompanies.length})</h2>
            <div className="companies-list">
              {todaysCompanies.length > 0 ? (
                todaysCompanies.map((call, index) => (
                  <div key={index} className="company-item">
                    <div className="company-info">
                      <div className="company-name">{call.company?.companyName || 'Bilinmeyen Firma'}</div>
                      <div className="company-details">
                        {call.company?.city && <span className="city">{call.company.city}</span>}
                        {call.callResult && <span className={`result ${call.callResult.toLowerCase()}`}>{call.callResult}</span>}
                      </div>
                    </div>
                    <div className="call-time">
                      {new Date(call.callDate).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-calls">Bugün henüz arama yapılmamış.</div>
              )}
            </div>
          </div>

          {/* Empty Square - 1/3 */}
          <div className="empty-section">
            <div className="empty-placeholder">
              <div className="placeholder-icon">📋</div>
              <div className="placeholder-text">Gelecek özellikler için ayrılmış alan</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Raporlar; 