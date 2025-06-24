const Company = require('../models/Company');
const CallRecord = require('../models/CallRecord');
const User = require('../models/User');

// Get all companies with search, filtering, and pagination
const getCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      city,
      production,
      spectro,
      spectroAge,
      isActive,
      sortBy = 'companyName',
      sortOrder = 'asc'
    } = req.query;

    // Build search query
    const searchQuery = {};

    // Text search across multiple fields
    if (search) {
      searchQuery.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { person: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Column filters
    if (city) {
      searchQuery.city = { $regex: city, $options: 'i' };
    }
    if (production) {
      searchQuery.production = production;
    }
    if (spectro) {
      searchQuery.spectro = spectro;
    }
    if (spectroAge) {
      searchQuery.spectroAge = spectroAge;
    }
    if (isActive !== undefined) {
      searchQuery.isActive = isActive === 'true';
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute queries
    const [companies, totalCount] = await Promise.all([
      Company.find(searchQuery)
        .populate('createdBy', 'userName email')
        .populate('assignedTo', 'userName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Company.countDocuments(searchQuery)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('createdBy', 'userName email')
      .populate('assignedTo', 'userName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });

  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company',
      error: error.message
    });
  }
};

// Create new company
const createCompany = async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      createdBy: req.user.id
    };

    const company = new Company(companyData);
    await company.save();

    // Populate the response
    await company.populate('createdBy', 'userName email');
    await company.populate('assignedTo', 'userName email');

    res.status(201).json({
      success: true,
      data: company,
      message: 'Company created successfully'
    });

  } catch (error) {
    console.error('Error creating company:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating company',
      error: error.message
    });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'userName email')
      .populate('assignedTo', 'userName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company,
      message: 'Company updated successfully'
    });

  } catch (error) {
    console.error('Error updating company:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
};

// Get filter options (unique values for dropdowns)
const getFilterOptions = async (req, res) => {
  try {
    const [cities, productions, spectros, spectroAges] = await Promise.all([
      Company.distinct('city', { city: { $ne: null, $ne: '' } }),
      Company.distinct('production', { production: { $ne: null, $ne: '' } }),
      Company.distinct('spectro', { spectro: { $ne: null, $ne: '' } }),
      Company.distinct('spectroAge', { spectroAge: { $ne: null, $ne: '' } })
    ]);

    res.json({
      success: true,
      data: {
        cities: cities.sort(),
        productions: productions.sort(),
        spectros: spectros.sort(),
        spectroAges: spectroAges.sort()
      }
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    });
  }
};

// Get company statistics
const getCompanyStats = async (req, res) => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      companiesByCity,
      companiesByProduction
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ isActive: true }),
      Company.aggregate([
        { $match: { city: { $ne: null, $ne: '' } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Company.aggregate([
        { $match: { production: { $ne: null, $ne: '' } } },
        { $group: { _id: '$production', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalCompanies,
        activeCompanies,
        inactiveCompanies: totalCompanies - activeCompanies,
        topCities: companiesByCity,
        productionTypes: companiesByProduction
      }
    });

  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company statistics',
      error: error.message
    });
  }
};

// Create call record
const createCallRecord = async (req, res) => {
  try {
    const { companyId, callResult, notes } = req.body;
    
    // Validate that company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const callRecord = new CallRecord({
      company: companyId,
      user: req.user.id,
      callResult,
      notes: notes || '',
      callDate: new Date()
    });

    await callRecord.save();

    // Populate the response
    await callRecord.populate('company', 'companyName');
    await callRecord.populate('user', 'userName');

    res.status(201).json({
      success: true,
      data: callRecord,
      message: 'Call record created successfully'
    });

  } catch (error) {
    console.error('Error creating call record:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating call record',
      error: error.message
    });
  }
};

// Get call records for a company
const getCompanyCallRecords = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const callRecords = await CallRecord.find({ company: companyId })
      .populate('user', 'userName')
      .sort({ callDate: -1 });

    res.json({
      success: true,
      data: callRecords
    });

  } catch (error) {
    console.error('Error fetching call records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call records',
      error: error.message
    });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getFilterOptions,
  getCompanyStats,
  createCallRecord,
  getCompanyCallRecords
}; 