const rateLimit = require('express-rate-limit');

// Login/register endpoints ke liye strict limiter - brute force attacks rokta hai
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // is window me max 10 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'multiple Attempt found. Please Try after 15 min.',
  },
});

// General API limiter - overall abuse rokta hai
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
