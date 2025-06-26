import React, { useState, useEffect } from 'react';
import { companiesAPI } from '../services/api';
import './CompanyModal.css';

const CompanyModal = ({ 
  isOpen, 
  onClose, 
  company, 
  onCompanyUpdated,
  filterOptions,
  onCallRecordCreated
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    person: '',
    phone: '',
    email: '',
    city: '',
    production: '',
    brands: [],
    spectro: '',
    model: '',
    spectroAge: '',
    notes: '',
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [callResult, setCallResult] = useState('');
  const [callNotes, setCallNotes] = useState('');

  // Populate form when company changes
  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        person: company.person || '',
        phone: company.phone || '',
        email: company.email || '',
        city: company.city || '',
        production: company.production || '',
        brands: company.brands || [],
        spectro: company.spectro || '',
        model: company.model || '',
        spectroAge: company.spectroAge || '',
        notes: company.notes || '',
        isActive: company.isActive !== undefined ? company.isActive : true
      });
    }
  }, [company]);



  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBrandChange = (brand) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean the form data to convert empty strings to undefined for enum fields
      const cleanedFormData = { ...formData };
      
      // Convert empty strings to undefined for enum fields to avoid validation errors
      if (cleanedFormData.production === '') {
        delete cleanedFormData.production;
      }
      if (cleanedFormData.spectro === '') {
        delete cleanedFormData.spectro;
      }
      if (cleanedFormData.spectroAge === '') {
        delete cleanedFormData.spectroAge;
      }
      if (cleanedFormData.city === '') {
        delete cleanedFormData.city;
      }

      // First, update the company data
      const companyResponse = await companiesAPI.updateCompany(company._id, cleanedFormData);
      
      if (companyResponse.data.success) {
        // If call result is provided, save the call record
        if (callResult) {
          try {
            const callResponse = await companiesAPI.createCallRecord({
              companyId: company._id,
              callResult,
              notes: callNotes
            });

            if (callResponse.data.success) {
              console.log('✅ Call record created successfully:', callResponse.data);
              
              // Notify parent component to refresh user profile
              if (onCallRecordCreated) {
                console.log('🔄 Calling onCallRecordCreated...');
                onCallRecordCreated();
              }
              
              // Refresh calendar if available
              if (window.refreshCalendar) {
                console.log('📅 Calling window.refreshCalendar...');
                window.refreshCalendar();
              } else {
                console.log('❌ window.refreshCalendar not available');
              }
              
              // Refresh today's calls list if available
              if (window.refreshTodaysCalls) {
                console.log('📞 Calling window.refreshTodaysCalls...');
                window.refreshTodaysCalls();
              } else {
                console.log('❌ window.refreshTodaysCalls not available');
              }
              
              setCallResult('');
              setCallNotes('');
            }
          } catch (callErr) {
            console.error('Call record save failed:', callErr);
            // Don't fail the whole operation if call record fails
          }
        }

        setSuccess(true);
        onCompanyUpdated(companyResponse.data.data);
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError('Güncelleme başarısız oldu');
      }
    } catch (err) {
      setError('Hata: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Firma Düzenle</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="company-form">
            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Temel Bilgiler</h3>
                
                <div className="form-group">
                  <label htmlFor="companyName">Firma Adı</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Firma adını giriniz"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="person">İletişim Kişisi</label>
                  <input
                    type="text"
                    id="person"
                    name="person"
                    value={formData.person}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="İletişim kişisi adı"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefon</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+90 XXX XXX XX XX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-posta</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ornek@firma.com (opsiyonel)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">Şehir</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Şehir seçiniz</option>
                    {filterOptions && filterOptions.cities && filterOptions.cities.length > 0 ? (
                      filterOptions.cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))
                    ) : (
                      <option value="" disabled>Şehirler yükleniyor...</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Production Information */}
              <div className="form-section">
                <h3>Üretim Bilgileri</h3>
                
                <div className="form-group">
                  <label htmlFor="production">Üretim Türü</label>
                  <select
                    id="production"
                    name="production"
                    value={formData.production}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Üretim türü seçiniz</option>
                    <option value="Boyahane">Boyahane</option>
                    <option value="Konfeksiyon">Konfeksiyon</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Kullandığı Markalar</label>
                  <div className="checkbox-group">
                    {['X-Rite', 'SDL Atlas', 'Pantone'].map(brand => (
                      <label key={brand} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.brands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="spectro">Spektrofotometre Markası</label>
                  <select
                    id="spectro"
                    name="spectro"
                    value={formData.spectro}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Spektro markası seçiniz</option>
                    {filterOptions && filterOptions.spectros && filterOptions.spectros.length > 0 ? (
                      filterOptions.spectros.map(spectro => (
                        <option key={spectro} value={spectro}>
                          {spectro === 'Xrite' ? 'X-Rite' : spectro}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Xrite">X-Rite</option>
                        <option value="Datacolor">Datacolor</option>
                        <option value="Minolta">Minolta</option>
                        <option value="Hunterlab">Hunterlab</option>
                        <option value="İhtiyaç Yok">İhtiyaç Yok</option>
                        <option value="Diğer">Diğer</option>
                        <option value="bilinmiyor">Bilinmiyor</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="model">Model</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Spektro model bilgisi"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="spectroAge">Spektro Yaşı</label>
                  <select
                    id="spectroAge"
                    name="spectroAge"
                    value={formData.spectroAge}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Yaş seçiniz</option>
                    <option value="Eski">Eski</option>
                    <option value="Orta">Orta</option>
                    <option value="Yeni">Yeni</option>
                    <option value="Belirtilmemiş">Belirtilmemiş</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Call Result Section */}
            <div className="form-section">
              <h3>Arama Sonucu (Opsiyonel)</h3>
              
              <div className="form-group">
                <label htmlFor="callResult">Arama Sonucu</label>
                <select
                  id="callResult"
                  value={callResult}
                  onChange={(e) => setCallResult(e.target.value)}
                  className="form-select"
                >
                  <option value="">Sonuç seçiniz</option>
                  <option value="Sekreter">Sekreter</option>
                  <option value="Satınalma">Satınalma</option>
                  <option value="Lab Şefi">Lab Şefi</option>
                  <option value="İhtiyaç Yok">İhtiyaç Yok</option>
                  <option value="Potansiyel">Potansiyel</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="callNotes">Arama Notları</label>
                <textarea
                  id="callNotes"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="form-textarea"
                  placeholder="Arama ile ilgili notlar..."
                  rows="3"
                />
              </div>
            </div>



            {/* Error and Success Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">✅ Değişiklikler başarıyla kaydedildi!</div>}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Güncelleniyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal; 