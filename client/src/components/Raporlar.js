import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Raporlar.css';

const Raporlar = () => {
  const { user } = useAuth();
  const [todaysCompanies, setTodaysCompanies] = useState([]);
  const [potentialCompanies, setPotentialCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [dailyRecords, setDailyRecords] = useState({});

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

  // Fetch potential companies
  const fetchPotentialCompanies = async () => {
    try {
      const response = await api.get('/reports/potential-companies');
      if (response.data.success) {
        setPotentialCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching potential companies:', error);
    }
  };



  // Fetch daily records for calendar
  const fetchDailyRecords = async (date = calendarDate) => {
    try {
      if (!user?.id) return;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const response = await api.get(`/users/daily-records?year=${year}&month=${month}&userId=${user.id}`);
      if (response.data.success) {
        setDailyRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching daily records:', error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTodaysCompanies(),
        fetchPotentialCompanies(),
        fetchDailyRecords()
      ]);
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Fetch daily records when calendar date changes
  useEffect(() => {
    if (user?.id) {
      fetchDailyRecords(calendarDate);
    }
  }, [calendarDate, user?.id]);

  // Helper function to check if a date is weekend
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // Helper function to get day record
  const getDayRecord = (date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return dailyRecords[dateKey] || null;
  };

  // Helper function to determine tile class
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    // Weekend
    if (isWeekend(date)) {
      return 'weekend-day';
    }

    const record = getDayRecord(date);
    
    // No record
    if (!record) {
      return 'no-record-day';
    }

    // Has record - check if target reached
    if (record.targetReached || record.callCount >= record.dailyTarget) {
      return 'target-reached-day';
    } else {
      return 'has-record-day';
    }
  };

  // Helper function to render tile content
  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    // No content for weekends
    if (isWeekend(date)) return null;

    const record = getDayRecord(date);
    
    // No record
    if (!record) return null;

    // Has record - show call count / target
    return (
      <div className="day-progress">
        <span className="call-count">{record.callCount}</span>
        <span className="target-divider">/</span>
        <span className="daily-target">{record.dailyTarget}</span>
      </div>
    );
  };

  // Auto-refresh every 5 minutes to sync with call sync service
  useEffect(() => {
    if (!user?.id) return;

    const refreshInterval = setInterval(() => {
      console.log('📊 Auto-refreshing reports data...');
      fetchTodaysCompanies();
      fetchPotentialCompanies();
      fetchDailyRecords();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user?.id]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefreshReports = () => {
      console.log('📊 Reports received refresh event');
      if (user?.id) {
        fetchTodaysCompanies();
        fetchPotentialCompanies();
        fetchDailyRecords();
      }
    };

    window.addEventListener('refreshTodaysCalls', handleRefreshReports);
    
    return () => {
      window.removeEventListener('refreshTodaysCalls', handleRefreshReports);
    };
  }, [user?.id]);

  if (loading) {
    return (
      <main className="main-content">
        <div className="content-container">
          <div className="loading">📊 Raporlar yükleniyor...</div>
        </div>
      </main>
    );
  }

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
              <h3>📅 Arama Takvimi</h3>
            </div>
            <div className="minimal-calendar">
              <Calendar
                value={calendarDate}
                onActiveStartDateChange={({ activeStartDate }) => setCalendarDate(activeStartDate)}
                tileClassName={getTileClassName}
                tileContent={getTileContent}
                showNeighboringMonth={false}
                showWeekNumbers={false}
                minDetail="month"
                maxDetail="month"
                prev2Label={null}
                next2Label={null}
                locale="en-US"
                formatShortWeekday={(locale, date) => {
                  // US calendar: Week starts Sunday
                  // date.getDay(): 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
                  // Display order: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
                  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
                  const dayName = days[date.getDay()];
                  console.log(`Weekday: ${date.getDay()} = ${dayName}, date: ${date.toDateString()}`);
                  return dayName;
                }}
              />
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

          {/* Potential Companies - 1/3 */}
          <div className="potential-companies">
            <h2>🎯 Potansiyel Firmalar ({potentialCompanies.length})</h2>
            <div className="companies-list">
              {potentialCompanies.length > 0 ? (
                potentialCompanies.map((company, index) => (
                  <div key={company._id} className="company-item potential">
                    <div className="company-info">
                      <div className="company-name">{company.companyName}</div>
                      <div className="company-details">
                        {company.city && <span className="city">{company.city}</span>}
                        <span className="result potansiyel">Potansiyel</span>
                      </div>
                    </div>
                    <div className="call-time">
                      {new Date(company.lastCallDate).toLocaleDateString('tr-TR', { 
                        day: '2-digit', 
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-calls">Henüz potansiyel firma yok.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Raporlar; 