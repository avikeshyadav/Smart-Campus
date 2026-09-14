const express = require("express");
const dashboardController = require("../controllers/dashboardController")
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");
const moduleController = require("../controllers/moduleController");
const attendanceController = require("../controllers/AttendanceController");
const studentDashboardController = require("../controllers/StudentDashboardController");
const notificationController = require("../controllers/notificationController");
const ClubMemberController = require("../controllers/ClubMemberController");
const hostelController = require("../controllers/hostelController");
const verifyAccessToken = require("../middleware/auth.js");
const {authLimiter,generalLimiter} = require("../middleware/rateLimiter");
const verifyAccessTokenStudent = require("../middleware/studentAuth");
const { requirePermission, requireSuperAdmin } = require("../middleware/rbac.js");
const rbacController = require("../controllers/rbacController.js");

const router = express.Router();
// ==================== RBAC / ACCESS CONTROL ====================
router.get("/rbac/me", verifyAccessToken, rbacController.me);
router.get("/rbac/summary", verifyAccessToken, requireSuperAdmin, rbacController.summary);
router.get("/rbac/roles", verifyAccessToken, requireSuperAdmin, rbacController.listRoles);
router.post("/rbac/roles", verifyAccessToken, requireSuperAdmin, rbacController.createRole);
router.put("/rbac/roles/:id", verifyAccessToken, requireSuperAdmin, rbacController.updateRole);
router.delete("/rbac/roles/:id", verifyAccessToken, requireSuperAdmin, rbacController.deleteRole);
router.get("/rbac/permissions", verifyAccessToken, requireSuperAdmin, rbacController.listPermissions);
router.post("/rbac/permissions", verifyAccessToken, requireSuperAdmin, rbacController.createPermission);
router.put("/rbac/permissions/:id", verifyAccessToken, requireSuperAdmin, rbacController.updatePermission);
router.delete("/rbac/permissions/:id", verifyAccessToken, requireSuperAdmin, rbacController.deletePermission);
router.get("/rbac/users", verifyAccessToken, requireSuperAdmin, rbacController.listUsers);
router.get("/rbac/users/:id/roles", verifyAccessToken, requireSuperAdmin, rbacController.getUserRoles);
router.put("/rbac/users/:id/roles", verifyAccessToken, requireSuperAdmin, rbacController.assignUserRoles);
router.get("/rbac/roles/:id/permissions", verifyAccessToken, requireSuperAdmin, rbacController.getRolePermissions);
router.put("/rbac/roles/:id/permissions", verifyAccessToken, requireSuperAdmin, rbacController.assignRolePermissions);
    
//------------------USER Auth Routes ----------------
router.get("/captcha",generalLimiter,authController.captcha);
router.post("/register",authLimiter, authController.register); 
router.post("/login",authLimiter, authController.login);
router.get('/logout',authLimiter,authController.logout);
router.post("/refresh",authLimiter, authController.refresh);
router.post("/forgetpassword",authLimiter,authController.forgotPassword);
router.post("/login/2fa", authLimiter,authController.verifyLoginTwoFactor);
router.get("/verify-email",authLimiter,authController.verifyAccount);

// ====================Admin Profile Manages =========================
router.get("/admin/profile",verifyAccessToken,requirePermission("settings.view"),authLimiter,authController.getFullProfile);
router.put("/admin/profile",verifyAccessToken,requirePermission("settings.manage"),authController.updatePersonalInfo);
router.post("/admin/profile/change_password",verifyAccessToken,requirePermission("settings.manage"),authController.changePassword);
router.post("/login/2fa",authController.verifyLoginTwoFactor);
router.post("/admin/profile/2fa",verifyAccessToken,requirePermission("settings.manage"),authController.twoFactor);
router.post("/admin/profile/2fa/verify",verifyAccessToken,requirePermission("settings.manage"),authController.verifyTwoFactorSetup);

//--------------------STUDENTS CONTROLLER ---------------
router.get("/students/count",verifyAccessToken,requirePermission("students.view"),studentController.countStudents);
router.get("/students", verifyAccessToken,requirePermission("students.view"),studentController.viewStudents);
router.post("/students",verifyAccessToken,requirePermission("students.create"),studentController.addStudent);
router.get("/students/search",verifyAccessToken,requirePermission("students.search"), studentController.searchStudents);
router.get( "/students/:id", verifyAccessToken,requirePermission("students.view"), studentController.getStudentById);
router.put("/students/:id",verifyAccessToken,requirePermission("students.update"), studentController.updateStudent);
router.patch("/students/:id/status",verifyAccessToken,requirePermission("students.update"),studentController.updateStudentStatus);
router.delete("/students/:id", verifyAccessToken,requirePermission("students.delete"),studentController.deleteStudent);
// ===============================
// Dashboard Modules API
// ===============================
router.get("/dashboard/dashboardData",verifyAccessToken, dashboardController.getDashboardData);
router.get("/dashboard/modules",verifyAccessToken,requirePermission("modules.view"), moduleController.getModules);
router.post("/dashboard/modules",verifyAccessToken,requirePermission("modules.add"), moduleController.addModule);
router.put("/dashboard/modules/:id", verifyAccessToken,requirePermission("modules.update"),moduleController.updateModule);
router.put("/dashboard/modules/:id/status",verifyAccessToken,requirePermission("modules.update.status"),moduleController.updateModuleStatus);
router.delete("/dashboard/modules/:id",verifyAccessToken,requirePermission("modules.delete"),moduleController.deleteModule);
router.put("/dashboard/modules/:id/order",verifyAccessToken,requirePermission("modules.change.order"), moduleController.changeModuleOrder);

// ======================= Attendance APIs ====================================================
router.get("/attendance",verifyAccessToken,requirePermission("attendance.view"),attendanceController.getAttendance);
router.post("/attendance",verifyAccessToken,requirePermission("attendance.create"), attendanceController.PostAttendance);

// ===================Student Dashboard Routes ===================
router.post("/student/login",studentDashboardController.login);
router.post("/student/register",studentDashboardController.register);
router.post("/student/logout",verifyAccessTokenStudent,studentDashboardController.logout);
router.get("/student/studentdashboard/notices",verifyAccessTokenStudent,studentDashboardController.GetStudentNotices);
router.get("/student/studentdashboard/hosteldetail",verifyAccessTokenStudent,studentDashboardController.HostelDetail);
router.get("/student/studentdashboard/attendance",verifyAccessTokenStudent,studentDashboardController.GetStudentAttendance);
router.get("/student/studentdashboard/dashboarddata",verifyAccessTokenStudent,studentDashboardController.getDashboardData);
// ====================== Notification Routes ======================
router.get("/notifications",verifyAccessToken,requirePermission("notifications.view"), notificationController.getNotifications);
router.get("/notifications/all",verifyAccessToken,requirePermission("notifications.view"), notificationController.getAllNotifications);
router.get("/notifications/unread-count",verifyAccessToken,requirePermission("notifications.view"), notificationController.getUnreadCount);
router.patch("/notifications/read-all", verifyAccessToken,requirePermission("notifications.manage"),notificationController.markAllAsRead);
router.patch("/notifications/:id/read", verifyAccessToken,requirePermission("notifications.manage"),notificationController.markAsRead);
router.delete("/notifications/:id",verifyAccessToken,requirePermission("notifications.manage"), notificationController.deleteNotification);
// ======================AddClubMembers======================================
router.post("/members/register", ClubMemberController.addMember);

// ====================== Hostel / Rooms Routes ======================

// Overview
router.get("/hostel/overview", verifyAccessToken,requirePermission("hostel.view"), hostelController.overview);

// Hostels
router.get("/hostel/hostels",verifyAccessToken,requirePermission("hostel.view"), hostelController.hostels);
router.get("/hostel/hostels/:id",verifyAccessToken,requirePermission("hostel.view"),hostelController.hostel);
router.post("/hostel/hostels",verifyAccessToken,requirePermission("hostel.create"),hostelController.createHostel);
router.put("/hostel/hostels/:id",verifyAccessToken,requirePermission("hostel.update"),hostelController.updateHostel);
router.delete("/hostel/hostels/:id",verifyAccessToken,requirePermission("hostel.delete"),hostelController.deleteHostel);

// Floors
router.get("/hostel/floors",verifyAccessToken,requirePermission("hostel.view"),hostelController.floors);
router.post("/hostel/floors",verifyAccessToken,requirePermission("hostel.create"),hostelController.createFloor);
router.put("/hostel/floors/:id",verifyAccessToken,requirePermission("hostel.update"),hostelController.updateFloor);
router.delete("/hostel/floors/:id",verifyAccessToken,requirePermission("hostel.delete"),hostelController.deleteFloor);

// Rooms
router.get("/hostel/rooms",verifyAccessToken,requirePermission("hostel.rooms.view"),hostelController.rooms);
router.get("/hostel/rooms/:id",verifyAccessToken,requirePermission("hostel.rooms.view"),hostelController.room);
router.post("/hostel/rooms",verifyAccessToken,requirePermission("hostel.rooms.create"),hostelController.createRoom);
router.put("/hostel/rooms/:id",verifyAccessToken,requirePermission("hostel.rooms.update"),hostelController.updateRoom);
router.delete("/hostel/rooms/:id",verifyAccessToken,requirePermission("hostel.rooms.delete"),hostelController.deleteRoom);
router.get("/hostel/rooms/:id/beds",verifyAccessToken,requirePermission("hostel.rooms.view"),hostelController.roomBeds);
//Hostel Notices Create Update Delete Get
router.get("/hostel/notices", verifyAccessToken,requirePermission("hostel.notices.view"), hostelController.GetNotices);
router.post("/hostel/notices", verifyAccessToken,requirePermission("hostel.notices.create"), hostelController.PostNotices);
router.get("/hostel/notices/:id", verifyAccessToken,requirePermission("hostel.notices.view"), hostelController.GetSingleNotice);
router.put("/hostel/notices/:id", verifyAccessToken,requirePermission("hostel.notices.update"), hostelController.UpdateNotice);
router.delete("/hostel/notices/:id", verifyAccessToken,requirePermission("hostel.notices.delete"), hostelController.DeleteNotice);

// Beds
router.get("/hostel/beds",verifyAccessToken,requirePermission("hostel.rooms.view"),hostelController.beds);

// Students / allocation
router.get("/hostel/available-students",verifyAccessToken,requirePermission("hostel.allocations.view"),hostelController.availableStudents);
router.get("/hostel/residents",verifyAccessToken,requirePermission("hostel.allocations.view"),hostelController.residents);
router.post("/hostel/allocations",verifyAccessToken,requirePermission("hostel.allocations.create"),hostelController.allocate);
router.patch("/hostel/allocations/:id/vacate",verifyAccessToken,requirePermission("hostel.allocations.vacate"),hostelController.vacate);

// Room changes
router.get("/hostel/room-changes",verifyAccessToken,requirePermission("hostel.allocations.view"),hostelController.changes);
router.post("/hostel/room-changes",verifyAccessToken,requirePermission("hostel.allocations.create"),hostelController.createChange);
router.patch("/hostel/room-changes/:id/process",verifyAccessToken,requirePermission("hostel.allocations.update"),hostelController.processChange);

// Maintenance
router.get("/hostel/maintenance",verifyAccessToken,requirePermission("hostel.maintenance.view"),hostelController.maintenance);
router.post("/hostel/maintenance",verifyAccessToken,requirePermission("hostel.maintenance.create"),hostelController.createMaintenance);
router.patch("/hostel/maintenance/:id",verifyAccessToken,requirePermission("hostel.maintenance.update"),hostelController.updateMaintenance);

module.exports = router;
