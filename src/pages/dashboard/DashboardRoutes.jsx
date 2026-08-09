import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedDashboardLayer from "./ProtectedDashboardLayer";

const DashboardPage = lazy(() => import("./DashboardPage"));
const StudentsPage = lazy(() => import("../dashboard/DashboardModule/StudentRecodManagement"));
const StudentViewPage = lazy(() => import("./students/StudentViewPage"));
const StudentEditPage = lazy(() => import("./students/StudentEditPage"));
const StudentSearchPage = lazy(() => import("./students/StudentSearchPage"));
const AddStudents = lazy(() => import("./students/components/liveAddFace"));
const ResumePage = lazy(() => import("./ResumePage"));
const SettingsPage = lazy(() => import("./Settings/SettingsPage"));
const ModulesSettings = lazy(()=> import("./Settings/Components"))
const AlertCenter = lazy(() => import("./AlertCenter/AlertCenter"));
const Permissions = lazy(() => import("./AccessControlBoard/index"));
const EditPermissionsPage = lazy(() => import("./AccessControlBoard/editPermissions"));
const UserProfilePage = lazy(()=> import('./Profile/Profile'));
const AttendanceOverview = lazy(()=>import("../dashboard/DashboardModule/AttendanceOverview"))
// =======================Academic Reports ==============
const AcademicReport = lazy(()=>import("../dashboard/DashboardModule/ReportAndAnalysis"));
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
      <Route index element={<DashboardPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="students/view" element={<StudentsPage />} />
      <Route path="students/edit" element={<StudentEditPage />} />
      <Route path="students/search" element={<StudentSearchPage />} />
      <Route path="students/add" element={<AddStudents />} />
      <Route path="resume" element={<ResumePage />} /> 
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/dashboardmenu" element={<ModulesSettings />} />
      <Route path="accesscontrolboard/" element={<Permissions />} />
      <Route path="accesscontrolboard/editPermissions" element={<EditPermissionsPage />} />
      <Route path="alertcenter" element={<AlertCenter />} />
      <Route path="/attendance" element={<AttendanceOverview />} />
      <Route path="/academic/reports" element={<AcademicReport />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default DashboardRoutes;
