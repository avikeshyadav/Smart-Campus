const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  listStudents,
  createStudent,
  enrollFace,
  getFaceSampleCount,
} = require("../controllers/students.controller");
const { authenticate, authorize } = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", authenticate, authorize("admin", "teacher", "attendance_operator"), listStudents);
router.post("/", authenticate, authorize("admin"), createStudent);

// Face enrollment restricted to admin only, per the recommended role design
router.post("/:id/enroll-face", authenticate, authorize("admin"), upload.single("image"), enrollFace);
router.get("/:id/faces", authenticate, authorize("admin", "teacher"), getFaceSampleCount);

module.exports = router;
