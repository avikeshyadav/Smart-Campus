const { verifyAccessToken } = require('../middleware/auth');

// Protected routes ke liye - Authorization header se Bearer token verify karta hai
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token missing' });
  } 
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ success: false, message: 'Invalid access token' });
  }
}
module.exports = authenticate;
