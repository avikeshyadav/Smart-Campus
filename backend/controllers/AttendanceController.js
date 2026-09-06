const db = require("../config/database");

// =====================================================
// GET ATTENDANCE OVERVIEW
// =====================================================
async function getAttendance(req, res) {
  try {
    const {
      period = "Today",
      date = null,
    } = req.query;

    let dateCondition = "";
    let dateParams = [];

    // =================================================
    // DATE FILTER
    // =================================================

    if (date) {
      dateCondition = `
        AND DATE(a.marked_at) = ?
      `;

      dateParams = [date];
    } 
    
    else if (period === "Today") {
      dateCondition = `
        AND DATE(a.marked_at) = CURDATE()
      `;
    } 
    
    else if (period === "This Week") {
      dateCondition = `
        AND YEARWEEK(a.marked_at, 1) =
            YEARWEEK(CURDATE(), 1)
      `;
    } 
    
    else if (period === "This Month") {
      dateCondition = `
        AND YEAR(a.marked_at) = YEAR(CURDATE())
        AND MONTH(a.marked_at) = MONTH(CURDATE())
      `;
    } 
    
    else if (period === "This Semester") {
      // Current year ko semester fallback maana gaya hai
      dateCondition = `
        AND YEAR(a.marked_at) = YEAR(CURDATE())
      `;
    }

    // =================================================
    // 1. TOTAL ACTIVE STUDENTS
    // =================================================

    const [totalResult] = await db.promise().query(`
      SELECT COUNT(*) AS total
      FROM students
      WHERE LOWER(COALESCE(status, 'Active')) = 'active'
    `);

    const totalStudents = Number(
      totalResult[0]?.total || 0
    );

    // =================================================
    // 2. PRESENT STUDENTS
    // =================================================

    const [presentResult] = await db.promise().query(
      `
      SELECT COUNT(DISTINCT a.student_id) AS present

      FROM attendance a

      INNER JOIN students s
        ON s.id = a.student_id

      WHERE LOWER(
        COALESCE(s.status, 'Active')
      ) = 'active'

      ${dateCondition}
      `,
      dateParams
    );

    const presentStudents = Number(
      presentResult[0]?.present || 0
    );

    // =================================================
    // 3. ABSENT STUDENTS
    // =================================================

    const absentStudents = Math.max(
      totalStudents - presentStudents,
      0
    );

    // =================================================
    // 4. LATE STUDENTS
    // =================================================
    //
    // Aapki attendance table mein late ka column nahi hai.
    // Isliye abhi 0.
    //

    const lateStudents = 0;

    // =================================================
    // 5. ATTENDANCE PERCENTAGE
    // =================================================

    const attendancePercentage =
      totalStudents > 0
        ? Math.round(
            (presentStudents / totalStudents) * 100
          )
        : 0;

    // =================================================
    // 6. ATTENDANCE STUDENT DETAILS
    // =================================================

const [attendanceStudents] =
  await db.promise().query(
    `
    SELECT
      s.id,
      s.name,
      s.student_id,
      s.mobile,
      s.email,
      s.course,
      s.department,
      s.year,
      s.gender,
      s.status,
      s.semester,
      s.dob,
      s.photo_path,

      a.id AS attendance_id,
      a.student_id AS attendance_student_id,
      a.date,
      a.marked_at,
      a.confidence,

      CASE
        WHEN a.id IS NULL THEN 'Absent'
        ELSE 'Present'
      END AS attendance_status

    FROM students s

    LEFT JOIN attendance a
      ON a.student_id = s.id

      ${
        date
          ? `AND DATE(a.marked_at) = ?`
          : period === "Today"
          ? `AND DATE(a.marked_at) = CURDATE()`
          : period === "This Week"
          ? `
              AND YEARWEEK(a.marked_at, 1) =
                  YEARWEEK(CURDATE(), 1)
            `
          : period === "This Month"
          ? `
              AND YEAR(a.marked_at) = YEAR(CURDATE())
              AND MONTH(a.marked_at) = MONTH(CURDATE())
            `
          : period === "This Semester"
          ? `
              AND YEAR(a.marked_at) = YEAR(CURDATE())
            `
          : ""
      }

    WHERE LOWER(
      COALESCE(s.status, 'Active')
    ) = 'active'

    ORDER BY
      CASE
        WHEN a.id IS NULL THEN 1
        ELSE 0
      END,
      s.name ASC
    `,
    dateParams
  );

    // =================================================
    // 7. DEPARTMENT PERFORMANCE
    // =================================================

    const [departmentResult] =
      await db.promise().query(
        `
        SELECT

          COALESCE(
            NULLIF(TRIM(s.department), ''),
            'Unknown'
          ) AS name,

          COUNT(DISTINCT s.id) AS students,

          COUNT(DISTINCT a.student_id) AS present

        FROM students s

        LEFT JOIN attendance a
          ON a.student_id = s.id
          ${dateCondition}

        WHERE LOWER(
          COALESCE(s.status, 'Active')
        ) = 'active'

        GROUP BY
          COALESCE(
            NULLIF(TRIM(s.department), ''),
            'Unknown'
          )

        ORDER BY name ASC
        `,
        dateParams
      );

    // =================================================
    // DEPARTMENT COLORS
    // =================================================

    const colors = [
      "#4ade80",
      "#38bdf8",
      "#facc15",
      "#a78bfa",
      "#fb7185",
      "#22d3ee",
      "#f97316",
      "#c084fc",
    ];

    const departments =
      departmentResult.map((dept, index) => {
        const students = Number(
          dept.students || 0
        );

        const present = Number(
          dept.present || 0
        );

        const percentage =
          students > 0
            ? Math.round(
                (present / students) * 100
              )
            : 0;

        return {
          name: dept.name,
          value: percentage,
          students,
          present,
          color:
            colors[index % colors.length],
        };
      });

    // =================================================
    // 8. LAST 7 DAYS TREND
    // =================================================

    const [trendResult] =
      await db.promise().query(`
        SELECT

          DATE(a.marked_at) AS attendance_date,

          COUNT(
            DISTINCT a.student_id
          ) AS present

        FROM attendance a

        INNER JOIN students s
          ON s.id = a.student_id

        WHERE
          LOWER(
            COALESCE(s.status, 'Active')
          ) = 'active'

          AND a.marked_at >= DATE_SUB(
            CURDATE(),
            INTERVAL 6 DAY
          )

        GROUP BY DATE(a.marked_at)

        ORDER BY attendance_date ASC
      `);

    const trendData =
      trendResult.map((item) => {
        const present = Number(
          item.present || 0
        );

        const percentage =
          totalStudents > 0
            ? Math.round(
                (present / totalStudents) * 100
              )
            : 0;

        return {
          day: new Date(
            item.attendance_date
          ).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),

          date: item.attendance_date,

          attendance: percentage,

          present,
        };
      });

    // =================================================
    // 9. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      // Frontend ka primary format
      summary: {
        present: presentStudents,
        absent: absentStudents,
        late: lateStudents,
        total: totalStudents,
        attendancePercentage,

        changePercentage: 0,

        // 80% target assume kiya gaya hai
        targetDifference:
          attendancePercentage - 80,
      },

      // Compatibility ke liye
      stats: {
        totalStudents,
        presentStudents,
        absentStudents,
        lateStudents,
        attendancePercentage,
      },

      // Donut chart
      attendanceData: [
        {
          name: "Present",
          value: presentStudents,
          color: "#4ade80",
        },
        {
          name: "Absent",
          value: absentStudents,
          color: "#fb7185",
        },
        {
          name: "Late",
          value: lateStudents,
          color: "#facc15",
        },
      ],
      // Department chart
      departments,
      // Frontend ke liye
      trend: trendData,
      // Compatibility ke liye
      trendData,
      // Student attendance records
      students: attendanceStudents,
      date:
        date ||
        new Date().toISOString().split("T")[0],
    });

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "GET ATTENDANCE ERROR:"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
      code: error.code || null,
      sqlState: error.sqlState || null,
    });
  }
}


// =====================================================
// POST ATTENDANCE
// =====================================================

async function PostAttendance(req, res) {
  return res.status(200).json({
    success: true,
    message:
      "Attendance is managed by attendance server",
  });
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAttendance,
  PostAttendance,
};