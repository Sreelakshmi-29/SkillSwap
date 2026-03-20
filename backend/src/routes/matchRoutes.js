const express = require('express');
const matchController = require('../controllers/matchController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', matchController.getMyMatches);
router.get('/potential', matchController.getPotentialMatches);
router.get('/:id', matchController.getMatchById);
router.post('/', matchController.createMatch);
router.put('/:id/cancel', matchController.cancelMatch);

module.exports = router;