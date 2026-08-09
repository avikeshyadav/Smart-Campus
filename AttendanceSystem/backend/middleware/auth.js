const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Verifies the Bearer access token on incoming requests.
 * Attaches { id, role } to req.user on success.
 */
function authenticate(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/**
 * Usage: authorize("admin", "teacher")
 * Rejects the request if req.user.role is not in the allowed list.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
