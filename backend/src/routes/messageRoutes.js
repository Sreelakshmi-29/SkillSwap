const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:matchId', messageController.getMessages);
router.post('/:matchId', messageController.sendMessage);

module.exports = router;