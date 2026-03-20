const { Server } = require('socket.io');
const Message = require('../models/Message');
const Match = require('../models/Match');
const tokenService = require('../services/tokenService');
const User = require('../models/User');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = tokenService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-refreshToken');
      
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      next();
      
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected: ${socket.user.name}`);
    
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('user_online', { userId });

    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
      console.log(`User ${socket.user.name} joined room: match_${matchId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { matchId, content } = data;
        
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: userId }, { user2: userId }],
          status: 'active'
        });
        
        if (!match) {
          socket.emit('error', { message: 'Cannot send to this match' });
          return;
        }
        
        const message = await Message.create({
          match: matchId,
          sender: userId,
          content,
        });
        
        await message.populate('sender', 'name avatar');
        
        await Match.findByIdAndUpdate(matchId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });
        
        io.to(`match_${matchId}`).emit('new_message', {
          message: {
            _id: message._id,
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt,
            isRead: false,
          }
        });
        
      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing_start', ({ matchId }) => {
      socket.to(`match_${matchId}`).emit('user_typing', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('typing_stop', ({ matchId }) => {
      socket.to(`match_${matchId}`).emit('user_stopped_typing', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      onlineUsers.delete(userId);
      socket.broadcast.emit('user_offline', { userId });
    });
  });

  return io;
};

module.exports = initializeSocket;