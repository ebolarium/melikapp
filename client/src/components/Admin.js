import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import EmailConfigModal from './EmailConfigModal';
import AnimationConfigModal from './AnimationConfigModal';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAnimationModal, setShowAnimationModal] = useState(false);

  // Fetch all users data
  const fetchUsersOverview = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/users/all-overview');
      if (response.data.success) {
        setUsersData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users overview:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    // Simulate loading check
    setLoading(false);
    
    // Fetch users data if user is admin
    if (user?.level === 'Admin') {
      fetchUsersOverview();
    }
  }, [user]);

  // Redirect if user is not admin
  if (!loading && (!user || user.level !== 'Admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="content-container">
          <div className="loading">🔒 Yetki kontrol ediliyor...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Users Overview Table */}
        <div className="users-overview-section">
          <h2>👥 Kullanıcı Genel Bakış</h2>
          <div className="users-table-container">
            {usersLoading ? (
              <div className="table-loading">📊 Kullanıcı verileri yükleniyor...</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Kullanıcı Adı</th>
                    <th>Level</th>
                    <th>Bugünkü Aramalar</th>
                    <th>Hedef</th>
                    <th>Durum</th>
                    <th>Puanlar</th>
                    <th>Aktif</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((userData) => (
                    <tr key={userData.id}>
                      <td className="user-name">
                        <div className="user-avatar">👤</div>
                        <div className="user-details">
                          <div className="name">{userData.userName}</div>
                          <div className="email">{userData.email}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`level-badge ${userData.level.toLowerCase()}`}>
                          {userData.level}
                        </span>
                      </td>
                      <td className="calls-today">
                        <span className="calls-number">{userData.todaysCalls}</span>
                      </td>
                      <td className="target">
                        <span className="target-number">{userData.targetCallNumber}</span>
                      </td>
                      <td className="status">
                        <span className={`status-badge ${
                          userData.todaysCalls >= userData.targetCallNumber ? 'success' : 'pending'
                        }`}>
                          {userData.todaysCalls >= userData.targetCallNumber ? '✅ Hedef Ulaşıldı' : '⏳ Devam Ediyor'}
                        </span>
                      </td>
                      <td className="points">
                        <span className="points-number">⭐ {userData.points}</span>
                      </td>
                      <td className="active-status">
                        <span className={`active-badge ${userData.isActive ? 'active' : 'inactive'}`}>
                          {userData.isActive ? '🟢 Aktif' : '🔴 Pasif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {!usersLoading && usersData.length === 0 && (
              <div className="no-users">Kullanıcı bulunamadı.</div>
            )}
          </div>
        </div>

        <div className="admin-grid">
          {/* System Settings */}
          <div className="admin-card">
            <div className="card-header">
              <h2>⚙️ Sistem Ayarları</h2>
            </div>
            <div className="card-content">
              <div className="placeholder-features">
                <div 
                  className="feature-item clickable"
                  onClick={() => setShowEmailModal(true)}
                >
                  📧 Email Konfigürasyonu
                </div>
                <div 
                  className="feature-item clickable"
                  onClick={() => setShowAnimationModal(true)}
                >
                  🎬 Animasyon Ayarları
                </div>
              </div>
            </div>
          </div>

          {/* System Statistics */}
          <div className="admin-card">
            <div className="card-header">
              <h2>📈 Sistem İstatistikleri</h2>
            </div>
            <div className="card-content">
              <p>Genel sistem performansı ve kullanım verileri</p>
              <div className="placeholder-features">
                <div className="feature-item">📞 Toplam Arama Sayısı</div>
                <div className="feature-item">👥 Aktif Kullanıcılar</div>
                <div className="feature-item">🏢 Firma Sayısı</div>
                <div className="feature-item">📅 Günlük Raporlar</div>
              </div>
              <button className="admin-btn">Yakında Gelecek</button>
            </div>
          </div>

          {/* Company Management */}
          <div className="admin-card">
            <div className="card-header">
              <h2>🏢 Firma Yönetimi</h2>
            </div>
            <div className="card-content">
              <p>Firma veritabanını yönet ve düzenle</p>
              <div className="placeholder-features">
                <div className="feature-item">📁 Toplu Firma Ekleme</div>
                <div className="feature-item">🗂️ Kategori Yönetimi</div>
                <div className="feature-item">🔍 Gelişmiş Filtreleme</div>
                <div className="feature-item">📊 Firma Analitiği</div>
              </div>
              <button className="admin-btn">Yakında Gelecek</button>
            </div>
          </div>

          {/* Reports & Analytics */}
          <div className="admin-card">
            <div className="card-header">
              <h2>📊 Raporlar & Analitik</h2>
            </div>
            <div className="card-content">
              <p>Detaylı raporlar ve performans analitiği</p>
              <div className="placeholder-features">
                <div className="feature-item">📈 Kullanıcı Performansı</div>
                <div className="feature-item">🎯 Hedef Analizi</div>
                <div className="feature-item">📅 Dönemsel Raporlar</div>
                <div className="feature-item">📧 Otomatik Raporlama</div>
              </div>
              <button className="admin-btn">Yakında Gelecek</button>
            </div>
          </div>

          {/* User Management */}
          <div className="admin-card">
            <div className="card-header">
              <h2>👥 Kullanıcı Yönetimi</h2>
            </div>
            <div className="card-content">
              <p>Kullanıcıları görüntüle, düzenle ve yönet</p>
              <div className="placeholder-features">
                <div className="feature-item">📋 Kullanıcı Listesi</div>
                <div className="feature-item">✏️ Kullanıcı Düzenleme</div>
                <div className="feature-item">🎯 Hedef Belirleme</div>
                <div className="feature-item">📊 Performans Takibi</div>
              </div>
              <button className="admin-btn">Yakında Gelecek</button>
            </div>
          </div>

          {/* Data Management */}
          <div className="admin-card">
            <div className="card-header">
              <h2>💾 Veri Yönetimi</h2>
            </div>
            <div className="card-content">
              <p>Veritabanı yönetimi ve bakım işlemleri</p>
              <div className="placeholder-features">
                <div className="feature-item">💾 Veri Yedekleme</div>
                <div className="feature-item">📤 Veri Dışa Aktarma</div>
                <div className="feature-item">📥 Veri İçe Aktarma</div>
                <div className="feature-item">🧹 Veri Temizleme</div>
              </div>
              <button className="admin-btn">Yakında Gelecek</button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <h3>🚀 Hızlı Bakış</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">-</div>
              <div className="stat-label">Toplam Kullanıcı</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">-</div>
              <div className="stat-label">Bugünkü Aramalar</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">-</div>
              <div className="stat-label">Aktif Firmalar</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">-</div>
              <div className="stat-label">Sistem Durumu</div>
            </div>
          </div>
        </div>

        {/* Email Configuration Modal */}
        <EmailConfigModal 
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />

        {/* Animation Configuration Modal */}
        <AnimationConfigModal 
          isOpen={showAnimationModal}
          onClose={() => setShowAnimationModal(false)}
        />
      </div>
    </main>
  );
};

export default Admin; 