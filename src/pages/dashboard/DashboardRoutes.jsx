import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedDashboardLayer from "./ProtectedDashboardLayer";
import DashboardShell from "./DashboardShell";
import ProtectedRoute from "../../rbac/ProtectedRoute";

const DashboardPage = lazy(() => import("./DashboardPage"));
const StudentsPage = lazy(() => import("./students/StudentsPage"));
const StudentSearchPage = lazy(() => import("./students/StudentSearchPage"));
const AddStudents = lazy(() => import("./students/AddStudents"));
const StudentViewPage = lazy(() => import("./students/StudentViewPage"));

const SettingsPage = lazy(() => import("./Settings/SettingsPage"));
const ModulesSettings = lazy(() => import("./Settings/Components"));
const Notifications = lazy(() => import("./Notifications"));
const UserProfilePage = lazy(() => import("./Profile/AdminProfilePage"));

const AcademicReport = lazy(() => import("../dashboard/DashboardModule/ReportAndAnalysis"));
const AttendanceOverview = lazy(() => import("../dashboard/DashboardModule/AttendanceOverview"));
const RealTimeAttendance = lazy(() => import("./AttendanceMonitor/index"));
const SystemOverview = lazy(() => import("./DeviceHealthPanel/SystemOverview"));

const RoomsPage = lazy(() => import("./Hostels/RoomsOverview"));
const StudentHostelFilter = lazy(() => import("./Hostels/StudentHostelFilter"));
const AddRoom = lazy(() => import("./Hostels/AddRoom"));
const RoomChanges = lazy(() => import("./Hostels/RoomChanges"));
const Residents = lazy(() => import("./Hostels/Residents"));
const HostelBeds = lazy(() => import("./Hostels/Beds"));
const Reports = lazy(() => import("./Hostels/Reports"));
const Notices = lazy(() => import("./Hostels/Notices/Notices"));

const AccessControlDashboard = lazy(() => import("./AccessControlBoard/AccessControlDashboard"));
const RolesPage = lazy(() => import("./AccessControlBoard/RolesPage"));
const PermissionsPage = lazy(() => import("./AccessControlBoard/PermissionsPage"));
const UserRoleAssignmentPage = lazy(() => import("./AccessControlBoard/UserRoleAssignmentPage"));
const RolePermissionMatrixPage = lazy(() => import("./AccessControlBoard/RolePermissionMatrixPage"));
const AccessDenied = lazy(() => import("../../rbac/AccessDenied"));

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
    Loading dashboard...
  </div>
);

const DashboardRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes> 
      <Route element={<ProtectedDashboardLayer />}>
        <Route element={<DashboardShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="device-health-panel" element={<SystemOverview />} />
          <Route path="access-denied" element={<AccessDenied />} />

          <Route element={<ProtectedRoute permission="students.view" />}>
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentViewPage />} />
            <Route path="students/search_via_id" element={<StudentViewPage />} />
            <Route path="students/search" element={<StudentSearchPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="students.create" />}>
            <Route path="students/add" element={<AddStudents />} />
          </Route>

          <Route element={<ProtectedRoute permission="settings.view" />}>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="settings.modules" />}>
            <Route path="settings/dashboardmenu" element={<ModulesSettings />} />
          </Route>

          <Route element={<ProtectedRoute permission="attendance.view" />}>
            <Route path="attendance" element={<AttendanceOverview />} />
          </Route>
          <Route element={<ProtectedRoute permission="attendance.live" />}>
            <Route path="attendance/liveTracker" element={<RealTimeAttendance />} />
          </Route>

          <Route element={<ProtectedRoute permission="reports.view" />}>
            <Route path="academic/reports" element={<AcademicReport />} />
            <Route path="hostels/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute permission="hostel.view" />}>
            <Route path="hostels" element={<RoomsPage />} />
            <Route path="hostels/filter" element={<StudentHostelFilter />} />
            <Route path="hostels/changerequests" element={<RoomChanges />} />
            <Route path="hostels/residents" element={<Residents />} />
            <Route path="hostels/beds" element={<HostelBeds />} />
          </Route>
          <Route element={<ProtectedRoute permission="hostel.create" />}>
            <Route path="hostels/add" element={<AddRoom />} />
          </Route>

          <Route element={<ProtectedRoute permission="hostel.notices.view" />}>
            <Route path="notices" element={<Notices />} />
          </Route>

          <Route element={<ProtectedRoute permission="notifications.view" />}>
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route element={<ProtectedRoute superAdminOnly />}>
            <Route path="accesscontrolboard" element={<AccessControlDashboard />} />
            <Route path="accesscontrolboard/roles" element={<RolesPage />} />
            <Route path="accesscontrolboard/permissions" element={<PermissionsPage />} />
            <Route path="accesscontrolboard/user-roles" element={<UserRoleAssignmentPage />} />
            <Route path="accesscontrolboard/role-permissions" element={<RolePermissionMatrixPage />} />
            <Route path="accesscontrolboard/editPermissions" element={<RolePermissionMatrixPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense> 
);

export default DashboardRoutes;
