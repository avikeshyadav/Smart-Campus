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

    if (!loginUser.is_active) {
      return res.status(403).json({
        success: false,
        message: "Student account is not active",
      });
    }
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
async function viewNotice(req, res) {
      const studentId = req.user.id;
  try {
    const [notices] = await db.execute(
  `
  SELECT
      n.id,
      n.title,
      n.message,
      n.notice_type,
      n.priority,
      n.target_type,
      n.created_at,
      n.expires_at,
      u.name AS created_by
  FROM notices n
  LEFT JOIN users u
      ON u.id = n.created_by
  LEFT JOIN students s
      ON s.id = ?
  WHERE
      n.is_active = TRUE
      AND
      ( n.target_type = 'all' OR ( n.target_type = 'student' AND n.target_student_id = ?)
       OR
          ( n.target_type = 'department' AND n.target_department = s.department)
      )

      AND
      (
          n.expires_at IS NULL
          OR n.expires_at >= NOW()
      )
  ORDER BY n.created_at DESC
  `,
  [studentId, studentId]
);

res.json({
  success: true,
  data: {
    notices,
  },
});

  } catch (error) {
        return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
}


// =====================================================
// GET STUDENT NOTICES
// GET /api/studentdashboard/student/notices
// =====================================================

async function GetStudentNotices(req, res) {
  try {


    const studentId = req.user?.StudentId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required",
      });
    }

    // ---------------------------------------------------
    // Get student department
    // ---------------------------------------------------

    const [students] = await db.promise().query(
      `
      SELECT
        id,
        department
      FROM students
      WHERE id = ?
      LIMIT 1
      `,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = students[0];


    const [notices] = await db.promise().query(
      `
      SELECT
        n.id,
        n.title,
        n.message,
        n.notice_type,
        n.priority,
        n.target_type,
        n.target_student_id,
        n.target_department,
        n.expires_at,
        n.created_at,
        n.updated_at,

        u.id AS admin_id,
        u.name AS admin_name

      FROM notices n

      LEFT JOIN users u
        ON n.created_by = u.id

      WHERE
        (
          n.target_type = 'all'

          OR

          (
            n.target_type = 'student'
            AND n.target_student_id = ?
          )

          OR

          (
            n.target_type = 'department'
            AND LOWER(TRIM(n.target_department))
              = LOWER(TRIM(?))
          )
        )

        AND
        (
          n.expires_at IS NULL
          OR n.expires_at > NOW()
        )

      ORDER BY
        CASE
          WHEN n.priority = 'urgent' THEN 1
          WHEN n.priority = 'high' THEN 2
          WHEN n.priority = 'normal' THEN 3
          WHEN n.priority = 'low' THEN 4
          ELSE 5
        END,

        n.created_at DESC
      `,
      [
        studentId,
        student.department || "",
      ]
    );

    return res.status(200).json({
      success: true,

      count: notices.length,

      data: {
        notices,
      },
    });

  } catch (error) {
    console.error(
      "Get Student Notices Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching student notices",
    });
  }
}

async function HostelDetail(req, res) {
  try {
    // --------------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------------

    if (!req.user || !req.user.StudentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Student login required.",
      });
    }

    const studentId = Number(req.user.StudentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    // --------------------------------------------------------
    // GET STUDENT + ACTIVE HOSTEL ALLOCATION
    // --------------------------------------------------------

    const [rows] = await db.promise().query(
      `
      SELECT
        s.id AS student_db_id,
        s.student_id AS enrollment_no,
        s.name AS student_name,
        s.email,
        s.mobile,
        s.department,
        s.course,
        s.year,
        s.semester,
        s.gender,
        s.photo_path,

        a.id AS allocation_id,
        a.allocation_date,
        a.remarks,

        h.id AS hostel_id,
        h.name AS hostel_name,
        h.code AS hostel_code,
        h.hostel_type,
        h.total_floors,
        h.status AS hostel_status,

        f.id AS floor_id,
        f.floor_number,
        f.floor_name,

        r.id AS room_id,
        r.room_number,
        r.room_type,
        r.total_beds,
        r.occupied_beds,
        r.status AS room_status,

        b.id AS bed_id,
        b.bed_number,
        b.status AS bed_status

      FROM students s

      LEFT JOIN hostel_allocations a
        ON a.student_id = s.id
        AND a.status = 'Active'

      LEFT JOIN hostel_beds b
        ON b.id = a.bed_id

      LEFT JOIN hostel_rooms r
        ON r.id = a.room_id

      LEFT JOIN hostel_floors f
        ON f.id = r.floor_id

      LEFT JOIN hostels h
        ON h.id = f.hostel_id

      WHERE s.id = ?

      LIMIT 1
      `,
      [studentId]
    );

    // --------------------------------------------------------
    // STUDENT NOT FOUND
    // --------------------------------------------------------

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const student = rows[0];

    // --------------------------------------------------------
    // NO HOSTEL ALLOCATION
    // --------------------------------------------------------

    if (!student.allocation_id) {
      return res.status(200).json({
        success: true,
        message: "Student does not have an active hostel allocation.",
        data: {
          student: {
            id: student.student_db_id,
            student_id: student.enrollment_no,
            name: student.student_name,
            email: student.email,
            mobile: student.mobile,
            department: student.department,
            course: student.course,
            year: student.year,
            semester: student.semester,
            gender: student.gender,
            photo_path: student.photo_path,
          },

          hostel: null,
          floor: null,
          room: null,
          bed: null,
          roommates: [],
        },
      });
    }

    // --------------------------------------------------------
    // GET ROOMMATES
    // --------------------------------------------------------

    const [roommates] = await db.promise().query(
      `
      SELECT
        s.id AS student_db_id,
        s.student_id AS enrollment_no,
        s.name,
        s.email,
        s.mobile,
        s.department,
        s.course,
        s.year,
        s.semester,
        s.gender,
        s.photo_path,

        a.id AS allocation_id,
        a.allocation_date,

        b.id AS bed_id,
        b.bed_number,
        b.status AS bed_status

      FROM hostel_allocations a

      INNER JOIN students s
        ON s.id = a.student_id

      INNER JOIN hostel_beds b
        ON b.id = a.bed_id

      WHERE a.room_id = ?
        AND a.status = 'Active'
        AND a.student_id <> ?

      ORDER BY b.bed_number ASC
      `,
      [
        student.room_id,
        student.student_db_id,
      ]
    );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        student: {
          id: student.student_db_id,
          student_id: student.enrollment_no,
          name: student.student_name,
          email: student.email,
          mobile: student.mobile,
          department: student.department,
          course: student.course,
          year: student.year,
          semester: student.semester,
          gender: student.gender,
          photo_path: student.photo_path,
        },

        allocation: {
          id: student.allocation_id,
          allocation_date: student.allocation_date,
          remarks: student.remarks,
        },

        hostel: {
          id: student.hostel_id,
          name: student.hostel_name,
          code: student.hostel_code,
          type: student.hostel_type,
          total_floors: student.total_floors,
          status: student.hostel_status,
        },

        floor: {
          id: student.floor_id,
          floor_number: student.floor_number,
          floor_name: student.floor_name,
        },

        room: {
          id: student.room_id,
          room_number: student.room_number,
          room_type: student.room_type,
          total_beds: Number(student.total_beds || 0),
          occupied_beds: Number(student.occupied_beds || 0),
          status: student.room_status,
        },

        bed: {
          id: student.bed_id,
          bed_number: student.bed_number,
          status: student.bed_status,
        },

        roommates: roommates.map((roommate) => ({
          id: roommate.student_db_id,
          student_id: roommate.enrollment_no,
          name: roommate.name,
          email: roommate.email,
          mobile: roommate.mobile,
          department: roommate.department,
          course: roommate.course,
          year: roommate.year,
          semester: roommate.semester,
          gender: roommate.gender,
          photo_path: roommate.photo_path,

          allocation: {
            id: roommate.allocation_id,
            allocation_date: roommate.allocation_date,
          },

          bed: {
            id: roommate.bed_id,
            bed_number: roommate.bed_number,
            status: roommate.bed_status,
          },
        })),
      },
    });

  } catch (error) {
    console.error(
      "STUDENT HOSTEL DETAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching hostel details.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}

async function GetStudentAttendance(req, res) {
  try {
    // =====================================================
    // AUTH CHECK
    // =====================================================

    if (!req.user || !req.user.StudentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Student login required.",
      });
    }

    const studentId = Number(req.user.StudentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    // =====================================================
    // FIND STUDENT
    // =====================================================

    const [studentRows] = await db.promise().query(
      `
      SELECT
        id,
        student_id,
        name,
        email,
        mobile,
        course,
        department,
        year,
        semester,
        gender,
        status,
        photo_path
      FROM students
      WHERE id = ?
      LIMIT 1
      `,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const student = studentRows[0];

    // =====================================================
    // TOTAL DAILY ATTENDANCE
    // =====================================================
    //
    // Attendance table me har record ka matlab Present hai.
    // status column nahi hai.
    //
    // Same date par agar multiple attendance records hain,
    // to DISTINCT date ki wajah se ek hi attendance day count hoga.
    // =====================================================

    const [summaryRows] = await db.promise().query(
      `
      SELECT
        COUNT(DISTINCT DATE(COALESCE(a.date, a.marked_at)))
          AS total_attendance_days

      FROM attendance a

      WHERE a.student_id = ?
      `,
      [student.id]
    );

    const totalAttendanceDays = Number(
      summaryRows[0]?.total_attendance_days || 0
    );

    // =====================================================
    // TODAY ATTENDANCE
    // =====================================================

    const [todayRows] = await db.promise().query(
      `
      SELECT
        a.id,
        a.student_id,
        a.date,
        a.marked_at,
        a.confidence

      FROM attendance a

      WHERE a.student_id = ?

        AND (
          DATE(a.date) = CURDATE()
          OR DATE(a.marked_at) = CURDATE()
        )

      ORDER BY a.marked_at DESC

      LIMIT 1
      `,
      [student.id]
    );

    const todayAttendance =
      todayRows.length > 0
        ? {
            ...todayRows[0],
            status: "Present",
          }
        : null;

    // =====================================================
    // DAILY ATTENDANCE HISTORY
    // =====================================================
    //
    // Same day ki duplicate entries ko ek record me convert
    // kar rahe hain.
    //
    // Latest marked_at record rakha jayega.
    // =====================================================

    const [historyRows] = await db.promise().query(
      `
      SELECT
        a.id,
        a.student_id,
        a.date,
        a.marked_at,
        a.confidence

      FROM attendance a

      INNER JOIN (
        SELECT
          student_id,
          DATE(COALESCE(date, marked_at)) AS attendance_date,
          MAX(id) AS latest_id

        FROM attendance

        WHERE student_id = ?

        GROUP BY
          student_id,
          DATE(COALESCE(date, marked_at))
      ) latest
        ON latest.latest_id = a.id

      WHERE a.student_id = ?

      ORDER BY
        COALESCE(a.date, DATE(a.marked_at)) DESC,
        a.marked_at DESC

      LIMIT 100
      `,
      [student.id, student.id]
    );

    const history = historyRows.map((item) => ({
      id: item.id,
      student_id: item.student_id,
      date: item.date,
      marked_at: item.marked_at,
      confidence:
        item.confidence !== null
          ? Number(item.confidence)
          : null,
      status: "Present",
    }));

    // =====================================================
    // MONTHLY ATTENDANCE
    // =====================================================

    const [monthlyRows] = await db.promise().query(
      `
      SELECT
        DATE_FORMAT(
          DATE(COALESCE(a.date, a.marked_at)),
          '%Y-%m'
        ) AS month,

        COUNT(
          DISTINCT DATE(COALESCE(a.date, a.marked_at))
        ) AS attendance_days

      FROM attendance a

      WHERE a.student_id = ?

      GROUP BY
        DATE_FORMAT(
          DATE(COALESCE(a.date, a.marked_at)),
          '%Y-%m'
        )

      ORDER BY month DESC
      `,
      [student.id]
    );

    const monthlyAttendance = monthlyRows.map((item) => ({
      month: item.month,
      attendanceDays: Number(
        item.attendance_days || 0
      ),
    }));

    // =====================================================
    // CURRENT MONTH
    // =====================================================

    const [currentMonthRows] = await db.promise().query(
      `
      SELECT
        COUNT(
          DISTINCT DATE(COALESCE(a.date, a.marked_at))
        ) AS attendance_days

      FROM attendance a

      WHERE a.student_id = ?

        AND YEAR(
          DATE(COALESCE(a.date, a.marked_at))
        ) = YEAR(CURDATE())

        AND MONTH(
          DATE(COALESCE(a.date, a.marked_at))
        ) = MONTH(CURDATE())
      `,
      [student.id]
    );

    const currentMonthAttendance = Number(
      currentMonthRows[0]?.attendance_days || 0
    );

    // =====================================================
    // LAST 7 DAYS
    // =====================================================

    const [last7DaysRows] = await db.promise().query(
      `
      SELECT
        DATE(COALESCE(a.date, a.marked_at)) AS attendance_date,
        MAX(a.marked_at) AS marked_at,
        MAX(a.confidence) AS confidence

      FROM attendance a

      WHERE a.student_id = ?

        AND DATE(
          COALESCE(a.date, a.marked_at)
        ) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)

      GROUP BY
        DATE(COALESCE(a.date, a.marked_at))

      ORDER BY attendance_date DESC
      `,
      [student.id]
    );

    const last7Days = last7DaysRows.map((item) => ({
      date: item.attendance_date,
      marked_at: item.marked_at,
      confidence:
        item.confidence !== null
          ? Number(item.confidence)
          : null,
      status: "Present",
    }));

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      data: {
        student: {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          mobile: student.mobile,
          course: student.course,
          department: student.department,
          year: student.year,
          semester: student.semester,
          photo_path: student.photo_path,
        },

        summary: {
          totalAttendanceDays,

          // Attendance table me jo days marked hain
          presentDays: totalAttendanceDays,

          currentMonthAttendance,

          // Percentage nahi de rahe because
          // expected working/college days table me available nahi hain.
          attendancePercentage: null,
        },

        today: todayAttendance,

        history,

        monthly: monthlyAttendance,

        last7Days,
      },
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "GET STUDENT ATTENDANCE ERROR:"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}
// =====================================================
// GET STUDENT DASHBOARD DATA
// GET /api/student/studentdashboard/dashboard
// =====================================================

async function getDashboardData(req, res) {
  try {
    // =====================================================
    // AUTH CHECK
    // =====================================================

    if (!req.user || !req.user.StudentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Student login required.",
      });
    }

    const studentId = Number(req.user.StudentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    // =====================================================
    // 1. STUDENT + HOSTEL DATA
    // =====================================================

    const [studentRows] = await db.promise().query(
      `
      SELECT
        s.id,
        s.student_id,
        s.name,
        s.email,
        s.mobile,
        s.department,
        s.course,
        s.year,
        s.semester,
        s.gender,
        s.photo_path,

        a.id AS allocation_id,
        a.allocation_date,
        a.remarks AS allocation_remarks,

        h.id AS hostel_id,
        h.name AS hostel_name,
        h.code AS hostel_code,
        h.hostel_type,
        h.total_floors,
        h.status AS hostel_status,

        f.id AS floor_id,
        f.floor_number,
        f.floor_name,

        r.id AS room_id,
        r.room_number,
        r.room_type,
        r.total_beds,
        r.occupied_beds,
        r.status AS room_status,

        b.id AS bed_id,
        b.bed_number,
        b.status AS bed_status

      FROM students s

      LEFT JOIN hostel_allocations a
        ON a.student_id = s.id
        AND a.status = 'Active'

      LEFT JOIN hostel_beds b
        ON b.id = a.bed_id

      LEFT JOIN hostel_rooms r
        ON r.id = a.room_id

      LEFT JOIN hostel_floors f
        ON f.id = r.floor_id

      LEFT JOIN hostels h
        ON h.id = f.hostel_id

      WHERE s.id = ?

      LIMIT 1
      `,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const student = studentRows[0];

    // =====================================================
    // 2. ATTENDANCE SUMMARY
    // =====================================================

    const [attendanceRows] = await db.promise().query(
      `
      SELECT
        COUNT(
          DISTINCT DATE(COALESCE(a.date, a.marked_at))
        ) AS present_days

      FROM attendance a

      WHERE a.student_id = ?
      `,
      [student.id]
    );

    const presentDays = Number(
      attendanceRows[0]?.present_days || 0
    );

    // =====================================================
    // 3. TODAY ATTENDANCE
    // =====================================================

    const [todayAttendanceRows] = await db.promise().query(
      `
      SELECT
        a.id,
        a.date,
        a.marked_at,
        a.confidence

      FROM attendance a

      WHERE a.student_id = ?

        AND (
          DATE(a.date) = CURDATE()
          OR DATE(a.marked_at) = CURDATE()
        )

      ORDER BY a.marked_at DESC

      LIMIT 1
      `,
      [student.id]
    );

    const todayAttendance =
      todayAttendanceRows.length > 0
        ? {
            id: todayAttendanceRows[0].id,
            date: todayAttendanceRows[0].date,
            marked_at: todayAttendanceRows[0].marked_at,
            confidence:
              todayAttendanceRows[0].confidence !== null
                ? Number(todayAttendanceRows[0].confidence)
                : null,
            status: "Present",
          }
        : null;

    // =====================================================
    // 4. CURRENT MONTH ATTENDANCE
    // =====================================================

    const [monthAttendanceRows] = await db.promise().query(
      `
      SELECT
        COUNT(
          DISTINCT DATE(COALESCE(a.date, a.marked_at))
        ) AS attendance_days

      FROM attendance a

      WHERE a.student_id = ?

        AND YEAR(
          DATE(COALESCE(a.date, a.marked_at))
        ) = YEAR(CURDATE())

        AND MONTH(
          DATE(COALESCE(a.date, a.marked_at))
        ) = MONTH(CURDATE())
      `,
      [student.id]
    );

    const currentMonthAttendance = Number(
      monthAttendanceRows[0]?.attendance_days || 0
    );

    // =====================================================
    // 5. ATTENDANCE PERCENTAGE
    // =====================================================
    //
    // Abhi expected working days available nahi hain.
    // Isliye percentage null rakhenge.
    //
    // Agar tumhare paas classes/working_days table hai,
    // baad me yahan exact percentage calculate kar sakte ho.
    // =====================================================

    const attendancePercentage = null;

    // =====================================================
    // 6. TODAY'S TIMETABLE
    // =====================================================
    //
    // IMPORTANT:
    // Agar tumhare database me timetable table ka naam/
    // columns different hain to is query ko apne schema
    // ke according change karna hoga.
    //
    // Expected table:
    // timetable
    //
    // student ke course/department/semester ke basis par
    // today's classes fetch hongi.
    // =====================================================

    let timetable = [];

    try {
      const [timetableRows] = await db.promise().query(
        `
        SELECT
          t.id,
          t.start_time,
          t.end_time,
          t.subject,
          t.room,
          t.class_type,
          t.day_name

        FROM timetable t

        WHERE
          LOWER(TRIM(t.day_name)) =
          LOWER(DAYNAME(CURDATE()))

          AND (
            t.department IS NULL
            OR LOWER(TRIM(t.department))
              = LOWER(TRIM(?))
          )

          AND (
            t.course IS NULL
            OR LOWER(TRIM(t.course))
              = LOWER(TRIM(?))
          )

          AND (
            t.semester IS NULL
            OR t.semester = ?
          )

        ORDER BY t.start_time ASC

        LIMIT 20
        `,
        [
          student.department || "",
          student.course || "",
          student.semester || null,
        ]
      );

      timetable = timetableRows.map((item) => ({
        id: item.id,
        time: item.start_time
          ? formatTimeForDashboard(item.start_time)
          : "",
        endTime: item.end_time
          ? formatTimeForDashboard(item.end_time)
          : "",
        subject: item.subject,
        room: item.room,
        type: item.class_type || "Lecture",
        day: item.day_name,
      }));
    } catch (error) {
      console.warn(
        "Dashboard timetable query skipped:",
        error.message
      );

      timetable = [];
    }

    // =====================================================
    // 7. BUS SCHEDULE
    // =====================================================
    //
    // Agar bus table available hai to yahan query connect
    // kar sakte ho.
    //
    // Filhaal empty array.
    // =====================================================

    let buses = [];

    try {
      const [busRows] = await db.promise().query(
        `
        SELECT
          id,
          route_name,
          departure_time,
          status

        FROM bus_schedule

        WHERE is_active = TRUE

        ORDER BY departure_time ASC

        LIMIT 10
        `
      );

      buses = busRows.map((bus) => ({
        id: bus.id,
        route: bus.route_name,
        time: formatTimeForDashboard(
          bus.departure_time
        ),
        status: bus.status || "Scheduled",
      }));
    } catch (error) {
      console.warn(
        "Dashboard bus query skipped:",
        error.message
      );

      buses = [];
    }

    // =====================================================
    // 8. STUDENT NOTICES
    // =====================================================

    const [noticeRows] = await db.promise().query(
      `
      SELECT
        n.id,
        n.title,
        n.message,
        n.notice_type,
        n.priority,
        n.target_type,
        n.expires_at,
        n.created_at,

        u.id AS admin_id,
        u.name AS admin_name

      FROM notices n

      LEFT JOIN users u
        ON n.created_by = u.id

      WHERE
        (
          n.target_type = 'all'

          OR

          (
            n.target_type = 'student'
            AND n.target_student_id = ?
          )

          OR

          (
            n.target_type = 'department'
            AND LOWER(TRIM(n.target_department))
              = LOWER(TRIM(?))
          )
        )

        AND
        (
          n.expires_at IS NULL
          OR n.expires_at > NOW()
        )

        AND n.is_active = TRUE

      ORDER BY
        CASE
          WHEN n.priority = 'urgent' THEN 1
          WHEN n.priority = 'high' THEN 2
          WHEN n.priority = 'normal' THEN 3
          WHEN n.priority = 'low' THEN 4
          ELSE 5
        END,

        n.created_at DESC

      LIMIT 10
      `,
      [
        student.id,
        student.department || "",
      ]
    );

    const notices = noticeRows.map((notice) => ({
      id: notice.id,
      title: notice.title,
      message: notice.message,
      type: notice.notice_type || "General",
      priority: notice.priority,
      targetType: notice.target_type,
      expiresAt: notice.expires_at,
      createdAt: notice.created_at,
      createdBy: notice.admin_name || "Administration",
    }));

    // =====================================================
    // 9. HOSTEL OBJECT
    // =====================================================

    const hostel =
      student.allocation_id
        ? {
            id: student.hostel_id,
            name: student.hostel_name,
            code: student.hostel_code,
            type: student.hostel_type,
            totalFloors: Number(
              student.total_floors || 0
            ),
            status: student.hostel_status,

            floor: {
              id: student.floor_id,
              number: student.floor_number,
              name: student.floor_name,
            },

            room: {
              id: student.room_id,
              number: student.room_number,
              type: student.room_type,
              totalBeds: Number(
                student.total_beds || 0
              ),
              occupiedBeds: Number(
                student.occupied_beds || 0
              ),
              status: student.room_status,
            },

            bed: {
              id: student.bed_id,
              number: student.bed_number,
              status: student.bed_status,
            },

            allocation: {
              id: student.allocation_id,
              date: student.allocation_date,
              remarks: student.allocation_remarks,
            },
          }
        : null;

    // =====================================================
    // 10. DASHBOARD RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      data: {
        // -------------------------------------------------
        // STUDENT
        // -------------------------------------------------

        student: {
          id: student.id,
          studentId: student.student_id,
          name: student.name,
          email: student.email,
          mobile: student.mobile,
          department: student.department,
          course: student.course,
          year: student.year,
          semester: student.semester,
          gender: student.gender,
          photoPath: student.photo_path,
        },

        // -------------------------------------------------
        // HOSTEL
        // -------------------------------------------------

        hostel,

        // -------------------------------------------------
        // ATTENDANCE
        // -------------------------------------------------

        attendance: {
          overall: attendancePercentage,
          present: presentDays,
          absent: null,
          total: null,
          currentMonth: currentMonthAttendance,
          today: todayAttendance,
        },

        // -------------------------------------------------
        // TIMETABLE
        // -------------------------------------------------

        timetable,

        // -------------------------------------------------
        // BUS
        // -------------------------------------------------

        buses,

        // -------------------------------------------------
        // NOTICES
        // -------------------------------------------------

        notices,

        // -------------------------------------------------
        // QUICK ACTIONS
        // -------------------------------------------------

        quickActions: [
          {
            title: "Report Complaint",
            icon: "🛠",
            path: "/student/complaints",
          },
          {
            title: "View Timetable",
            icon: "📅",
            path: "/student/timetable",
          },
          {
            title: "Bus Schedule",
            icon: "🚌",
            path: "/student/bus",
          },
          {
            title: "Hostel Details",
            icon: "🏢",
            path: "/student/hostel",
          },
        ],
      },
    });
  } catch (error) {
    console.error(
      "GET STUDENT DASHBOARD DATA ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}


// =====================================================
// HELPER
// =====================================================

function formatTimeForDashboard(value) {
  if (!value) {
    return "";
  }

  const parts = String(value).split(":");

  if (parts.length < 2) {
    return String(value);
  }

  let hour = Number(parts[0]);
  const minute = parts[1];

  if (Number.isNaN(hour)) {
    return String(value);
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
}



// =====================================================
// EXPORT
// =====================================================

module.exports = {
  login,
  register,
  logout,
  deleteAccount,
   GetStudentNotices,
  HostelDetail,GetStudentAttendance,
  getDashboardData,
};