const Match = require('../models/Match');
const matchService = require('../services/matchService');
const { sendSuccess } = require('../utils/apiResponse');

const matchController = {

  getPotentialMatches: async (req, res) => {
    const potentialMatches = await matchService.findPotentialMatches(req.user._id);
    sendSuccess(res, { matches: potentialMatches });
  },

  getMyMatches: async (req, res) => {
    const matches = await Match.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      status: { $ne: 'cancelled' }
    })
    .populate('user1', '-refreshToken -googleId')
    .populate('user2', '-refreshToken -googleId')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });
    
    sendSuccess(res, { matches });
  },

  createMatch: async (req, res) => {
    const { targetUserId } = req.body;
    const { match, isNew } = await matchService.createMatch(req.user._id, targetUserId);
    
    await match.populate([
      { path: 'user1', select: '-refreshToken' },
      { path: 'user2', select: '-refreshToken' }
    ]);
    
    sendSuccess(
      res, 
      { match }, 
      isNew ? 'Match created!' : 'Already matched',
      isNew ? 201 : 200
    );
  },

  getMatchById: async (req, res) => {
    const match = await Match.findOne({
      _id: req.params.id,
      $or: [{ user1: req.user._id }, { user2: req.user._id }]
    })
    .populate('user1', '-refreshToken -googleId')
    .populate('user2', '-refreshToken -googleId');
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    sendSuccess(res, { match });
  },

  cancelMatch: async (req, res) => {
    const match = await Match.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ user1: req.user._id }, { user2: req.user._id }]
      },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    sendSuccess(res, { match }, 'Match cancelled');
  },
};

module.exports = matchController;