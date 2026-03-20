const Message = require('../models/Message');
const Match = require('../models/Match');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const messageController = {

  getMessages: async (req, res) => {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.user._id }, { user2: req.user._id }]
    });
    
    if (!match) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      Message.find({ match: matchId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments({ match: matchId })
    ]);
    
    await Message.updateMany(
      { match: matchId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    sendPaginated(res, messages.reverse(), total, page, limit);
  },

  sendMessage: async (req, res) => {
    const { matchId } = req.params;
    const { content } = req.body;
    
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      status: 'active'
    });
    
    if (!match) {
      return res.status(403).json({ success: false, message: 'Cannot send message' });
    }
    
    const message = await Message.create({
      match: matchId,
      sender: req.user._id,
      content,
    });
    
    await message.populate('sender', 'name avatar');
    
    await Match.findByIdAndUpdate(matchId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });
    
    sendSuccess(res, { message }, 'Message sent', 201);
  },
};

module.exports = messageController;