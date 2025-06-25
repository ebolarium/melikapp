const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const newUser = new User({
      userName,
      email,
      password, // Simple password storage (no hashing)
      targetCallNumber: 0,
      level: 'Junior',
      points: 0
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        level: newUser.level,
        targetCallNumber: newUser.targetCallNumber,
        points: newUser.points
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password using bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        level: user.level,
        targetCallNumber: user.targetCallNumber,
        points: user.points,
        todaysCalls: user.todaysCalls || 0,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// @desc    Get all users (for testing)
// @route   GET /api/auth/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        userName: user.userName,
        email: user.email,
        level: user.level,
        targetCallNumber: user.targetCallNumber,
        points: user.points,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if daily reset is needed
    const today = new Date();
    const lastCallDate = user.lastCallDate || new Date(0);
    const isNewDay = today.toDateString() !== lastCallDate.toDateString();
    
    let todaysCallsCount = user.todaysCalls || 0;
    
    // Reset todaysCalls if it's a new day
    if (isNewDay && todaysCallsCount > 0) {
      await User.findByIdAndUpdate(user._id, { todaysCalls: 0 });
      todaysCallsCount = 0;
      console.log(`Daily reset applied for user: ${user.userName}`);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        level: user.level,
        targetCallNumber: user.targetCallNumber,
        points: user.points,
        todaysCalls: todaysCallsCount,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getAllUsers,
  getProfile
}; 