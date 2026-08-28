const db = require("../config/database.js");

// =====================================================
// Helper: Validate Student ID
// =====================================================
const isValidId = (id) => {
  return /^\d+$/.test(String(id));
};

// =====================================================
// Helper: Clean Value
// =====================================================
const clean = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const str = String(value).trim();

  return str === "" ? null : str;
};

// =====================================================
// Helper: Email Validation
// =====================================================
const isValidEmail = (email) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

async function viewStudents(req, res) {
  try {
    const {
      search = "",
      status = "",
      page,
      limit,
    } = req.query;

    // =================================================
    // SELECT ONLY FRONTEND REQUIRED FIELDS
    // =================================================
    let sql = `
      SELECT
        id,
        student_id,
        name,
        email,
        mobile AS phone,
        department,
        course,
        year,
        semester,
        gender,
        dob,
        status,
        admission_date
      FROM students
      WHERE 1 = 1
    `;

    const params = [];

    // =================================================
    // SEARCH
    // =================================================
    if (search && search.trim() !== "") {
      sql += `
        AND (
          name LIKE ?
          OR student_id LIKE ?
          OR email LIKE ?
          OR mobile LIKE ?
          OR class_name LIKE ?
          OR course LIKE ?
          OR gender LIKE ?
        )
      `;

      const searchValue = `%${search.trim()}%`;

      params.push(
        searchValue, // name
        searchValue, // student_id
        searchValue, // email
        searchValue, // mobile
        searchValue, // class_name / department
        searchValue, // course
        searchValue  // gender
      );
    }

    // =================================================
    // STATUS FILTER
    // =================================================
    if (status && status.trim() !== "") {
      sql += `
        AND LOWER(status) = LOWER(?)
      `;

      params.push(status.trim());
    }

    // =================================================
    // ORDER
    // =================================================
    sql += `
      ORDER BY id DESC
    `;

    // =================================================
    // PAGINATION
    // =================================================
    const usePagination =
      page !== undefined ||
      limit !== undefined;

    if (usePagination) {
      const currentPage = Math.max(
        parseInt(page || "1", 10),
        1
      );

      const perPage = Math.min(
        Math.max(
          parseInt(limit || "10", 10),
          1
        ),
        100
      );

      const offset =
        (currentPage - 1) * perPage;

      sql += `
        LIMIT ? OFFSET ?
      `;

      params.push(
        perPage,
        offset
      );

      // =================================================
      // COUNT QUERY
      // =================================================
      let countSql = `
        SELECT COUNT(*) AS total
        FROM students
        WHERE 1 = 1
      `;

      const countParams = [];

      // -----------------------------------------------
      // Search for count
      // -----------------------------------------------
      if (search && search.trim() !== "") {
        countSql += `
          AND (
            name LIKE ?
            OR student_id LIKE ?
            OR email LIKE ?
            OR mobile LIKE ?
            OR class_name LIKE ?
            OR course LIKE ?
            OR gender LIKE ?
          )
        `;

        const searchValue =
          `%${search.trim()}%`;

        countParams.push(
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          searchValue
        );
      }

      // -----------------------------------------------
      // Status for count
      // -----------------------------------------------
      if (status && status.trim() !== "") {
        countSql += `
          AND LOWER(status) = LOWER(?)
        `;

        countParams.push(
          status.trim()
        );
      }

      // =================================================
      // COUNT
      // =================================================
      db.query(
        countSql,
        countParams,
        (countErr, countResult) => {
          if (countErr) {
            console.error(
              "Student count error:",
              countErr
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to count students",
              error: countErr.message,
            });
          }

          // =================================================
          // FETCH STUDENTS
          // =================================================
          db.query(
            sql,
            params,
            (err, result) => {
              if (err) {
                console.error(
                  "Get students error:",
                  err
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to fetch students",
                  error: err.message,
                });
              }

              const total =
                countResult[0].total;

              return res.status(200).json({
                success: true,

                students: result,

                pagination: {
                  total,
                  page: currentPage,
                  limit: perPage,
                  totalPages:
                    Math.ceil(
                      total / perPage
                    ),
                },
              });
            }
          );
        }
      );

      return;
    }

    // =================================================
    // WITHOUT PAGINATION
    // =================================================
    db.query(
      sql,
      params,
      (err, result) => {
        if (err) {
          console.error(
            "Get students error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Database Error Detected",
            error: err.message,
          });
        }

        return res.status(200).json({
          success: true,
          students: result,
          total: result.length,
        });
      }
    );
  } catch (error) {
    console.error(
      "View students error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
// =====================================================
// GET SINGLE STUDENT
// GET /api/students/:id
// =====================================================
async function getStudentById(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  const sql = `
    SELECT
      id,
      name,
      student_id,
      class_name,
      email,
      mobile,
      photo_path,
      status
    FROM students
    WHERE id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Get single student error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch student",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student: result[0],
    });
  });
}

// =====================================================
// GET STUDENTS COUNT
// GET /api/students/count
// =====================================================
async function countStudents(req, res) {
  db.query(
    "SELECT COUNT(*) AS total FROM students",
    (err, result) => {
      if (err) {
        console.error("Count students error:", err);

        return res.status(500).json({
          success: false,
          message: "Database Error Detected",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        total: result[0].total,
      });
    }
  );
}

// =====================================================
// ADD STUDENT
// POST /api/students
// =====================================================
async function addStudent(req, res) {
  try {
    const {
      student_name,
      roll_no,
      class: studentClass,
      email,
      mobile,
      photo,
      status,
    } = req.body;

    // -----------------------------------------------
    // Clean values
    // -----------------------------------------------
    const name = clean(student_name);
    const rollNumber = clean(roll_no);
    const className = clean(studentClass);
    const studentEmail = clean(email);
    const studentMobile = clean(mobile);
    const studentPhoto = clean(photo);

    const studentStatus =
      clean(status) || "active";

    // -----------------------------------------------
    // Required fields
    // -----------------------------------------------
    if (!name || !rollNumber || !className) {
      return res.status(400).json({
        success: false,
        message:
          "Student name, roll number and class are required",
      });
    }

    // -----------------------------------------------
    // Name validation
    // -----------------------------------------------
    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Student name must contain at least 2 characters",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Student name is too long",
      });
    }

    // -----------------------------------------------
    // Email validation
    // -----------------------------------------------
    if (!isValidEmail(studentEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // -----------------------------------------------
    // Mobile validation
    // -----------------------------------------------
    if (
      studentMobile &&
      !/^[0-9+\-\s()]{7,20}$/.test(studentMobile)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    // -----------------------------------------------
    // Check duplicate roll number
    // -----------------------------------------------
    const duplicateSql = `
      SELECT id
      FROM students
      WHERE student_id = ?
      LIMIT 1
    `;

    db.query(
      duplicateSql,
      [rollNumber],
      (duplicateErr, duplicateResult) => {
        if (duplicateErr) {
          console.error(
            "Duplicate student check error:",
            duplicateErr
          );
          return res.status(500).json({
            success: false,
            message: "Database error while checking student",
          });
        }
        if (duplicateResult.length > 0) {
          return res.status(409).json({
            success: false,
            message:
              "Student with this enrollment/roll number already exists",
          });
        }

        // -----------------------------------------------
        // Insert
        // -----------------------------------------------
        const sql = `
          INSERT INTO students
          (
            name,
            student_id,
            class_name,
            email,
            mobile,
            photo_path,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            name,
            rollNumber,
            className,
            studentEmail,
            studentMobile,
            studentPhoto,
            studentStatus,
          ],
          (err, result) => {
            if (err) {
              console.error("Add student error:", err);

              return res.status(500).json({
                success: false,
                message: "Failed to add student",
                error: err.message,
              });
            }

            return res.status(201).json({
              success: true,
              message: "Student Added Successfully",
              id: result.insertId,
              student: {
                id: result.insertId,
                name,
                student_id: rollNumber,
                class_name: className,
                email: studentEmail,
                mobile: studentMobile,
                photo_path: studentPhoto,
                status: studentStatus,
              },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Add student exception:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// =====================================================
// UPDATE STUDENT
// PUT /api/students/:id
// =====================================================
async function updateStudent(req, res) {
  try {
    const { id } = req.params;

    // -----------------------------------------------
    // Validate database ID
    // -----------------------------------------------
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const {
      student_id,
      name,
      email,
      phone,
      department,
      course,
      year,
      semester,
      gender,
      dob,
      status,
      admission_date,
    } = req.body;

    // -----------------------------------------------
    // Clean / normalize values
    // -----------------------------------------------
    const studentId = String(student_id || "").trim();
    const studentName = String(name || "").trim();
    const studentEmail = String(email || "").trim();
    const studentPhone = String(phone || "").trim();
    const studentDepartment = String(department || "").trim();
    const studentCourse = String(course || "").trim();
    const studentYear =
      year === "" || year === undefined || year === null
        ? null
        : Number(year);

    const studentSemester =
      semester === "" ||
      semester === undefined ||
      semester === null
        ? null
        : Number(semester);

    const studentGender = String(gender || "").trim();

    const studentStatus =
      String(status || "active").trim().toLowerCase();

    const studentDob =
      dob === "" || dob === undefined ? null : dob;

    const studentAdmissionDate =
      admission_date === "" ||
      admission_date === undefined
        ? null
        : admission_date;

    // -----------------------------------------------
    // Required validation
    // -----------------------------------------------
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number is required",
      });
    }

    if (!studentName) {
      return res.status(400).json({
        success: false,
        message: "Student name is required",
      });
    }

    // -----------------------------------------------
    // Email validation
    // -----------------------------------------------
    if (
      studentEmail &&
      !isValidEmail(studentEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // -----------------------------------------------
    // Phone validation
    // -----------------------------------------------
    if (
      studentPhone &&
      !/^[0-9+\-\s()]{7,20}$/.test(studentPhone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // -----------------------------------------------
    // Year validation
    // -----------------------------------------------
    if (
      studentYear !== null &&
      (!Number.isInteger(studentYear) ||
        studentYear < 1 ||
        studentYear > 4)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    // -----------------------------------------------
    // Semester validation
    // -----------------------------------------------
    if (
      studentSemester !== null &&
      (!Number.isInteger(studentSemester) ||
        studentSemester < 1 ||
        studentSemester > 8)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester",
      });
    }

    // -----------------------------------------------
    // Status validation
    // -----------------------------------------------
    const allowedStatuses = [
      "active",
      "inactive",
      "pending",
    ];

    if (!allowedStatuses.includes(studentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student status",
      });
    }

    // -----------------------------------------------
    // Check student exists by DB primary key
    // -----------------------------------------------
    db.query(
      "SELECT id FROM students WHERE id = ? LIMIT 1",
      [id],
      (findErr, findResult) => {
        if (findErr) {
          console.error(
            "Find student before update error:",
            findErr
          );

          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        if (findResult.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Student not found",
          });
        }

        // -----------------------------------------------
        // Check duplicate enrollment number
        // -----------------------------------------------
        db.query(
          `
          SELECT id
          FROM students
          WHERE student_id = ?
          AND id != ?
          LIMIT 1
          `,
          [studentId, id],
          (duplicateErr, duplicateResult) => {
            if (duplicateErr) {
              console.error(
                "Check duplicate student ID error:",
                duplicateErr
              );

              return res.status(500).json({
                success: false,
                message: "Database error",
              });
            }

            if (duplicateResult.length > 0) {
              return res.status(409).json({
                success: false,
                message:
                  "Enrollment number already exists",
              });
            }

            // -----------------------------------------------
            // Update student
            // -----------------------------------------------
            const sql = `
              UPDATE students
              SET
                student_id = ?,
                name = ?,
                email = ?,
                mobile = ?,
                department = ?,
                course = ?,
                year = ?,
                semester = ?,
                gender = ?,
                dob = ?,
                status = ?,
                admission_date = ?
              WHERE id = ?
            `;

            const params = [
              studentId,
              studentName,
              studentEmail || null,
              studentPhone || null,
              studentDepartment || null,
              studentCourse || null,
              studentYear,
              studentSemester,
              studentGender || null,
              studentDob,
              studentStatus,
              studentAdmissionDate,
              id,
            ];

            db.query(
              sql,
              params,
              (updateErr, result) => {
                if (updateErr) {
                  console.error(
                    "Update student error:",
                    updateErr
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Failed to update student",
                    error: updateErr.message,
                  });
                }

                if (result.affectedRows === 0) {
                  return res.status(404).json({
                    success: false,
                    message: "Student not found",
                  });
                }

                return res.status(200).json({
                  success: true,
                  message:
                    "Student updated successfully",
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error(
      "Update student exception:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
// =====================================================
// UPDATE STUDENT STATUS
// PATCH /api/students/:id/status
// =====================================================
async function updateStudentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  const allowedStatuses = [
    "active",
    "inactive",
    "suspended",
    "graduated",
  ];

  const newStatus = String(status || "")
    .trim()
    .toLowerCase();

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status. Allowed: active, inactive, suspended, graduated",
    });
  }

  db.query(
    `
      UPDATE students
      SET status = ?
      WHERE id = ?
    `,
    [newStatus, id],
    (err, result) => {
      if (err) {
        console.error(
          "Update student status error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to update student status",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Student status updated successfully",
        status: newStatus,
      });
    }
  );
}

// =====================================================
// DELETE STUDENT
// DELETE /api/students/:id
// =====================================================
async function deleteStudent(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  console.log("Deleting student:", id);

  // -----------------------------------------------
  // First check student
  // -----------------------------------------------
  db.query(
    "SELECT id FROM students WHERE id = ? LIMIT 1",
    [id],
    (findErr, findResult) => {
      if (findErr) {
        console.error(
          "Find student for delete error:",
          findErr
        );

        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      if (findResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // -----------------------------------------------
      // Delete attendance first
      // -----------------------------------------------
      db.query(
        "DELETE FROM attendance WHERE student_id = ?",
        [id],
        (attendanceErr, attendanceResult) => {
          if (attendanceErr) {
            console.error(
              "Delete attendance error:",
              attendanceErr
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to delete student attendance",
              error: attendanceErr.message,
            });
          }

          console.log(
            "Attendance records deleted:",
            attendanceResult.affectedRows
          );

          // -----------------------------------------------
          // Delete student
          // -----------------------------------------------
          db.query(
            "DELETE FROM students WHERE id = ?",
            [id],
            (studentErr, studentResult) => {
              if (studentErr) {
                console.error(
                  "Delete student error:",
                  studentErr
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to delete student",
                  error: studentErr.message,
                });
              }

              if (
                studentResult.affectedRows === 0
              ) {
                return res.status(404).json({
                  success: false,
                  message: "Student not found",
                });
              }

              return res.status(200).json({
                success: true,
                message:
                  "Student Deleted Successfully",
              });
            }
          );
        }
      );
    }
  );
}

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  viewStudents,
  getStudentById,
  countStudents,
  addStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
};