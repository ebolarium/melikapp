import React, { useState, useEffect, useCallback } from 'react';
import { companiesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CompanyModal from './CompanyModal';
import CallAnimation from './CallAnimation';
import './Firmalar.css';

const Firmalar = () => {
  const { refreshUser } = useAuth();
  // State management
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    productions: [],
    spectros: [],
    spectroAges: []
  });

  // Search and filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    production: '',
    spectro: '',
    spectroAge: '',
    isActive: ''
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Sorting state
  const [sortBy, setSortBy] = useState('companyName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Animation state
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState('heart');
  const [targetReached, setTargetReached] = useState(false);
  const [isAnimationSequence, setIsAnimationSequence] = useState(false);

  // Fetch companies with current filters and pagination
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        sortBy,
        sortOrder,
        ...filters
      };

      const response = await companiesAPI.getCompanies(params);
      
      if (response.data.success) {
        setCompanies(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch companies');
      }
    } catch (err) {
      setError('Error fetching companies: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, sortBy, sortOrder, filters]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await companiesAPI.getFilterOptions();
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Refetch companies when dependencies change
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit, 
      currentPage: 1 
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setFilters({
      city: '',
      production: '',
      spectro: '',
      spectroAge: '',
      isActive: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Handle edit button click
  const handleEditClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  // Handle company update
  const handleCompanyUpdated = (updatedCompany) => {
    setCompanies(prevCompanies => 
      prevCompanies.map(company => 
        company._id === updatedCompany._id ? updatedCompany : company
      )
    );
  };

  // Handle call record created (same logic as Dashboard)
  const handleCallRecordCreated = async () => {
    console.log('📞 Call recorded from Firmalar page - starting refresh...');
    
    // Refresh companies list to show updated call counts
    await fetchCompanies();
    
    // Refresh global user data in AuthContext (this will update AppBar points)
    console.log('🔄 Calling refreshUser from Firmalar...');
    const refreshResult = await refreshUser();
    console.log('🔄 RefreshUser result:', refreshResult);
    
    // Check if target is reached after this call
    try {
      const updatedProfile = await authAPI.getProfile();
      if (updatedProfile.data.success) {
        const user = updatedProfile.data.user;
        console.log('📊 Updated user data:', { points: user.points, todaysCalls: user.todaysCalls });
        const hasReachedTarget = user.todaysCalls >= user.targetCallNumber && user.targetCallNumber > 0;
        
        if (hasReachedTarget) {
          // Target reached - play heart then crown sequence
          setTargetReached(true);
          setIsAnimationSequence(true);
          setAnimationType('heart');
        } else {
          // Normal call - just play heart animation
          setTargetReached(false);
          setIsAnimationSequence(false);
          setAnimationType('heart');
        }
        
        setShowAnimation(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // Still show animation even if profile check fails
      setTargetReached(false);
      setIsAnimationSequence(false);
      setAnimationType('heart');
      setShowAnimation(true);
    }
  };

  return (
    <main className="main-content">
      <div className="content-container">
        <div className="firmalar-header">
          <h1>Tüm Firma Listesi</h1>
          <div className="company-count">
            {pagination.totalCount} firma bulundu
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Firma adı, kişi, telefon, email veya şehir ara..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Şehirler</option>
              {filterOptions.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filters.production}
              onChange={(e) => handleFilterChange('production', e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Üretim Türleri</option>
              {filterOptions.productions.map(production => (
                <option key={production} value={production}>{production}</option>
              ))}
            </select>

            <select
              value={filters.spectro}
              onChange={(e) => handleFilterChange('spectro', e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Spektro Markaları</option>
              {filterOptions.spectros.map(spectro => (
                <option key={spectro} value={spectro}>{spectro}</option>
              ))}
            </select>

            <select
              value={filters.spectroAge}
              onChange={(e) => handleFilterChange('spectroAge', e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Spektro Yaşları</option>
              {filterOptions.spectroAges.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Durumlar</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>

            <button onClick={clearFilters} className="clear-filters-btn">
              Temizle
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Firmalar yükleniyor...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={fetchCompanies} className="retry-btn">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Companies Table */}
        {!loading && !error && (
          <>
            <div className="table-container">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('companyName')} className="sortable">
                      Firma Adı {renderSortIcon('companyName')}
                    </th>
                    <th onClick={() => handleSort('person')} className="sortable">
                      Kişi {renderSortIcon('person')}
                    </th>
                    <th onClick={() => handleSort('city')} className="sortable">
                      Şehir {renderSortIcon('city')}
                    </th>
                    <th onClick={() => handleSort('production')} className="sortable">
                      Üretim {renderSortIcon('production')}
                    </th>
                    <th onClick={() => handleSort('spectro')} className="sortable">
                      Spektro {renderSortIcon('spectro')}
                    </th>
                    <th>Telefon</th>
                    <th>Email</th>
                    <th onClick={() => handleSort('totalCalls')} className="sortable">
                      Arama {renderSortIcon('totalCalls')}
                    </th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">
                        Kriterlere uygun firma bulunamadı
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company._id}>
                        <td className="company-name">{company.companyName}</td>
                        <td>{company.person || '-'}</td>
                        <td>{company.city || '-'}</td>
                        <td>{company.production || '-'}</td>
                        <td>{company.spectro || '-'}</td>
                        <td>{company.phone || '-'}</td>
                        <td>{company.email || '-'}</td>
                        <td className="text-center">{company.totalCalls}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit" 
                              title="Düzenle"
                              onClick={() => handleEditClick(company)}
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <div className="pagination-info">
                <select 
                  value={pagination.limit} 
                  onChange={handlePageSizeChange}
                  className="page-size-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>firma gösteriliyor</span>
                <span className="pagination-details">
                  {pagination.currentPage} / {pagination.totalPages} sayfa 
                  ({pagination.totalCount} toplam)
                </span>
              </div>

              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  className="pagination-btn"
                  title="İlk sayfa"
                >
                  ⏮️
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="pagination-btn"
                  title="Önceki sayfa"
                >
                  ⬅️
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.currentPage - 2);
                  const pageNum = startPage + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-btn ${pageNum === pagination.currentPage ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="pagination-btn"
                  title="Sonraki sayfa"
                >
                  ➡️
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="pagination-btn"
                  title="Son sayfa"
                >
                  ⏭️
                </button>
              </div>
            </div>
          </>
        )}

        {/* Company Edit Modal */}
        <CompanyModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          company={selectedCompany}
          onCompanyUpdated={handleCompanyUpdated}
          onCallRecordCreated={handleCallRecordCreated}
          filterOptions={filterOptions}
        />

        {/* Call Success Animation */}
        <CallAnimation 
          isVisible={showAnimation}
          animationType={animationType}
          isSequence={isAnimationSequence}
          targetReached={targetReached}
          onComplete={() => {
            setShowAnimation(false);
            setIsAnimationSequence(false);
            setTargetReached(false);
          }}
        />
      </div>
    </main>
  );
};

export default Firmalar; 