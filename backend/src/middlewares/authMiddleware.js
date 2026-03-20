const tokenService = require('../services/tokenService');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    const decoded = tokenService.verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId).select('-refreshToken');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.',
      });
    }

    req.user = user;
    
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

module.exports = { protect };