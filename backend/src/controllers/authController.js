const User = require('../models/User');
const tokenService = require('../services/tokenService');
const { sendSuccess } = require('../utils/apiResponse');

const authController = {

  googleCallback: async (req, res) => {
    try {
      const user = req.user;
      
      const accessToken = tokenService.generateAccessToken(user._id);
      const refreshToken = tokenService.generateRefreshToken(user._id);
      
      await User.findByIdAndUpdate(user._id, { refreshToken });
      
      tokenService.setRefreshTokenCookie(res, refreshToken);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
      
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  },

  getMe: async (req, res) => {
    const user = await User.findById(req.user._id)
      .populate('offeredSkills')
      .populate('wantedSkills')
      .select('-refreshToken');
    
    sendSuccess(res, { user });
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          success: false, 
          message: 'No refresh token. Please log in.' 
        });
      }
      
      const decoded = tokenService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid refresh token. Please log in.' 
        });
      }
      
      const newAccessToken = tokenService.generateAccessToken(user._id);
      const newRefreshToken = tokenService.generateRefreshToken(user._id);
      
      await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
      tokenService.setRefreshTokenCookie(res, newRefreshToken);
      
      sendSuccess(res, { accessToken: newAccessToken });
      
    } catch (error) {
      res.status(401).json({ success: false, message: 'Token refresh failed.' });
    }
  },

  logout: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      tokenService.clearRefreshTokenCookie(res);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  },
};

module.exports = authController;