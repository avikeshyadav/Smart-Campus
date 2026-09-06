const express = require("express");
const authController = require("../controllers/authController.js");
const studentController = require("../controllers/studentController.js");
const moduleController = require("../controllers/moduleController.js");
const developerController = require("../controllers/DevelopreContoller.js");
const attendanceController = require("../controllers/AttendanceController.js");
const studentDashboardController = require("../controllers/StudentDashboardController.js");
const notificationController = require("../controllers/notificationController.js");
const ClubMemberController = require("../controllers/ClubMemberController");
const hostelController = require("../controllers/hostelController.js");
const verifyAccessToken = require("../middleware/auth.js");
const {authLimiter,generalLimiter} = require("../middleware/rateLimiter");
const verifyAccessTokenStudent = require("../middleware/studentAuth");

const router = express.Router();
//------------------USER Auth Routes ----------------
router.get("/captcha",generalLimiter,authController.captcha);
router.post("/register",authLimiter,authController.register);
router.post("/login",authLimiter, authController.login);
router.get('/logout',authLimiter,authController.logout);
router.post("/refresh",authLimiter, authController.refresh);
router.post("/forgetpassword",authLimiter,authController.forgotPassword);
router.post("/login/2fa", authLimiter,authController.verifyLoginTwoFactor);
router.get("/verify-email",authLimiter,authController.verifyAccount);

// ====================Admin Profile Manages =========================
router.get("/admin/profile",verifyAccessToken,authLimiter,authController.getFullProfile);
router.put("/admin/profile",verifyAccessToken,authController.updatePersonalInfo);
router.post("/admin/profile/change_password",verifyAccessToken,authController.changePassword);
router.post("/login/2fa",authController.verifyLoginTwoFactor);
router.post("/admin/profile/2fa",verifyAccessToken,authController.twoFactor);
router.post("/admin/profile/2fa/verify",verifyAccessToken,authController.verifyTwoFactorSetup);

//--------------------STUDENTS CONTROLLER ---------------
router.get("/students/count",verifyAccessToken,studentController.countStudents);
router.get("/students", verifyAccessToken,studentController.viewStudents);
router.post("/students",verifyAccessToken,studentController.addStudent);
router.get("/students/search",verifyAccessToken, studentController.searchStudents);
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
router.put("/dashboard/modules/:id/order",verifyAccessToken, moduleController.changeModuleOrder);
// ================================== Developer APIs ==========================================
router.post("/developer",verifyAccessToken, developerController.getDeveloper);
router.get("/developer", developerController.FetchDevelopers);
// ======================= Attendance APIs ====================================================
router.get("/attendance/",attendanceController.getAttendance);
router.post("/attendance", attendanceController.PostAttendance);

// ===================Student Dashboard Routes ===================
router.post("/student/login",studentDashboardController.login);
router.post("/student/register",studentDashboardController.register);
router.post("/student/logout",verifyAccessTokenStudent,studentDashboardController.logout);
// ====================== Notification Routes ======================
router.get("/notifications",verifyAccessToken, notificationController.getNotifications);
router.get("/notifications/all",verifyAccessToken, notificationController.getAllNotifications);
router.get("/notifications/unread-count",verifyAccessToken, notificationController.getUnreadCount);
router.patch("/notifications/read-all", verifyAccessToken,notificationController.markAllAsRead);
router.patch("/notifications/:id/read", verifyAccessToken,notificationController.markAsRead);
router.delete("/notifications/:id",verifyAccessToken, notificationController.deleteNotification);
// ======================AddClubMembers======================================
router.post("/members/register", ClubMemberController.addMember);

// ====================== Hostel / Rooms Routes ======================

// Overview
router.get("/hostel/overview", hostelController.overview);

// Hostels
router.get("/hostel/hostels",verifyAccessToken, hostelController.hostels);
router.get("/hostel/hostels/:id",verifyAccessToken ,hostelController.hostel);
router.post("/hostel/hostels",verifyAccessToken ,hostelController.createHostel);
router.put("/hostel/hostels/:id",verifyAccessToken ,hostelController.updateHostel);
router.delete("/hostel/hostels/:id",verifyAccessToken ,hostelController.deleteHostel);

// Floors
router.get("/hostel/floors",verifyAccessToken ,hostelController.floors);
router.post("/hostel/floors",verifyAccessToken ,hostelController.createFloor);
router.put("/hostel/floors/:id",verifyAccessToken ,hostelController.updateFloor);
router.delete("/hostel/floors/:id",verifyAccessToken ,hostelController.deleteFloor);

// Rooms
router.get("/hostel/rooms",verifyAccessToken ,hostelController.rooms);
router.get("/hostel/rooms/:id",verifyAccessToken ,hostelController.room);
router.post("/hostel/rooms",verifyAccessToken ,hostelController.createRoom);
router.put("/hostel/rooms/:id",verifyAccessToken ,hostelController.updateRoom);
router.delete("/hostel/rooms/:id",verifyAccessToken ,hostelController.deleteRoom);
router.get("/hostel/rooms/:id/beds",verifyAccessToken ,hostelController.roomBeds);

// Beds
router.get("/hostel/beds",verifyAccessToken ,hostelController.beds);

// Students / allocation
router.get("/hostel/available-students",verifyAccessToken ,hostelController.availableStudents);
router.get("/hostel/residents",verifyAccessToken ,hostelController.residents);
router.post("/hostel/allocations",verifyAccessToken ,hostelController.allocate);
router.patch("/hostel/allocations/:id/vacate",verifyAccessToken ,hostelController.vacate);

// Room changes
router.get("/hostel/room-changes",verifyAccessToken ,hostelController.changes);
router.post("/hostel/room-changes",verifyAccessToken ,hostelController.createChange);
router.patch("/hostel/room-changes/:id/process",verifyAccessToken ,hostelController.processChange);

// Maintenance
router.get("/hostel/maintenance",verifyAccessToken ,hostelController.maintenance);
router.post("/hostel/maintenance",verifyAccessToken ,hostelController.createMaintenance);
router.patch("/hostel/maintenance/:id",verifyAccessToken ,hostelController.updateMaintenance);

module.exports = router;