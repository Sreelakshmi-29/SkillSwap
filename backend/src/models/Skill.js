const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology',
        'Music',
        'Art & Design',
        'Language',
        'Sports & Fitness',
        'Cooking',
        'Business',
        'Academic',
        'Crafts',
        'Other',
      ],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    type: {
      type: String,
      required: true,
      enum: ['offer', 'want'],
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SkillSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Skill', SkillSchema);