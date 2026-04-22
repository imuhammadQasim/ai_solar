const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail); // Changed to POST for OTP
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword); // Changed to POST for OTP

// Protected routes
router.put('/change-password', protect, authController.changePassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
