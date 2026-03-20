const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/profile', userController.updateProfile);
router.delete('/account', userController.deleteAccount);

module.exports = router;