import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedDashboardLayer from "./ProtectedDashboardLayer";
import DashboardShell from "./DashboardShell";
      
const DashboardPage = lazy(() => import("./DashboardPage"));
// ========  Student Managemen ==============================
const StudentsPage = lazy(() => import("./students/StudentsPage"));
// const StudentEditPage = lazy(() => import("./students/StudentEditPage"));
const StudentSearchPage = lazy(() => import("./students/StudentSearchPage"));
const AddStudents = lazy(() => import("./students/AddStudents"));
// =======================Resume Portal =======================
const ResumePage = lazy(() => import("./ResumePage"));
// =====================Settings========================
const SettingsPage = lazy(() => import("./Settings/SettingsPage"));
const ModulesSettings = lazy(()=> import("./Settings/Components"));
// ========================Alter Center ========================
const AlertCenter = lazy(() => import("./AlertCenter/AlertCenter")); 
const Notifications = lazy(()=> import("./Notifications"));
const Permissions = lazy(() => import("./AccessControlBoard/index"));
const EditPermissionsPage = lazy(() => import("./AccessControlBoard/editPermissions"));
const UserProfilePage = lazy(()=> import('./Profile/AdminProfilePage'));
// =======================Academic Reports ==============
const AcademicReport = lazy(()=>import("../dashboard/DashboardModule/ReportAndAnalysis"));
// ========================Attendance Monitoring ==========================
const AttendanceOverview = lazy(()=>import("../dashboard/DashboardModule/AttendanceOverview"))

const RealTimeAttendance = lazy(()=> import("./AttendanceMonitor/index"));
// ============================System Helth Panel ==================== 
const SystemOverview = lazy(()=> import("./DeviceHealthPanel/SystemOverview"))
// ============================Rooms Management ==========================
const RoomsPage = lazy(()=> import("./Hostels/RoomsOverview"))
const StudentHostelFilter = lazy(()=> import("./Hostels/StudentHostelFilter"))
const AddRoom = lazy(()=> import("./Hostels/AddRoom"))  
const RoomChanges = lazy(()=> import("./Hostels/RoomChanges"))
const Residents = lazy(()=> import("./Hostels/Residents"))
const beds = lazy(()=> import("./Hostels/Beds"))
const Reports = lazy(()=> import("./Hostels/Reports"))



const DashboardRoutes = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    }
  >
    <Routes>
      <Route element={<ProtectedDashboardLayer />}>
        {/* Dashboard layout mounts only once */}
     <Route element={<DashboardShell />}>
      <Route index element={<DashboardPage />} />
      <Route path="/profile" element={<UserProfilePage />} /> 
      <Route path="students" element={<StudentsPage />} />
      {/* <Route path="students/edit" element={<StudentEditPage />} /> */}
      <Route path="students/search" element={<StudentSearchPage />} />
      <Route path="students/add" element={<AddStudents />} />
      <Route path="resume" element={<ResumePage />} /> 
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/dashboardmenu" element={<ModulesSettings />} />
      <Route path="accesscontrolboard/" element={<Permissions />} />
      <Route path="accesscontrolboard/editPermissions" element={<EditPermissionsPage />} />
      <Route path="alertcenter" element={<AlertCenter />} />
      <Route path="notifications" element={ <Notifications />} />
      {/* ==============Attendance Routes */}
      <Route path="attendance" element={<AttendanceOverview />} />
      <Route path = "attendance/liveTracker" element = {<RealTimeAttendance />} />
      {/* //* ============== Academic routes ========================= */ }
      <Route path="academic/reports" element={<AcademicReport />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      {/* Rooms Routes */}
      <Route path="hostels" element={<RoomsPage />} />
      <Route path="hostels/filter" element={<StudentHostelFilter />} />
      <Route path="rooms/add" element={<AddRoom />} />
      <Route path="rooms/changerequests" element={<RoomChanges />} />
      <Route path="rooms/residents" element={<Residents />} />
      <Route path="rooms/beds" element={<beds />} />
      <Route path="rooms/reports" element={<Reports />} />

      {/* =========================System Health Panel ==================== */}
      <Route path="device-health-panel" element={<SystemOverview />} />
      </Route>
      </Route>
      
    </Routes>
  </Suspense>
);

export default DashboardRoutes;