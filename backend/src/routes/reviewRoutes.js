const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', reviewController.createReview);
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;