const express = require("express");
const authController = require("../controllers/authController.js");
const studentController = require("../controllers/studentController.js");
const moduleController = require("../controllers/moduleController.js");
const developerController = require("../controllers/DevelopreContoller.js");
const attendanceController = require("../controllers/AttendanceController.js");
const studentDashboardController = require("../controllers/StudentDashboardController.js");
const notificationController = require("../controllers/notificationController.js");
const verifyAccessToken = require("../middleware/auth.js");

const router = express.Router();
//------------------USER Auth Routes ----------------
router.get("/captcha",authController.captcha);
router.post("/register",authController.register);
router.post("/login", authController.login);
router.get('/logout',authController.logout);
router.post("/refresh", authController.refresh);
router.post("/forgetpassword",authController.forgotPassword);
router.post("/login/2fa", authController.verifyLoginTwoFactor);
router.get("/verify-email",authController.verifyAccount);

// ====================Admin Profile Manages =========================
router.get("/admin/profile",verifyAccessToken,authController.getFullProfile);
router.put("/admin/profile",verifyAccessToken,authController.updatePersonalInfo);
router.post("/admin/profile/change_password",verifyAccessToken,authController.changePassword);
router.post("/login/2fa",authController.verifyLoginTwoFactor);
router.post("/admin/profile/2fa",verifyAccessToken,authController.twoFactor);
router.post("/admin/profile/2fa/verify",verifyAccessToken,authController.verifyTwoFactorSetup);

//--------------------STUDENTS CONTROLLER ---------------
router.get("/students/count",verifyAccessToken,studentController.countStudents);
router.get("/students", verifyAccessToken,studentController.viewStudents);
router.post("/students",verifyAccessToken,studentController.addStudent);
router.get( "/students/:id", verifyAccessToken, studentController.getStudentById);
router.put("/students/:id",verifyAccessToken, studentController.updateStudent);
router.patch("/students/:id/status",verifyAccessToken,studentController.updateStudentStatus);
router.delete("/students/:id", verifyAccessToken,studentController.deleteStudent);
// ===============================
// Dashboard Modules API
// ===============================
router.get("/dashboard/modules",verifyAccessToken, moduleController.getModules);
router.post("/dashboard/modules",verifyAccessToken, moduleController.addModule);
router.put("/dashboard/modules/:id", verifyAccessToken,moduleController.updateModule);
router.put("/dashboard/modules/:id/status",verifyAccessToken,moduleController.updateModuleStatus);
router.delete("/dashboard/modules/:id",verifyAccessToken,moduleController.deleteModule);
// ================================== Developer APIs ==========================================
router.post("/developer",verifyAccessToken, developerController.getDeveloper);
router.get("/developer", developerController.FetchDevelopers);
// ======================= Attendance APIs ====================================================
router.get("/attendance/",attendanceController.getAttendance);
router.post("/attendance", attendanceController.PostAttendance);

// ===================Student Dashboard Routes ===================
router.post("/studentdashboard/login",studentDashboardController.login);
// ====================== Notification Routes ======================
router.get("/notifications",verifyAccessToken, notificationController.getNotifications);
router.get("/notifications/unread-count",verifyAccessToken, notificationController.getUnreadCount);
router.patch("/notifications/read-all", verifyAccessToken,notificationController.markAllAsRead);
router.patch("/notifications/:id/read", verifyAccessToken,notificationController.markAsRead);
module.exports = router;