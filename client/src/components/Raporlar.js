import React from 'react';
import Calendar from './Calendar';
import TodaysCalls from './TodaysCalls';
import './Raporlar.css';

const Raporlar = () => {
  return (
    <main className="main-content">
      <div className="content-container">
        <div className="raporlar-content">
          <div className="reports-grid">
            <div className="calendar-section">
              <h2>Günlük Hedef Takip Takvimi</h2>
              <Calendar />
            </div>
            
            <div className="calls-section">
              <TodaysCalls />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Raporlar; 