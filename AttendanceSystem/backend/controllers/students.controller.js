const axios = require("axios");
const FormData = require("form-data");
const pool = require("../config/db");
require("dotenv").config();

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8000";

// GET /api/students
async function listStudents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, roll_number, class_id, created_at FROM students ORDER BY name`
    );
    return res.json({ success: true, students: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/students
async function createStudent(req, res) {
  try {
    const { name, email, rollNumber, classId } = req.body;
    if (!name || !rollNumber) {
      return res.status(400).json({ success: false, message: "name and rollNumber required" });
    }

    let resolvedClassId = null;
    if (classId !== undefined && classId !== null && classId !== "") {
      const [classRows] = await pool.query("SELECT id FROM classes WHERE id = ?", [classId]);
      if (classRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Class ID ${classId} does not exist. Leave Class ID blank, or create the class first.`,
        });
      }
      resolvedClassId = classId;
    }

    const [result] = await pool.query(
      "INSERT INTO students (name, email, roll_number, class_id) VALUES (?, ?, ?, ?)",
      [name, email || null, rollNumber, resolvedClassId]
    );

    return res.status(201).json({ success: true, studentId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/students/:id/enroll-face
// multipart/form-data, field "image" — one sample at a time.
// Frontend should call this 5-10 times with different poses per student.
async function enrollFace(req, res) {
  try {
    const { id } = req.params;
    const { sampleLabel } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "image file required" });
    }

    const [studentRows] = await pool.query("SELECT id FROM students WHERE id = ?", [id]);
    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Ask the Python face-service for an embedding of this image
    const form = new FormData();
    form.append("image", req.file.buffer, { filename: "face.jpg" });

    const faceResp = await axios.post(`${FACE_SERVICE_URL}/face/embedding`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });

    if (faceResp.status !== 200) {
      console.error(
        "face-service /face/embedding returned non-200:",
        faceResp.status,
        typeof faceResp.data === "string" ? faceResp.data.slice(0, 500) : faceResp.data
      );
      return res.status(502).json({
        success: false,
        message: `face-service error (HTTP ${faceResp.status}) — check the uvicorn terminal for a traceback`,
      });
    }

    if (!faceResp.data.success) {
      return res.status(422).json({ success: false, message: faceResp.data.message || "No face detected" });
    }

    const embedding = faceResp.data.embedding; // array of floats

    await pool.query(
      "INSERT INTO student_faces (student_id, embedding, sample_label) VALUES (?, ?, ?)",
      [id, JSON.stringify(embedding), sampleLabel || null]
    );

    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM student_faces WHERE student_id = ?",
      [id]
    );

    return res.status(201).json({
      success: true,
      studentId: Number(id),
      totalSamples: countRows[0].total,
    });
  } catch (err) {
    console.error("enrollFace() failed:", err.response?.status, err.response?.data || err.stack || err.message);
    return res.status(500).json({ success: false, message: "Face enrollment failed" });
  }
}

// GET /api/students/:id/faces  (sample count, for enrollment progress UI)
async function getFaceSampleCount(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, sample_label, created_at FROM student_faces WHERE student_id = ?",
      [id]
    );
    return res.json({ success: true, samples: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/classes
async function listClasses(req, res) {
  try {
    const [rows] = await pool.query("SELECT id, name, teacher_id, created_at FROM classes ORDER BY name");
    return res.json({ success: true, classes: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/classes
async function createClass(req, res) {
  try {
    const { name, teacherId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name required" });
    }
    const [result] = await pool.query(
      "INSERT INTO classes (name, teacher_id) VALUES (?, ?)",
      [name, teacherId || null]
    );
    return res.status(201).json({ success: true, classId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  listStudents,
  createStudent,
  enrollFace,
  getFaceSampleCount,
  listClasses,
  createClass,
};