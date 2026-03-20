const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  authController.googleCallback
);

router.get('/me', protect, authController.getMe);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);

module.exports = router;