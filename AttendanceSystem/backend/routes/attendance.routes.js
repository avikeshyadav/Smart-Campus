const express = require("express");
const multer = require("multer");
const router = express.Router();
const { recognize, getAttendance } = require("../controllers/attendance.controller");
const { authenticate, authorize } = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Controlled interval calls from the frontend (5-10 FPS recognition, not 30 FPS)
router.post(
  "/recognize",
  authenticate,
  authorize("admin", "teacher", "attendance_operator"),
  upload.single("image"),
  recognize
);

router.get("/", authenticate, authorize("admin", "teacher", "attendance_operator", "student"), getAttendance);

module.exports = router;
