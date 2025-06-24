import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current month and year
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch calendar data from API
  const fetchCalendarData = async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      const response = await api.get(`/users/daily-history?year=${year}&month=${month}&userId=${user.id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch calendar data');
      }

      setCalendarData(response.data.data);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load calendar data when component mounts or date changes
  useEffect(() => {
    if (user && user.id) {
      fetchCalendarData(currentYear, currentMonth);
    }
  }, [currentYear, currentMonth, user]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  // Get month name in Turkish
  const getMonthName = (month) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentYear;
    const month = currentMonth;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust start day to make Monday = 0
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayData = calendarData?.days?.find(d => d.date === dateStr);
      const today = new Date();
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isFuture = new Date(dateStr) > today;
      
      days.push({
        day,
        dateStr,
        data: dayData,
        isToday,
        isFuture
      });
    }
    
    return days;
  };

  // Get CSS class for day based on status
  const getDayClass = (dayInfo) => {
    if (!dayInfo) return 'calendar-day empty';
    
    let className = 'calendar-day';
    
    if (dayInfo.isToday) {
      className += ' today';
    }
    
    if (dayInfo.isFuture) {
      className += ' future';
    } else if (dayInfo.data) {
      if (dayInfo.data.targetReached) {
        className += ' success';
      } else {
        className += ' missed';
      }
    } else {
      className += ' no-data';
    }
    
    return className;
  };

  if (!user) {
    return (
      <div className="calendar-container minimal">
        <div className="calendar-loading">
          <div>👤 Kullanıcı yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="calendar-container minimal">
        <div className="calendar-loading">
          <div>📅 Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container minimal">
        <div className="calendar-error">
          <div>{error}</div>
          <button onClick={() => user && user.id && fetchCalendarData(currentYear, currentMonth)}>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="calendar-container minimal">
      {/* Minimal Header */}
      <div className="calendar-header minimal">
        <button onClick={goToPreviousMonth} className="nav-button">‹</button>
        <div className="calendar-title">{getMonthName(currentMonth)} {currentYear}</div>
        <button onClick={goToNextMonth} className="nav-button">›</button>
      </div>

      {/* Simple Stats */}
      {calendarData?.stats && (
        <div className="calendar-stats minimal">
          <span>{calendarData.stats.targetReachedDays}/{calendarData.stats.totalDaysSinceStart}</span>
          {calendarData.stats.currentStreak > 0 && (
            <span className="streak">🔥 {calendarData.stats.currentStreak}</span>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="calendar-grid minimal">
        {/* Day labels */}
        {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((day, index) => (
          <div key={index} className="weekday-label minimal">{day}</div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((dayInfo, index) => (
          <div key={index + 7} className={getDayClass(dayInfo)}>
            {dayInfo && (
              <>
                <div className="day-number">{dayInfo.day}</div>
                {dayInfo.data && (
                  <div className="calls-count">
                    {dayInfo.data.callsMade}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 