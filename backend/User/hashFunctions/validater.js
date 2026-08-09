const { body, validationResult } = require('express-validator');

// Common validation error handler
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name required hai'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email dein'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password kam se kam 8 characters ka ho')
    .matches(/[A-Z]/)
    .withMessage('Password me ek uppercase letter zaroori hai')
    .matches(/[0-9]/)
    .withMessage('Password me ek number zaroori hai')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password me ek special character zaroori hai'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email dein'),
  body('password').notEmpty().withMessage('Password required hai'),
];

module.exports = { handleValidation, registerRules, loginRules };
