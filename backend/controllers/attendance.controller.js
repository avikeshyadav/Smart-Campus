const axios = require("axios");
const FormData = require("form-data");
const pool = require("../config/db");
require("dotenv").config();

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8000";
const MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.6");

/**
 * Backend decides Present/Late/Absent — never the frontend.
 */
async function resolveStatus(classId, checkInDate) {
  const [rules] = await pool.query(
    `SELECT present_start, present_end, late_end FROM attendance_rules
     WHERE class_id ${classId ? "= ?" : "IS NULL"} LIMIT 1`,
    classId ? [classId] : []
  );

  const rule = rules[0] || { present_start: "08:00:00", present_end: "10:00:00", late_end: "10:30:00" };
  const timeStr = checkInDate.toTimeString().split(" ")[0];

  if (timeStr <= rule.present_end) return "present";
  if (timeStr <= rule.late_end) return "late";
  return "absent";
}

// POST /api/attendance/recognize
// multipart/form-data, field "image" — a single live-captured frame.
async function recognize(req, res) {
  try {
    const { classId } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "image file required" });
    }

    // 1. Pull all known face embeddings from the DB (source of truth stays in MySQL)
    const [faceRows] = await pool.query(
      `SELECT sf.student_id, sf.embedding, s.name
       FROM student_faces sf JOIN students s ON sf.student_id = s.id
       ${classId ? "WHERE s.class_id = ?" : ""}`,
      classId ? [classId] : []
    );

    if (faceRows.length === 0) {
      return res.status(404).json({ success: false, message: "No enrolled faces found" });
    }

    const candidates = faceRows.map((r) => ({
      studentId: r.student_id,
      name: r.name,
      embedding: JSON.parse(r.embedding),
    }));

    // 2. Ask the stateless Python service to detect + compare (also runs liveness check)
    const form = new FormData();
    form.append("image", req.file.buffer, { filename: "frame.jpg" });
    form.append("candidates", JSON.stringify(candidates));

    const faceResp = await axios.post(`${FACE_SERVICE_URL}/face/compare`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    const result = faceResp.data;

    if (!result.faceDetected) {
      return res.status(422).json({ success: false, matched: false, message: "No face detected" });
    }

    if (!result.live) {
      return res.status(422).json({ success: false, matched: false, message: "Liveness check failed" });
    }

    if (!result.matched || result.confidence < MATCH_THRESHOLD) {
      return res.status(200).json({
        success: true,
        matched: false,
        message: "Face not recognized",
        confidence: result.confidence,
      });
    }

    const { studentId, confidence } = result;

    // 3. Duplicate check — one entry per student per day per class
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const [existing] = await pool.query(
      `SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ? AND class_id ${
        classId ? "= ?" : "IS NULL"
      }`,
      classId ? [studentId, today, classId] : [studentId, today]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        matched: true,
        studentId,
        confidence,
        alreadyMarked: true,
        message: "Attendance already marked today",
      });
    }

    // 4. Backend decides status from configured rules
    const status = await resolveStatus(classId || null, now);

    await pool.query(
      `INSERT INTO attendance (student_id, class_id, attendance_date, check_in_time, status, confidence, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, classId || null, today, now, status, confidence, req.user?.id || null]
    );

    return res.status(201).json({
      success: true,
      matched: true,
      studentId,
      confidence,
      status,
      alreadyMarked: false,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Recognition failed" });
  }
}

// GET /api/attendance?date=YYYY-MM-DD&classId=1
async function getAttendance(req, res) {
  try {
    const { date, classId, studentId } = req.query;
    const conditions = [];
    const params = [];

    if (date) {
      conditions.push("a.attendance_date = ?");
      params.push(date);
    }
    if (classId) {
      conditions.push("a.class_id = ?");
      params.push(classId);
    }
    if (studentId) {
      conditions.push("a.student_id = ?");
      params.push(studentId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT a.id, a.student_id, s.name AS student_name, a.class_id, a.attendance_date,
              a.check_in_time, a.status, a.confidence
       FROM attendance a JOIN students s ON a.student_id = s.id
       ${where}
       ORDER BY a.check_in_time DESC`,
      params
    );

    return res.json({ success: true, attendance: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { recognize, getAttendance };
