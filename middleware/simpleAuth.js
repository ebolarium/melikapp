const { User } = require('../models');

// Simple authentication middleware - just checks if user exists
const simpleAuth = async (req, res, next) => {
  try {
    // Check for user session in headers
    const userSession = req.headers['x-user-session'];
    
    if (!userSession) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Decode base64 and parse user data
    const decodedUser = Buffer.from(userSession, 'base64').toString('utf8');
    const userData = JSON.parse(decodedUser);
    
    if (!userData || !userData.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session data'
      });
    }

    // Verify user still exists in database
    const user = await User.findById(userData.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set user in request object
    req.user = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      level: user.level
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = simpleAuth; 