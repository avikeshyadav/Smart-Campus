/**
 * profileService.js
 *
 * Backend functions for the Admin Profile page (frontend/AdminProfilePage.jsx).
 * Only functions are defined here — no server/route boilerplate — wire these
 * into your existing Express/Next routes as shown in the comment above each one.
 *
 * Requires: `npm install mysql2`
 * Expects a MySQL connection pool. Adjust the pool config to your existing setup.
 */

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admin_dashboard",
  waitForConnections: true,
  connectionLimit: 10,
});

/**
 * GET /api/admin/profile/:userId
 * Fetches everything the AdminProfilePage needs in one shaped response.
 */
async function getFullProfile(userId) {
  const [[user]] = await pool.query(
    `SELECT id, avatar_url, full_name, username, email, phone, date_of_birth,
            gender, job_title, department, employee_id, admin_role,
            company, address, city, state, country, postal_code,
            time_zone, preferred_language, account_status, created_at
     FROM users WHERE id = ?`,
    [userId]
  );
  if (!user) return null;

  const [[security]] = await pool.query(
    `SELECT password_changed_at, two_factor_enabled, email_verified,
            phone_verified, last_login_at, last_login_location, last_login_device
     FROM user_security WHERE user_id = ?`,
    [userId]
  );

  const [[sessionCountRow]] = await pool.query(
    `SELECT COUNT(*) AS count FROM user_sessions WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );

  const [[access]] = await pool.query(
    `SELECT permission_level, user_management_access, reports_access,
            settings_access, api_access, last_role_change_at
     FROM admin_access WHERE user_id = ?`,
    [userId]
  );

  const [modules] = await pool.query(
    `SELECT module_name FROM admin_assigned_modules WHERE user_id = ?`,
    [userId]
  );

  const [[preferences]] = await pool.query(
    `SELECT theme, date_format, time_format, email_notifications,
            push_notifications, security_alerts
     FROM user_preferences WHERE user_id = ?`,
    [userId]
  );

  const [recentActions] = await pool.query(
    `SELECT action_label AS label, created_at AS timestamp
     FROM admin_activity_log
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
    [userId]
  );

  const profileCompletion = calculateProfileCompletion(user);
  const securityScore = calculateSecurityScore(security);

  return {
    header: {
      avatarUrl: user.avatar_url,
      fullName: user.full_name,
      username: user.username,
      designation: user.job_title,
      adminRole: user.admin_role,
      accountStatus: user.account_status,
      lastActive: security?.last_login_at,
    },
    personalInfo: {
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      department: user.department,
      designation: user.job_title,
      employeeId: user.employee_id,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      postalCode: user.postal_code,
      timeZone: user.time_zone,
    },
    access: {
      adminRole: user.admin_role,
      permissionLevel: access?.permission_level,
      assignedModules: modules.map((m) => m.module_name),
      userManagementAccess: !!access?.user_management_access,
      reportsAccess: !!access?.reports_access,
      settingsAccess: !!access?.settings_access,
      apiAccess: !!access?.api_access,
      lastRoleChange: access?.last_role_change_at,
    },
    security: {
      passwordLastChanged: security?.password_changed_at,
      twoFactorEnabled: !!security?.two_factor_enabled,
      emailVerified: !!security?.email_verified,
      phoneVerified: !!security?.phone_verified,
      activeSessionsCount: sessionCountRow.count,
      lastLogin: security?.last_login_at,
      lastLoginLocation: security?.last_login_location,
      lastLoginDevice: security?.last_login_device,
    },
    preferences: {
      language: user.preferred_language,
      timeZone: user.time_zone,
      theme: preferences?.theme,
      dateFormat: preferences?.date_format,
      timeFormat: preferences?.time_format,
      emailNotifications: !!preferences?.email_notifications,
      pushNotifications: !!preferences?.push_notifications,
      securityAlerts: !!preferences?.security_alerts,
    },
    profileCompletion,
    securityScore,
    recentActions,
  };
}

/**
 * PUT /api/admin/profile/:userId
 * Updates editable personal-info fields.
 */
async function updatePersonalInfo(userId, fields) {
  const allowed = [
    "full_name", "username", "email", "phone", "job_title", "department",
    "address", "city", "state", "country", "postal_code",
    "time_zone", "preferred_language",
  ];
  const updates = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (updates.length === 0) return { updated: false };

  const setClause = updates.map(([key]) => `${key} = ?`).join(", ");
  const values = updates.map(([, value]) => value);

  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, userId]);
  return { updated: true };
}

/**
 * POST /api/admin/profile/:userId/password
 * NOTE: hash the password with bcrypt/argon2 BEFORE calling this function.
 * This function only persists the already-hashed value.
 */
async function changePassword(userId, hashedPassword) {
  await pool.query(
    `UPDATE user_security SET password_hash = ?, password_changed_at = NOW() WHERE user_id = ?`,
    [hashedPassword, userId]
  );
  await pool.query(
    `INSERT INTO admin_activity_log (user_id, action_label, created_at) VALUES (?, 'Password changed', NOW())`,
    [userId]
  );
  return { success: true };
}

/**
 * POST /api/admin/profile/:userId/2fa
 */
async function setTwoFactorEnabled(userId, enabled) {
  await pool.query(
    `UPDATE user_security SET two_factor_enabled = ? WHERE user_id = ?`,
    [enabled ? 1 : 0, userId]
  );
  await pool.query(
    `INSERT INTO admin_activity_log (user_id, action_label, created_at) VALUES (?, ?, NOW())`,
    [userId, enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled"]
  );
  return { twoFactorEnabled: enabled };
}

/**
 * GET login history (Security tab / Activity Log)
 */
async function getLoginHistory(userId, limit = 20) {
  const [rows] = await pool.query(
    `SELECT logged_in_at, ip_address, device, location
     FROM login_history WHERE user_id = ?
     ORDER BY logged_in_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows;
}

/**
 * GET active sessions
 */
async function getActiveSessions(userId) {
  const [rows] = await pool.query(
    `SELECT id, device, ip_address, location, created_at, last_seen_at
     FROM user_sessions WHERE user_id = ? AND revoked_at IS NULL
     ORDER BY last_seen_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * POST /api/admin/profile/:userId/logout-all
 * Revokes every session except optionally the current one.
 */
async function logoutAllSessions(userId, keepSessionId = null) {
  if (keepSessionId) {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ? AND id != ?`,
      [userId, keepSessionId]
    );
  } else {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ?`,
      [userId]
    );
  }
  await pool.query(
    `INSERT INTO admin_activity_log (user_id, action_label, created_at) VALUES (?, 'Logged out of all devices', NOW())`,
    [userId]
  );
  return { success: true };
}

/**
 * PUT /api/admin/profile/:userId/preferences
 */
async function updatePreferences(userId, fields) {
  const allowed = [
    "theme", "date_format", "time_format",
    "email_notifications", "push_notifications", "security_alerts",
  ];
  const updates = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (updates.length === 0) return { updated: false };

  const setClause = updates.map(([key]) => `${key} = ?`).join(", ");
  const values = updates.map(([, value]) => value);

  await pool.query(
    `UPDATE user_preferences SET ${setClause} WHERE user_id = ?`,
    [...values, userId]
  );
  return { updated: true };
}

/**
 * PUT admin role / permissions (super-admin action)
 */
async function updateAdminAccess(userId, access) {
  const allowed = [
    "permission_level", "user_management_access",
    "reports_access", "settings_access", "api_access",
  ];
  const updates = Object.entries(access).filter(([key]) => allowed.includes(key));
  if (updates.length === 0) return { updated: false };

  const setClause = updates.map(([key]) => `${key} = ?`).join(", ");
  const values = updates.map(([, value]) => value);

  await pool.query(
    `UPDATE admin_access SET ${setClause}, last_role_change_at = NOW() WHERE user_id = ?`,
    [...values, userId]
  );
  return { updated: true };
}

/**
 * POST deactivate / delete account
 * mode: "deactivate" | "delete"
 */
async function setAccountStatus(userId, mode) {
  if (mode === "delete") {
    await pool.query(`UPDATE users SET account_status = 'Suspended', deleted_at = NOW() WHERE id = ?`, [userId]);
  } else {
    await pool.query(`UPDATE users SET account_status = 'Inactive' WHERE id = ?`, [userId]);
  }
  return { success: true, status: mode };
}

/** Helper: rough profile-completion percentage from filled fields. */
function calculateProfileCompletion(user) {
  const fields = [
    "avatar_url", "full_name", "email", "phone", "job_title", "department",
    "employee_id", "address", "city", "state", "country", "postal_code",
  ];
  const filled = fields.filter((f) => !!user[f]).length;
  return Math.round((filled / fields.length) * 100);
}

/** Helper: rough security-score percentage from security posture. */
function calculateSecurityScore(security) {
  if (!security) return 0;
  let score = 0;
  if (security.two_factor_enabled) score += 40;
  if (security.email_verified) score += 20;
  if (security.phone_verified) score += 20;
  if (security.password_changed_at) score += 20;
  return score;
}

module.exports = {
  getFullProfile,
  updatePersonalInfo,
  changePassword,
  setTwoFactorEnabled,
  getLoginHistory,
  getActiveSessions,
  logoutAllSessions,
  updatePreferences,
  updateAdminAccess,
  setAccountStatus,
};
