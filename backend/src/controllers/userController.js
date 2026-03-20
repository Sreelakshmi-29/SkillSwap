const User = require('../models/User');
const tokenService = require('../services/tokenService');
const { sendSuccess } = require('../utils/apiResponse');

const userController = {

  getUserById: async (req, res) => {
    const user = await User.findById(req.params.id)
      .populate('offeredSkills')
      .populate('wantedSkills')
      .select('-refreshToken -googleId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    sendSuccess(res, { user });
  },

  updateProfile: async (req, res) => {
    const allowedFields = ['name', 'bio', 'location', 'avatar'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('offeredSkills')
    .populate('wantedSkills')
    .select('-refreshToken');
    
    sendSuccess(res, { user }, 'Profile updated successfully');
  },

  searchUsers: async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;
    
    const searchQuery = query ? {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
      _id: { $ne: req.user._id },
    } : {
      isActive: true,
      _id: { $ne: req.user._id },
    };
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .populate('offeredSkills')
        .populate('wantedSkills')
        .select('-refreshToken -googleId')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ rating: -1 }),
      User.countDocuments(searchQuery),
    ]);
    
    sendSuccess(res, {
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  },

  deleteAccount: async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    tokenService.clearRefreshTokenCookie(res);
    sendSuccess(res, null, 'Account deactivated successfully');
  },
};

module.exports = userController;