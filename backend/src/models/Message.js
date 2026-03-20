const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ match: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);