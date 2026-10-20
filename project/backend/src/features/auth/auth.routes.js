const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authenticateToken = require('./auth.middleware');
const passport = require('./strategies/google.strategy');
const { authLimiter } = require('../../shared/middleware/rate-limit.middleware');



router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/resend-verification', authLimiter, authController.resendVerification);

router.post('/google/exchange', authController.exchangeGoogleCode);

router.get('/me', authenticateToken, authController.me);
router.get('/verify', authenticateToken, authController.verify);

router.get('/verify-email', authController.verifyEmail);
router.post('/change-password', authenticateToken, authController.changePassword);

const requireGoogle = (req, res, next) => {
  if (!passport.googleEnabled) {
    return res.status(503).json({ success: false, message: 'Logowanie przez Google nie jest skonfigurowane' });
  }
  next();
};

router.get('/google',
  requireGoogle,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  requireGoogle,
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/`,
    session: false
  }),
  authController.googleCallback
);

module.exports = router;