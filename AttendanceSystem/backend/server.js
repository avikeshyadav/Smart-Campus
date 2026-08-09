const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const studentsRoutes = require("./routes/students.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ success: true, service: "attendance-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Attendance backend running on http://localhost:${PORT}`);
});
