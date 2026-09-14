const db = require("../config/database");

/**
 * Authoritative RBAC middleware.
 * Super Admin bypasses individual permissions, but must still be authenticated.
 */
const requirePermission = (permission) => async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success:false, message:"Authentication required" });

    const [rows] = await db.promise().query(`
      SELECT r.slug
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.is_active = TRUE
    `, [userId]);

    if (rows.some(r => r.slug === "super_admin")) return next();

    const [allowed] = await db.promise().query(`
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id AND r.is_active = TRUE
      JOIN role_permissions rp ON rp.role_id = r.id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = ? AND p.slug = ?
      LIMIT 1
    `, [userId, permission]);

    if (!allowed.length) {
      return res.status(403).json({
        success:false,
        message:"You don't have permission to perform this action.",
        requiredPermission: permission
      });
    }
    next();
  } catch (error) {
    console.error("RBAC permission error:", error);
    res.status(500).json({ success:false, message:"Permission check failed" });
  }
};

const requireSuperAdmin = async (req,res,next) => {
  try {
    const userId=req.user?.userId;
    if (!userId) return res.status(401).json({success:false,message:"Authentication required"});
    const [rows]=await db.promise().query(`
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id=ur.role_id
      WHERE ur.user_id=? AND r.slug='super_admin' AND r.is_active=TRUE
      LIMIT 1
    `,[userId]);
    if (!rows.length) return res.status(403).json({success:false,message:"Super Admin access required"});
    next();
  } catch(e) {
    console.error("RBAC super admin error:",e);
    res.status(500).json({success:false,message:"Authorization check failed"});
  }
};

module.exports = { requirePermission, requireSuperAdmin };
