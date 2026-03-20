const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    },
    skill2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);