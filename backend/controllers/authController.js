const { access } = require("fs");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("../config/database"); // Import the database connection
const { hashPassword, comparePassword, generateSecureToken, hashToken } = require('../middleware/hash');
const { generateAccessToken, generateRefreshToken,generateTemperaryToken,verifyTemperoryToken, verifyRefreshToken } = require('../config/token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const { createNotification } = require("../config/notificationConfig");
const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCK_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || '15', 10);
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ---------------- CAPTCHA ----------------
const createCaptcha = () => {
  // const nameList=["avikesh", "ashutosh", "avikesh", "avikesh"];
  // const random = nameList[Math.floor(Math.random() *nameList.length )];
  const random = Math.floor(1000 + Math.random() * 9000);
  return random.toString();
};
const captchaStore = new Map();

function cleanupExpiredCaptchas() {
  const now = Date.now();
  for (const [token, entry] of captchaStore.entries()) {
    if (entry.expires < now) captchaStore.delete(token);
  }
}

async function captcha(req, res) {
  cleanupExpiredCaptchas();
  const value = createCaptcha();
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  captchaStore.set(token, { value, expires: Date.now() + CAPTCHA_TTL_MS });
  res.json({ token, captcha: value });
}

function verifyCaptcha(token, captchaValue) {
  const entry = captchaStore.get(token);
  if (!entry) return false;
  captchaStore.delete(token); // one-time use regardless of outcome
  if (entry.expires < Date.now()) return false;
  return entry.value === captchaValue;
}

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      captcha: captchaValue,
      token,
    } = req.body;

    // Validate input
    if (
      !name ||
      !email ||
      !password ||
      !captchaValue ||
      !token
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Verify captcha
    const captchaValid = verifyCaptcha(
      token,
      captchaValue
    );

    if (!captchaValid) {
      return res.status(400).json({
        message: "Captcha does not match.",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    // Check existing user
    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    // Verification token
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(
      Date.now() + 60 * 60 * 1000
    );
    const hashedVerificationToken =
      hashToken(verificationToken);
[]
    // Insert
    const [result] = await db.promise().query(
      `INSERT INTO users
       (
         name,
         email,
         password_hash,
         verification_token,
         verification_expires
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        normalizedEmail,
        passwordHash,
        hashedVerificationToken,
        verificationExpires,
      ]
    );
    sendVerificationEmail(normalizedEmail,hashedVerificationToken);
    return res.status(201).json({
      message: "User Registered Successfully",
    });
    

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
}

// ---------------- LOGIN ----------------
async function login(req, res) {
  const { email, password, captcha: captchaValue, token, twoFactorCode } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'] || 'unknown';
  if (!email || !password || !captchaValue || !token) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!verifyCaptcha(token, captchaValue)) {
    return res.status(400).json({ message: "Captcha does not match." });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = rows[0];
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lock_until) - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: 'Please verify your account first.' });
    }
    const passwordOk = await comparePassword(password, user.password_hash);

    if (!passwordOk) {
      await handleFailedAttempt(user, ip, userAgent);
      return res.status(401).json({ message: "Invalid email or password" });
    }
  if (user.two_fa_enabled) {
    const payload={userId:user.id}
    const TemporaryToken = generateTemperaryToken(payload);
      return res.status(200).json({
              success: true,
              requiresTwoFactor: true,
              message: "Two-factor authentication required",
              // userId: user.id,
              tempToken : TemporaryToken,
            });
}

    // Successful login — reset failed attempts, record history
    await db.promise().query(
      'UPDATE users SET failed_attempts = 0, lock_until = NULL, last_login = NOW() WHERE id = ?',
      [user.id]
    );
    await db.promise().query(
      'INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES (?, ?, ?, "SUCCESS")',
      [user.id, ip, userAgent]
    );  

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_MAX_AGE_MS);

    await db.promise().query(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at,current_access_token)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, hashToken(refreshToken), userAgent, ip, refreshExpiresAt, accessToken]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    return res.json({
      success: true,
      message: "Login Successful",
      accessToken,
      user: {
        id: user.id,
        role: user?.job_title,
        name: user.name,
        email: user.email,
        dp: user.avatar_url,
        last_login: user.last_login,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function handleFailedAttempt(user, ip, userAgent) {
  const attempts = (user.failed_attempts || 0) + 1;
  let lockUntil = null;

  if (attempts >= MAX_ATTEMPTS) {
    lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
  }

  try {
    await db.promise().query(
      'UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?',
      [attempts, lockUntil, user.id]
    );
    await db.promise().query(
      'INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES (?, ?, ?, "FAILED")',
      [user.id, ip, userAgent]
    );
  } catch (err) {
    console.error("handleFailedAttempt error:", err);
  }
}

// ---------------- REFRESH TOKEN ----------------
async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token missing' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    res.clearCookie('refreshToken');
    return res.status(403).json({ success: false, message: 'Session expired, please log in again' });
  }

  const tokenHash = hashToken(token);

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND is_revoked = FALSE AND expires_at > NOW()',
      [tokenHash, decoded.userId]
    );

    if (rows.length === 0) {
      // precaution and force a fresh login.
      await db.promise().query(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?',
        [decoded.userId]
      );
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Session invalid, please log in again' });
    }

    // Rotate: revoke the presented token, issue a new one
    await db.promise().query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = ?',
      [rows[0].id]
    );

    const payload = { userId: decoded.userId, email: decoded.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_MAX_AGE_MS);

    await db.promise().query(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at,current_access_token)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [decoded.userId, hashToken(newRefreshToken), req.headers['user-agent'], req.ip, refreshExpiresAt, newAccessToken]
    );
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    // Fetch minimal user info so the frontend can rehydrate `user` on refresh
    const [userRows] = await db.promise().query(
      'SELECT id, job_title, name, email, avatar_url, last_login FROM users WHERE id = ?',
      [decoded.userId]
    );
    const user = userRows[0]
      ? {
          id: userRows[0].id,
          role: userRows[0].job_title,
          name: userRows[0].name,
          email: userRows[0].email,
          avatar_url: userRows[0].avatar_url,
          last_login: userRows[0].last_login,
        }
      : null;
    return res.json({ success: true, accessToken: newAccessToken, user });

  } catch (err) {
    console.error("refresh error:", err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ---------------- LOGOUT ----------------
async function logout(req, res) {
  const token = req.cookies?.refreshToken;
  try {
    if (token) {
      await db.promise().query(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = ?',
        [hashToken(token)]
      );
    }
  } catch (err) {
    console.error("logout error:", err);
    // still clear the cookie even if the DB update failed
  }

  res.clearCookie('refreshToken');
  return res.json({ success: true, message: 'Logout successful' });
}

// ---------------- FORGOT PASSWORD ----------------
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    // Respond the same way whether or not the user exists, so this endpoint
    // can't be used to enumerate registered emails.
    if (rows.length === 0) {
      return res.json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    const user = rows[0];
    const resetToken = generateSecureToken();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.promise().query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?",
      [hashToken(resetToken), resetExpires, user.id]
    );

    // await sendPasswordResetEmail(email, resetToken);

    return res.json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ===============================Admin Control===================================
async function getFullProfile(req, res) {
    const userId = req.user.userId;
  const [[userDetails]] = await db.promise().query(
    `SELECT id, avatar_url, name, username, email, phone, date_of_birth,
            gender, job_title, department, employee_id, admin_role,
            company, address, city, state, country, postal_code,
            time_zone, preferred_language, account_status, created_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (!userDetails) return res.status(401).json({ success: false, message: 'User Not Found' });

  const [[security]] = await db.promise().query(
    `SELECT  password_changed_at,two_fa_enabled, email,
            phone, last_login, last_login_location, last_login_device
     FROM users WHERE id = ?`,
    [userId]  
  );
 
  // const [[sessionCountRow]] = await db.promise().query(
  //   `SELECT COUNT(*) AS count FROM user_sessions WHERE user_id = ? AND revoked_at IS NULL`,
  //   [userId]
  // );
  const [[access]] = await db.promise().query(
    `SELECT permission_level, user_management_access, reports_access,
            settings_access, api_access, last_role_change_at
     FROM admin_access WHERE user_id = ?`,
    [userId]
  );
  const [modules] = await db.promise().query(
    `SELECT module_name FROM admin_assigned_modules WHERE user_id = ?`,
    [userId]
  );
  const [[preferences]] = await db.promise().query(
    `SELECT theme, date_format, time_format, email_notifications,
            push_notifications, security_alerts
     FROM user_preferences WHERE user_id = ?`,
    [userId]
  );


  const [recentActions] = await db.promise().query(
    `SELECT action_label AS label, created_at AS timestamp
     FROM admin_activity_log
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
    [userId]
  );

  const profileCompletion = calculateProfileCompletion(userDetails);
  const securityScore = calculateSecurityScore(security);

return res.status(200).json({
    success: true,
    data: {
        header: {
            avatarUrl: userDetails.avatar_url,
            fullName: userDetails.name,
            username: userDetails.username,
            designation: userDetails.job_title,
            adminRole: userDetails.admin_role,
            accountStatus: userDetails.account_status,
            lastActive: security?.last_login_at,
        },

        personalInfo: {
            fullName: userDetails.name,
            email: userDetails.email,
            phone: userDetails.phone,
            username: userDetails.username,
            department: userDetails.department,
            designation: userDetails.job_title,
            employeeId: userDetails.employee_id,
            address: userDetails.address,
            city: userDetails.city,
            state: userDetails.state,
            country: userDetails.country,
            postalCode: userDetails.postal_code,
            timeZone: userDetails.time_zone,
        },

        access: {
            adminRole: userDetails.admin_role,
            permissionLevel: access?.permission_level,
            assignedModules: modules.map((m) => m.module_name),
            userManagementAccess: !!access?.user_management_access,
            reportsAccess: !!access?.reports_access,
            settingsAccess: !!access?.settings_access,
            apiAccess: !!access?.api_access,
            lastRoleChange: access?.last_role_change_at,
        },

        security: {
            passwordLastChanged:security?.password_changed_at,
            twoFactorEnabled: !!security?.two_fa_enabled,
            emailVerified: !!security?.email,
            phoneVerified: !!security?.phone,
            // activeSessionsCount: sessionCountRow?.count || 0,
            lastLogin: security?.last_login,
            lastLoginLocation: security?.last_login_location,
            lastLoginDevice: security?.last_login_device,
        },

        preferences: {
            language: userDetails.preferred_language,
            timeZone: userDetails.time_zone,
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
    },
});
}


// ===============================
// UPDATE PERSONAL INFORMATION
// ===============================
async function updatePersonalInfo(req, res) {
  try {
    // ID frontend se header mein aa rahi hai
    const userId = req.user?.userId;
    const fields = req.body;
    // Validate user id
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required in header",
      });
    }

    // Validate form data
    if (!fields || typeof fields !== "object") {
      return res.status(400).json({
        success: false,
        message: "formData is required",
      });
    }

    // Only these fields can be updated
    const allowed = [
      "avatar_url",
      "name",
      "username",
      "email",
      "phone",
      "job_title",
      "department",
      "address",
      "city",
      "state",
      "country",
      "postal_code",
      "time_zone",
      "preferred_language",
    ];

    // Sirf allowed fields filter karo
    const updates = Object.entries(fields).filter(
      ([key, value]) =>
        allowed.includes(key) &&
        value !== undefined
    );

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const setClause = updates
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = updates.map(([, value]) => value);

    console.log("Update fields:", updates);
    console.log("Update values:", values);

    const [result] = await db.promise().query(
      `UPDATE users
       SET ${setClause}
       WHERE id = ?`,
      [...values, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no changes made",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Personal information updated successfully",
    });

  } catch (error) {
    console.error(
      "updatePersonalInfo error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update personal information",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
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
  if (security?.two_fa_enabled) score += 40;
  if (security?.email) score += 20;
  if (security?.phone) score += 20;
  if (security.password_changed_at) score += 20;
  return score;
}

 
// ====================== CHANGE PASSWORD ======================

async function changePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { newPassword } = req.body;

        console.log("Change password userId:", userId);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID missing",
            });
        }
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password is required",
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        const [result] = await db.promise().query(
            `UPDATE users
             SET password_hash = ?
             WHERE id = ?`,
            [passwordHash, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Optional:
        // Agar user_security table mein password_changed_at hai
        await db.promise().query(
            `UPDATE users
             SET password_changed_at = NOW()
             WHERE id = ?`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (err) {
        console.error("changePassword error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to update password",
        });
    }
}
// ===============================
// ENABLE / DISABLE 2FA
// ===============================

async function twoFactor(req, res) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "enabled must be true or false",
      });
    }

    // =========================
    // DISABLE 2FA
    // =========================

    if (enabled === false) {
      await db.promise().query(
        `UPDATE users
         SET two_fa_enabled = 0,
             two_fa_secret = NULL
         WHERE id = ?`,
        [userId]
      );

      return res.json({
        success: true,
        message: "Two-factor authentication disabled",
        data: {
          twoFactorEnabled: false,
        },
      });
    }

    // =========================
    // ENABLE / SETUP 2FA
    // =========================

    const [[user]] = await db.promise().query(
      `SELECT id, email, name, two_fa_enabled
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already enabled
    if (user.two_fa_enabled) {
      return res.json({
        success: true,
        message: "Two-factor authentication is already enabled",
        data: {
          twoFactorEnabled: true,
        },
      });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `SmartCampus:${user.email}`,
      issuer: "SmartCampus",
      length: 32,
    });

    // Generate QR
    const qrCode = await QRCode.toDataURL(
      secret.otpauth_url
    );

    // Save secret temporarily
    await db.promise().query(
      `UPDATE users
       SET two_fa_secret = ?
       WHERE id = ?`,
      [secret.base32, userId]
    );

    return res.json({
      success: true,
      message: "Scan QR code and verify OTP",
      data: {
        twoFactorEnabled: false,
        setupRequired: true,
        qrCode,
        secret: secret.base32,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("2FA setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to setup 2FA",
    });
  }
}
// ===============================
// VERIFY 2FA SETUP
// ===============================

async function verifyTwoFactorSetup(req, res) {
  try {
    const userId = req.user?.userId;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authentication code is required",
      });
    }

    const [[user]] = await db.promise().query(
      `SELECT id, email, two_fa_secret
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.two_fa_secret) {
      return res.status(400).json({
        success: false,
        message: "2FA setup has not been started",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: "base32",
      token: String(code).trim(),
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid authentication code",
      });
    }

    await db.promise().query(
      `UPDATE users
       SET two_fa_enabled = 1
       WHERE id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });

  } catch (error) {
    console.error("verifyTwoFactorSetup error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify 2FA",
    });
  }
};
async function verifyLoginTwoFactor(req, res) {
  const {
    tempToken,
    code
  } = req.body;

  const ip = req.ip;
  const userAgent = req.headers["user-agent"] || "unknown";

  if (!tempToken || !code) {
    return res.status(400).json({
      success: false,
      message: "User ID and authentication code are required",
    });
  }
let decodeToken;

try {
  decodeToken = verifyTemperoryToken(tempToken);
} catch (error) {
  return res.status(401).json({
    success: false,
    message: "Expired token. Please relogin to get a new token",
  });
}
  try {
    const [rows] = await db.promise().query(
      `SELECT *
       FROM users
       WHERE id = ?`,
      [decodeToken.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication request",
      });
    }
    const user = rows[0];
    if (!user.two_fa_enabled || !user.two_fa_secret) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is not enabled",
      });
    }

    // Verify TOTP
    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: "base32",
      token: String(code).trim(),
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication code",
      });
    }

    // =========================
    // LOGIN SUCCESS
    // =========================

    await db.promise().query(
      `UPDATE users
       SET failed_attempts = 0,
           lock_until = NULL,
           last_login = NOW()
       WHERE id = ?`,
      [user.id]
    );

    await db.promise().query(
      `INSERT INTO login_history
       (user_id, ip_address, user_agent, status)
       VALUES (?, ?, ?, "SUCCESS")`,
      [user.id, ip, userAgent]
    );

    // =========================
    // TOKENS
    // =========================

    const payload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    const refreshExpiresAt =
      new Date(Date.now() + REFRESH_MAX_AGE_MS);

    await db.promise().query(
      `INSERT INTO refresh_tokens
       (
         user_id,
         token_hash,
         device_info,
         ip_address,
         expires_at,
         current_access_token
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        hashToken(refreshToken),
        userAgent,
        ip,
        refreshExpiresAt,
        accessToken,
      ]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_MAX_AGE_MS,
    });

    return res.json({
      success: true,
      message: "Login Successful",
      accessToken,
      user: {
        // id: user.id,
        role: user.job_title,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        last_login: user.last_login,
      },
    });

  } catch (error) {
    console.error("verifyLoginTwoFactor error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ====================  Verify Account By email ==================

async function verifyAccount(req, res) {
  const token = req.query.token;

  // Token check
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Verification token is missing",
    });
  }

  try {
    // Check token exists
    const [rows] = await db.promise().query(
      `SELECT id, email, is_verified
       FROM users
       WHERE verification_token = ?
       LIMIT 1`,
      [token]
    );

    // Token not found
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const user = rows[0];

    // Already verified
    if (user.is_verified === 1) {
      return res.status(200).json({
        success: true,
        message: "Account is already verified",
      });
    }

    // Verify account
    const [result] = await db.promise().query(
      `UPDATE users
       SET is_verified = 1,
           verification_token = NULL
       WHERE id = ?`,
      [user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Account verification failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });

  } catch (error) {
    console.error("Verify Account Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying your account",
    });
  }
}
module.exports = {
  register,
  captcha,
  login,
  refresh,
  logout,
  forgotPassword,
  getFullProfile,
  updatePersonalInfo,
  changePassword,
  twoFactor,
  verifyAccount,
  verifyTwoFactorSetup,
  verifyLoginTwoFactor,
};