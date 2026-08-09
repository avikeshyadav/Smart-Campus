const { access } = require("fs");
const db = require("../../Database/database"); // Import the database connection
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');
const { hashPassword, comparePassword, generateSecureToken, hashToken } = require('../hashFunctions/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../hashFunctions/token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email');

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCK_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || '15', 10);
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

// NOTE: db is used consistently via db.promise() throughout this file.
// Make sure `db` is a mysql2 pool/connection that supports .promise().

// ---------------- CAPTCHA ----------------
const createCaptcha = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return random.toString();
};

// In-memory store — fine for a single instance / dev. For production or
// multi-instance deployments, move this to Redis (or a DB table) with TTL,
// since this Map never survives a restart and isn't shared across instances.
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

// ---------------- REGISTER ----------------
// async function register(req, res) {
//   const { name, email, password, captcha: captchaValue, token } = req.body;

//   if (!name || !email || !password || !captchaValue || !token) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   if (!verifyCaptcha(token, captchaValue)) {
//     return res.status(400).json({ message: "Captcha does not match." });
//   }

//   try {
//     const normalizedEmail = email.trim().toLowerCase();

//     const [existing] = await db.promise().query(
//       "SELECT id FROM users WHERE email = ?",
//       [normalizedEmail]
//     );

//     if (existing.length > 0) {
//       return res.status(409).json({ message: "User already exists." });
//     }

//     const passwordHash = await hashPassword(password);
//     const verificationToken = generateSecureToken();
//     const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

//     await db.promise().query(
//       `INSERT INTO users (name, email, password_hash, verification_token, verification_expires)
//        VALUES (?, ?, ?, ?, ?)`,
//       [name, normalizedEmail, passwordHash, hashToken(verificationToken), verificationExpires]
//     );

//     // await sendVerificationEmail(normalizedEmail, verificationToken);

//     return res.status(201).json({ message: "User Registered Successfully" });
//   } catch (err) {
//     console.error("register error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }
async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      captcha: captchaValue,
      token,
    } = req.body;

    console.log("REGISTER BODY:", {
      name,
      email,
      password: password ? "***" : undefined,
      captchaValue,
      token: token ? "received" : "missing",
    });

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

    console.log("Inserting user:", normalizedEmail);

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

    console.log(
      "User created successfully:",
      result.insertId
    );

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

    // if (!user.is_verified) {
    //   return res.status(403).json({ success: false, message: 'Please verify your account first.' });
    // }

    const passwordOk = await comparePassword(password, user.password_hash);

    if (!passwordOk) {
      await handleFailedAttempt(user, ip, userAgent);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ---- 2FA (disabled until speakeasy is wired back in) ----
    // if (user.two_fa_enabled) {
    //   if (!twoFactorCode) {
    //     return res.status(206).json({ success: false, requires2FA: true, message: '2FA code required' });
    //   }
    //   const verified = speakeasy.totp.verify({
    //     secret: user.two_fa_secret,
    //     encoding: 'base32',
    //     token: twoFactorCode,
    //     window: 1,
    //   });
    //   if (!verified) {
    //     await handleFailedAttempt(user, ip, userAgent);
    //     return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    //   }
    // }

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
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, hashToken(refreshToken), userAgent, ip, refreshExpiresAt]
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
        role: "Admin",
        name: user.name,
        email: user.email,
        dp: user.image,
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
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [decoded.userId, hashToken(newRefreshToken), req.headers['user-agent'], req.ip, refreshExpiresAt]
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    // Fetch minimal user info so the frontend can rehydrate `user` on refresh
    const [userRows] = await db.promise().query(
      'SELECT id, name, email, image, last_login FROM users WHERE id = ?',
      [decoded.userId]
    );
    const user = userRows[0]
      ? {
          id: userRows[0].id,
          role: "Admin",
          name: userRows[0].name,
          email: userRows[0].email,
          dp: userRows[0].image,
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

module.exports = {
  register,
  captcha,
  login,
  refresh,
  logout,
  forgotPassword,
};