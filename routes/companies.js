const express = require('express');
const router = express.Router();
const simpleAuth = require('../middleware/simpleAuth');
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getFilterOptions,
  getCompanyStats,
  createCallRecord,
  getCompanyCallRecords,
  getPotentialCompanies
} = require('../controllers/companyController');

// GET /api/companies/filter-options - Get unique values for filters (must come before /:id)
router.get('/filter-options', simpleAuth, getFilterOptions);

// GET /api/companies/stats - Get company statistics (must come before /:id)
router.get('/stats', simpleAuth, getCompanyStats);

// GET /api/companies/potential - Get companies with "Potansiyel" calls (must come before /:id)
router.get('/potential', simpleAuth, getPotentialCompanies);

// POST /api/companies/call-records - Create call record (must come before /:id)
router.post('/call-records', simpleAuth, createCallRecord);

// GET /api/companies - Get all companies with search, filters, pagination
router.get('/', simpleAuth, getCompanies);

// GET /api/companies/:id - Get company by ID (must come after static routes)
router.get('/:id', simpleAuth, getCompanyById);

// POST /api/companies - Create new company
router.post('/', simpleAuth, createCompany);

// PUT /api/companies/:id - Update company
router.put('/:id', simpleAuth, updateCompany);

// DELETE /api/companies/:id - Delete company
router.delete('/:id', simpleAuth, deleteCompany);

// GET /api/companies/:id/call-records - Get call records for a company
router.get('/:id/call-records', simpleAuth, getCompanyCallRecords);

module.exports = router; 