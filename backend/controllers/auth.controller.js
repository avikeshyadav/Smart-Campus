const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
}

// POST /api/auth/register  (admin only, wired in routes)
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "name, email, password, role required" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const [roleRows] = await pool.query("SELECT id FROM roles WHERE name = ?", [role]);
    if (roleRows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, roleRows[0].id]
    );

    return res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password required" });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash, r.name AS role
       FROM users u JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "refreshToken required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const [rows] = await pool.query("SELECT id, refresh_token FROM users WHERE id = ?", [decoded.id]);
    if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token revoked" });
    }

    const accessToken = signAccessToken(decoded);
    return res.json({ success: true, accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = ?", [req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { register, login, refresh, logout };
