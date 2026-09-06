const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many attempts. Please try again later.",
  },

  handler: (req, res,next) => {
    return res.status(429).json({
      success: false,
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
    });
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
  },
});

module.exports = {
  authLimiter,
  generalLimiter,
};