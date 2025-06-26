import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './EmailConfigModal.css';

const EmailConfigModal = ({ isOpen, onClose }) => {
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current email configuration
  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      console.log('Fetching email config...');
      const response = await api.get('/email-config');
      console.log('Email config response:', response.data);
      if (response.data.success) {
        const recipients = response.data.data.reportRecipients || [];
        console.log('Setting recipients:', recipients);
        setRecipients(recipients);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
      setError('Konfigürasyon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Save email configuration
  const saveEmailConfig = async () => {
    try {
      setSaving(true);
      setError('');
      
      console.log('Saving email config with recipients:', recipients);
      const response = await api.put('/email-config', {
        reportRecipients: recipients
      });
      console.log('Save response:', response.data);
      
      if (response.data.success) {
        setSuccess('Konfigürasyon başarıyla kaydedildi!');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh the data to make sure it's saved
        fetchEmailConfig();
      }
    } catch (error) {
      console.error('Error saving email config:', error);
      setError(error.response?.data?.message || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  // Add new email
  const addEmail = () => {
    const email = newEmail.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setError('Geçerli bir email adresi girin');
      return;
    }

    // Check if email already exists
    if (recipients.includes(email)) {
      setError('Bu email adresi zaten mevcut');
      return;
    }

    setRecipients([...recipients, email]);
    setNewEmail('');
    setError('');
  };

  // Remove email
  const removeEmail = (emailToRemove) => {
    setRecipients(recipients.filter(email => email !== emailToRemove));
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addEmail();
    }
  };

  // Load configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEmailConfig();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewEmail('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="email-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📧 Email Konfigürasyonu</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">📧 Konfigürasyon yükleniyor...</div>
          ) : (
            <>
              <div className="section">
                <h3>Rapor Alıcıları</h3>
                <p>Günlük raporların gönderileceği email adreslerini yönetin.</p>
                
                <div className="recipients-list">
                  {recipients.map((email, index) => (
                    <div key={index} className="recipient-item">
                      <span className="email-address">{email}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => removeEmail(email)}
                        title="Kaldır"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {recipients.length === 0 && (
                    <div className="no-recipients">
                      Henüz email adresi eklenmemiş.
                    </div>
                  )}
                </div>

                <div className="add-email-section">
                  <div className="input-group">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="yeni@email.com"
                      className="email-input"
                    />
                    <button 
                      onClick={addEmail}
                      className="add-btn"
                      disabled={!newEmail.trim()}
                    >
                      ➕ Ekle
                    </button>
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
            onClick={saveEmailConfig}
            disabled={saving || loading || recipients.length === 0}
          >
            {saving ? '💾 Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigModal; 