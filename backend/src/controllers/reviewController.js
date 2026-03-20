const Review = require('../models/Review');
const User = require('../models/User');
const Match = require('../models/Match');
const { sendSuccess } = require('../utils/apiResponse');

const reviewController = {

  createReview: async (req, res) => {
    const { revieweeId, matchId, rating, comment } = req.body;
    
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
    });
    
    if (!match) {
      return res.status(403).json({ 
        success: false, 
        message: 'Can only review users you are matched with' 
      });
    }
    
    const existing = await Review.findOne({ 
      reviewer: req.user._id, 
      match: matchId 
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this exchange' 
      });
    }
    
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      match: matchId,
      rating,
      comment,
    });
    
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await User.findByIdAndUpdate(revieweeId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });
    
    await review.populate('reviewer', 'name avatar');
    sendSuccess(res, { review }, 'Review submitted', 201);
  },

  getUserReviews: async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    
    sendSuccess(res, { reviews });
  },
};

module.exports = reviewController;