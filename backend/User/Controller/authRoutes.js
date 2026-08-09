const express = require('express');
const router = express.Router();

const authController = require('./authController');
const authenticate = require('./auth');
const { authLimiter } = require('../hashFunctions/rateLimiter');
const { registerRules, loginRules, handleValidation } = require('../hashFunctions/validater');

// ---------- Public routes ----------
router.post('/register', authLimiter, registerRules, handleValidation, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authLimiter, loginRules, handleValidation, authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// ---------- Protected routes (access token required) ----------
router.get('/profile', authenticate, authController.getProfile);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/verify', authenticate, authController.verify2FA);

module.exports = router;
