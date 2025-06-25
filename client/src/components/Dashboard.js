import React, { useState, useEffect } from 'react';
import { companiesAPI, authAPI } from '../services/api';
import './Dashboard.css';
import CompanyModal from './CompanyModal';
import CallAnimation from './CallAnimation';

// Donut Chart Component
const DonutChart = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-loading">Yükleniyor...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="chart-no-data">Veri bulunamadı</div>;
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Define specific colors for each spectro brand
  const getSpectroColor = (name) => {
    switch (name) {
      case 'Xrite':
        return '#FF8C00'; // Orange
      case 'Datacolor':
        return '#FF0000'; // Red
      case 'Minolta':
        return '#0000FF'; // Blue
      case 'Hunterlab':
        return '#008000'; // Green
      case 'İhtiyaç Yok':
        return '#800080'; // Purple
      case 'bilinmiyor':
      case 'Bilinmiyor':
      case 'Diğer':
      default:
        return '#D3D3D3'; // Light gray
    }
  };
  
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    cumulativePercentage += percentage;
    
    const color = getSpectroColor(item.name);
    
    return {
      ...item,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
      color
    };
  });

  // SVG path for donut segments
  const createPath = (startAngle, endAngle, innerRadius = 30, outerRadius = 80) => {
    const start = polarToCartesian(100, 100, outerRadius, endAngle);
    const end = polarToCartesian(100, 100, outerRadius, startAngle);
    const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
    const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-svg-container">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              className="donut-segment"
            />
          ))}
          {/* Center text */}
          <text x="100" y="95" textAnchor="middle" className="donut-center-text">
            Toplam
          </text>
          <text x="100" y="115" textAnchor="middle" className="donut-center-number">
            {total}
          </text>
        </svg>
      </div>
      
      <div className="donut-legend">
        {segments.map((segment, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="legend-text">
              {segment.name} ({segment.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pantone Donut Chart Component
const PantoneDonutChart = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-loading">Yükleniyor...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="chart-no-data">Pantone kullanıcısı bulunamadı</div>;
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Define specific colors for called/not called
  const getPantoneColor = (name) => {
    switch (name) {
      case 'Arandı':
        return '#10b981'; // Green
      case 'Aranmadı':
        return '#f59e0b'; // Orange
      default:
        return '#D3D3D3'; // Light gray
    }
  };
  
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    cumulativePercentage += percentage;
    
    const color = getPantoneColor(item.name);
    
    return {
      ...item,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
      color
    };
  });

  // SVG path for donut segments
  const createPath = (startAngle, endAngle, innerRadius = 30, outerRadius = 80) => {
    const start = polarToCartesian(100, 100, outerRadius, endAngle);
    const end = polarToCartesian(100, 100, outerRadius, startAngle);
    const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
    const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-svg-container">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              className="donut-segment"
            />
          ))}
          {/* Center text */}
          <text x="100" y="95" textAnchor="middle" className="donut-center-text">
            Pantone
          </text>
          <text x="100" y="115" textAnchor="middle" className="donut-center-number">
            {total}
          </text>
        </svg>
      </div>
      
      <div className="donut-legend">
        {segments.map((segment, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="legend-text">
              {segment.name} ({segment.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Random Companies Card Component
const RandomCompaniesCard = ({ companies, loading, onCompanyClick, filterOptions, selectedCity, selectedBrands, onCityChange, onBrandsChange, onBringClick }) => {
  const handleCompanyClick = (company) => {
    onCompanyClick(company);
  };

  if (loading) {
    return (
      <div className="random-companies-card">
        <h3>Rastgele Firmalar</h3>
        <div className="companies-loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="random-companies-card">
      <div className="card-header">
        <h3>Rastgele Firmalar</h3>
        <div className="card-controls">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="city-selector"
          >
            <option value="">Tüm Şehirler</option>
            {filterOptions && filterOptions.cities && filterOptions.cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={selectedBrands}
            onChange={(e) => onBrandsChange(e.target.value)}
            className="brands-selector"
          >
            <option value="">Tüm Markalar</option>
            <option value="X-Rite">X-Rite</option>
            <option value="SDL Atlas">SDL Atlas</option>
            <option value="Pantone">Pantone</option>
          </select>
          <button 
            onClick={onBringClick}
            className="bring-button"
          >
            Getir
          </button>
        </div>
      </div>
      <div className="companies-list">
        {companies.map((company, index) => (
          <div key={company._id || index} className="company-item">
            <div className="company-info">
              <span className="company-name" title={company.companyName}>
                {company.companyName}
              </span>
              <span className="company-separator">-</span>
              <span className="company-brands" title={company.brands && company.brands.length > 0 ? company.brands.join(', ') : 'Marka bilgisi yok'}>
                {company.brands && company.brands.length > 0 
                  ? company.brands.join(', ') 
                  : 'Marka yok'
                }
              </span>
            </div>
            <button 
              className="call-button"
              onClick={() => handleCompanyClick(company)}
              title="Firma detaylarını görüntüle"
            >
              📞
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [companyCount, setCompanyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spectroData, setSpectroData] = useState([]);
  const [randomCompanies, setRandomCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    productions: [],
    spectros: [],
    spectroAges: []
  });
  const [userProfile, setUserProfile] = useState({
    targetCallNumber: 0,
    todaysCalls: 0,
    userName: ''
  });
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBrands, setSelectedBrands] = useState('');
  const [processedCompanies, setProcessedCompanies] = useState(0);
  const [pantoneData, setPantoneData] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState('points');
  const [targetReached, setTargetReached] = useState(false);
  const [isAnimationSequence, setIsAnimationSequence] = useState(false);

  // Handle company click to open modal
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await companiesAPI.getFilterOptions();
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (err) {
      console.error('Filter options alınamadı:', err);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUserProfile({
          targetCallNumber: response.data.user.targetCallNumber || 0,
          todaysCalls: response.data.user.todaysCalls || 0,
          userName: response.data.user.userName || ''
        });
      }
    } catch (err) {
      console.error('User profile alınamadı:', err);
    }
  };

  // Generate random companies with optional city and brands filter (excluding companies with spectro)
  const generateRandomCompanies = async (cityFilter = '', brandsFilter = '') => {
    try {
      const params = { 
        page: 1, 
        limit: 10000 // Get all companies (no backend filtering)
      };
      
      const response = await companiesAPI.getCompanies(params);
      
      if (response.data.success) {
        const companies = response.data.data;
        
        // Filter out companies that have spectro equipment or no need (only show "bilinmiyor" and null/undefined)
        let filteredCompanies = companies.filter(company => {
          const spectro = company.spectro;
          return !spectro || spectro === 'bilinmiyor' || spectro === 'Bilinmiyor' || spectro.trim() === '';
        });
        
        // Apply city filter if selected
        if (cityFilter) {
          filteredCompanies = filteredCompanies.filter(company => {
            return company.city && company.city.toLowerCase().includes(cityFilter.toLowerCase());
          });
        }
        
        // Apply brands filter if selected
        if (brandsFilter) {
          filteredCompanies = filteredCompanies.filter(company => {
            return company.brands && company.brands.includes(brandsFilter);
          });
        }
        
        // Get 20 random companies from filtered list
        const shuffled = filteredCompanies.sort(() => 0.5 - Math.random());
        const randomSelected = shuffled.slice(0, 20);
        setRandomCompanies(randomSelected);
      }
    } catch (err) {
      console.error('Random companies alınamadı:', err);
    }
  };

  // Handle city selection change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    generateRandomCompanies(city, selectedBrands);
  };

  // Handle brands selection change
  const handleBrandsChange = (brands) => {
    setSelectedBrands(brands);
    generateRandomCompanies(selectedCity, brands);
  };

  // Handle bring button click
  const handleBringClick = () => {
    generateRandomCompanies(selectedCity, selectedBrands);
  };

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all companies to analyze spectro data
      const response = await companiesAPI.getCompanies({ 
        page: 1, 
        limit: 10000 // Get all companies
      });
      
      if (response.data.success) {
        const companies = response.data.data;
        setCompanyCount(response.data.pagination.totalCount);
        
        // Process spectro data
        const spectroCount = {};
        companies.forEach(company => {
          const spectro = company.spectro || 'bilinmiyor';
          spectroCount[spectro] = (spectroCount[spectro] || 0) + 1;
        });
        
        // Convert to array and sort
        const spectroArray = Object.entries(spectroCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
          
        setSpectroData(spectroArray);
        
        // Calculate companies that have been processed (called at least once)
        const companiesWithCalls = companies.filter(company => 
          company.totalCalls > 0
        ).length;
        
        // Alternative: Calculate companies with known spectro info (excluding "bilinmiyor")
        const companiesWithKnownSpectro = Object.entries(spectroCount)
          .filter(([name]) => name !== 'bilinmiyor' && name !== 'Bilinmiyor')
          .reduce((sum, [, count]) => sum + count, 0);
        
        // Use the higher number between called companies and companies with spectro info
        const totalProcessedCompanies = Math.max(companiesWithCalls, companiesWithKnownSpectro);
        setProcessedCompanies(totalProcessedCompanies);
        
        // Process Pantone companies data
        const pantoneCompanies = companies.filter(company => 
          company.brands && company.brands.includes('Pantone')
        );
        
        const pantoneCalled = pantoneCompanies.filter(company => 
          company.totalCalls > 0
        ).length;
        
        const pantoneNotCalled = pantoneCompanies.length - pantoneCalled;
        
        const pantoneChartData = [
          { name: 'Arandı', count: pantoneCalled },
          { name: 'Aranmadı', count: pantoneNotCalled }
        ].filter(item => item.count > 0); // Only show non-zero values
        
        setPantoneData(pantoneChartData);
      } else {
        setError('Veri alınamadı');
      }
    } catch (err) {
      setError('Hata: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Test animation function
  const testAnimation = (type) => {
    setAnimationType(type);
    
    // Special case: if testing crown directly, treat it as target reached
    if (type === 'crown') {
      setTargetReached(true);
      setIsAnimationSequence(false); // Don't sequence when testing crown directly
    } else {
      setTargetReached(false);
      setIsAnimationSequence(false);
    }
    
    setShowAnimation(true);
  };

  // Expose test function globally for AppBar access
  useEffect(() => {
    window.testAnimation = testAnimation;
    return () => {
      delete window.testAnimation;
    };
  }, []);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
    fetchFilterOptions();
    fetchUserProfile();
    generateRandomCompanies(); // Generate initial random companies
  }, []);

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Progress Bar Section */}
        <div className="progress-section">
          {loading && <div className="loading-text">Yükleniyor...</div>}
          {error && <div className="error-text">{error}</div>}
          
          <div className="progress-container">
            <div className="progress-row">
              <span className="progress-start">{processedCompanies}</span>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: loading ? '0%' : companyCount > 0 ? `${(processedCompanies / companyCount) * 100}%` : '0%',
                    transition: loading ? 'none' : 'width 2s ease-in-out'
                  }}
                >
                </div>
              </div>
              
              <span className="progress-end">{loading ? '...' : companyCount}</span>
            </div>
          </div>

          {/* Daily Call Target Progress Bar */}
          <div className="progress-container daily-target">
            <div className="progress-row">
              <span className="progress-start">{userProfile.todaysCalls}</span>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill daily-calls"
                  style={{ 
                    width: userProfile.targetCallNumber > 0 
                      ? `${Math.min((userProfile.todaysCalls / userProfile.targetCallNumber) * 100, 100)}%`
                      : '0%',
                    transition: 'width 1s ease-in-out'
                  }}
                >
                </div>
              </div>
              
              <span className="progress-end">{userProfile.targetCallNumber}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="charts-column">
            <div className="donut-chart-container">
              <h3>Spektrofotometre Markaları</h3>
              <div className="donut-chart">
                <DonutChart data={spectroData} loading={loading} />
              </div>
            </div>
            
            <div className="donut-chart-container">
              <h3>Pantone Firmalar</h3>
              <div className="donut-chart">
                <PantoneDonutChart data={pantoneData} loading={loading} />
              </div>
            </div>
          </div>
          
          <div className="random-companies-container">
            <RandomCompaniesCard 
              companies={randomCompanies} 
              loading={loading} 
              onCompanyClick={handleCompanyClick}
              filterOptions={filterOptions}
              selectedCity={selectedCity}
              selectedBrands={selectedBrands}
              onCityChange={handleCityChange}
              onBrandsChange={handleBrandsChange}
              onBringClick={handleBringClick}
            />
          </div>
        </div>


      </div>

      {/* Company Details Modal */}
      {isModalOpen && selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          filterOptions={filterOptions}
          onCompanyUpdated={() => {}}
          onCallRecordCreated={async () => {
            // Refresh data first to get updated call counts
            await fetchUserProfile();
            await fetchDashboardData();
            
            // Check if target is reached after this call
            const updatedProfile = await authAPI.getProfile();
            if (updatedProfile.data.success) {
              const user = updatedProfile.data.user;
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
          }}
        />
      )}

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
    </main>
  );
};

export default Dashboard; 