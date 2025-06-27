import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AnimationConfigModal.css';

const AnimationConfigModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    peekAnimationEnabled: true,
    unicornAnimationEnabled: true,
    callAnimationsEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current animation configuration
  const fetchAnimationConfig = async () => {
    try {
      setLoading(true);
      console.log('Fetching animation config...');
      const response = await api.get('/animation-config');
      console.log('Animation config response:', response.data);
      if (response.data.success) {
        const config = response.data.data;
        setSettings({
          peekAnimationEnabled: config.peekAnimationEnabled,
          unicornAnimationEnabled: config.unicornAnimationEnabled,
          callAnimationsEnabled: config.callAnimationsEnabled
        });
      }
    } catch (error) {
      console.error('Error fetching animation config:', error);
      setError('Konfigürasyon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Save animation configuration
  const saveAnimationConfig = async () => {
    try {
      setSaving(true);
      setError('');
      
      console.log('Saving animation config with settings:', settings);
      const response = await api.put('/animation-config', settings);
      console.log('Save response:', response.data);
      
      if (response.data.success) {
        setSuccess('Animasyon ayarları başarıyla kaydedildi!');
        setTimeout(() => setSuccess(''), 3000);
        
        // Notify the app to update animation settings
        window.dispatchEvent(new CustomEvent('animationConfigUpdated', { 
          detail: settings 
        }));
      }
    } catch (error) {
      console.error('Error saving animation config:', error);
      setError(error.response?.data?.message || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  // Handle setting change
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Load configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAnimationConfig();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="animation-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎬 Animasyon Ayarları</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">🎬 Animasyon ayarları yükleniyor...</div>
          ) : (
            <>
              <div className="section">
                <h3>Sistem Animasyonları</h3>
                <p>Sistem genelinde görünen animasyonları kontrol edin.</p>
                
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-name">👀 Peek Animasyonu</div>
                      <div className="setting-description">
                        Ekranın alt kısmından rastgele çıkan animasyon
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.peekAnimationEnabled}
                        onChange={(e) => handleSettingChange('peekAnimationEnabled', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-name">🦄 Unicorn Animasyonu</div>
                      <div className="setting-description">
                        Ekran boyunca uçan unicorn animasyonu
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.unicornAnimationEnabled}
                        onChange={(e) => handleSettingChange('unicornAnimationEnabled', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-name">💝 Arama Animasyonları</div>
                      <div className="setting-description">
                        Arama kaydedildiğinde çıkan kalp ve taç animasyonları
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.callAnimationsEnabled}
                        onChange={(e) => handleSettingChange('callAnimationsEnabled', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  ✅ {success}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={saving}
          >
            İptal
          </button>
          <button 
            className="save-btn" 
            onClick={saveAnimationConfig}
            disabled={saving || loading}
          >
            {saving ? '💾 Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationConfigModal; 