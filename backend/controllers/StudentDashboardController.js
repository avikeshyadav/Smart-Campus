const db = require("../config/database");
const { hashPassword,comparePassword,} = require("../middleware/hash");
const {generateAccessToken,generateRefreshToken,} = require("../config/token");
const { createNotification } = require("../config/notificationConfig.js");

// =====================================================
// Helper: Create notification without blocking response
// =====================================================
const sendNotification = async ({
  userId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = null,
}) => {
  try {
    // if (!userId) {
    //   console.warn("Notification skipped: userId not found");
    //   return;
    // }

    await createNotification({
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    // Notification failure should not break the main operation
    console.error("Notification creation failed:", error);
  }
};


// =====================================================
// STUDENT LOGIN
// =====================================================

async function login(req, res) {
  const { email, password } = req.body;

  // -----------------------------
  // Validation
  // -----------------------------

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email id or Password are Required",
    });
  }

  try {
    // -----------------------------
    // 1. Find login account
    // -----------------------------

    const [users] = await db.promise().query(
      `
      SELECT *
      FROM student_logins
      WHERE username = ?
      LIMIT 1
      `,
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student Not Found",
      });
    }

    const loginUser = users[0];

    // -----------------------------
    // 2. Check account status
    // -----------------------------

    if (!loginUser.is_active) {
      return res.status(403).json({
        success: false,
        message: "Student account is not active",
      });
    }

    // -----------------------------
    // 3. Check password
    // -----------------------------

    const isPasswordOk = await comparePassword(
      password,
      loginUser.password_hash
    );

    if (!isPasswordOk) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // -----------------------------
    // 4. Get student details
    // -----------------------------

    const [students] = await db.promise().query(
      `
      SELECT *
      FROM students
      WHERE email = ?
      LIMIT 1
      `,
      [loginUser.username]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student Profile Not Found",
      });
    }

    const student = students[0];

    // -----------------------------
    // 5. JWT Payload
    // -----------------------------

    const payload = {
      StudentId: loginUser.student_id,
      email: loginUser.username,
    };

    // -----------------------------
    // 6. Generate tokens
    // -----------------------------

    const accessToken =
      generateAccessToken(payload);

    const refreshToken =
      generateRefreshToken(payload);

    // -----------------------------
    // 7. Save refresh token
    // -----------------------------

    await db.promise().query(
      `
      UPDATE student_logins
      SET refresh_token = ?
      WHERE id = ?
      `,
      [
        refreshToken,
        loginUser.id,
      ]
    );

    // -----------------------------
    // 8. Set refresh token cookie
    // -----------------------------

    res.cookie(
      "student_refresh_token",
      refreshToken,
      {
        httpOnly: true,

        // Development
        secure: process.env.NODE_ENV === "production",

        // For same-site frontend/backend
        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax",

        // Refresh token lifetime
        maxAge:
          7 * 24 * 60 * 60 * 1000,

        path: "/",
      }
    );
// ==========================================
// Create Notification
// ==========================================
    await sendNotification({
      userId: 9,
      type: "STUDENT_LOGIN",
      title: "Student Login",
      message: `${student.name} login successfully.`,
      entityType: "STUDENT_LOGIN",
      entityId: student.id,
      metadata: {
        name:student.name,
        email:student.email,
        course:student.course,
      },
    });
    // -----------------------------
    // 9. Response
    // -----------------------------


    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      // Access token body mein
      accessToken,
      // Refresh token body mein NAHI
      user: {
        id: student.id,
        studentId:
          loginUser.student_id,
        name: student.name,
        email: student.email,
        department:
          student.department || null,
        course:
          student.course || null,
        semester:
          student.semester || null,
        avatar_url: student.avatar_url,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Backend Error",
      error: error.message,
    });
  }
}


// =====================================================
// STUDENT REGISTER
// =====================================================

async function register(req, res) {
  const { email, password } = req.body;

  // -----------------------------
  // Validation
  // -----------------------------

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Email id Or Password are Required!",
    });
  }

  try {
    // -----------------------------
    // 1. Find student
    // -----------------------------

    const [rows] = await db.promise().query(
      `
      SELECT id, email
      FROM students
      WHERE email = ?
      LIMIT 1
      `,
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student Not Found",
      });
    }

    const student = rows[0];

    // -----------------------------
    // 2. Check existing login
    // -----------------------------

    const [existingLogin] =
      await db.promise().query(
        `
        SELECT id
        FROM student_logins
        WHERE student_id = ?
        LIMIT 1
        `,
        [student.id]
      );

    if (existingLogin.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Student login account already exists",
      });
    }

    // -----------------------------
    // 3. Hash password
    // -----------------------------

    const encodedPassword =
      await hashPassword(password);

    // -----------------------------
    // 4. Create login account
    // -----------------------------

    await db.promise().query(
      `
      INSERT INTO student_logins
      (
        student_id,
        username,
        password_hash,
        is_active,
        created_at
      )
      VALUES (?, ?, ?, true, NOW())
      `,
      [
        student.id,
        student.email,
        encodedPassword,
      ]
    );

    // -----------------------------
    // 5. Response
    // -----------------------------

    return res.status(201).json({
      success: true,
      message:
        "Student Registered Successfully",
    });

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Backend Error",
      error: error.message,
    });
  }
}


// =====================================================
// STUDENT LOGOUT
// =====================================================

async function logout(req, res) {
  try {

    /*
      req.user middleware se aayega.

      Example payload:
      {
        StudentId: 123,
        email: "student@gmail.com"
      }
    */

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // -----------------------------
    // Clear ONLY current student's
    // refresh token
    // -----------------------------

    await db.promise().query(
      `
      UPDATE student_logins
      SET refresh_token = NULL
      WHERE student_id = ?
      `,
      [user.StudentId]
    );

    // -----------------------------
    // Clear refresh cookie
    // -----------------------------

    res.clearCookie(
      "student_refresh_token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });

  } catch (error) {

    console.error(
      "LOGOUT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Backend Error",
      error: error.message,
    });
  }
}


// =====================================================
// DELETE ACCOUNT
// =====================================================

async function deleteAccount(req, res) {

  try {

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log(
      "Delete Account User:",
      user
    );

    // Yahan actual delete logic
    // baad mein add kar sakte ho.

    return res.status(200).json({
      success: true,
      message:
        "Account delete process",
    });

  } catch (error) {

    console.error(
      "DELETE ACCOUNT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Backend Error",
      error: error.message,
    });
  }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  login,
  register,
  logout,
  deleteAccount,
};