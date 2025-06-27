import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user session
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      // Encode user info as base64 for headers
      const encodedUser = btoa(unescape(encodeURIComponent(user)));
      config.headers['X-User-Session'] = encodedUser;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid
      localStorage.removeItem('user');
      // Redirect to login page instead of root to avoid infinite loop
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/profile'),
  // Version without auto-redirect for initialization validation
  getProfileSafe: () => {
    return axios.get('/api/auth/profile', {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Session': (() => {
          const user = localStorage.getItem('user');
          return user ? btoa(unescape(encodeURIComponent(user))) : '';
        })()
      }
    });
  }
};

// Companies API
export const companiesAPI = {
  // Get companies with search, filters, and pagination
  getCompanies: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return api.get(`/companies?${queryParams.toString()}`);
  },
  
  // Get company by ID
  getCompanyById: (id) => api.get(`/companies/${id}`),
  
  // Create new company
  createCompany: (companyData) => api.post('/companies', companyData),
  
  // Update company
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
  
  // Delete company
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  
  // Get filter options
  getFilterOptions: () => api.get('/companies/filter-options'),
  
  // Get company statistics
  getCompanyStats: () => api.get('/companies/stats'),
  
  // Create call record
  createCallRecord: (callData) => api.post('/companies/call-records', callData),
  
  // Get call records for a company
  getCompanyCallRecords: (companyId) => api.get(`/companies/${companyId}/call-records`),
};

// Reports API
export const reportsAPI = {
  // Test daily email report (development only)
  testDailyReport: () => api.post('/reports/test-daily-report'),
};

export default api; 