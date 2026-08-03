import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const DashboardPage = lazy(() => import("./DashboardPage"));
const StudentsPage = lazy(() => import("./students/StudentsPage"));
const StudentViewPage = lazy(() => import("./students/StudentViewPage"));
const StudentEditPage = lazy(() => import("./students/StudentEditPage"));
const StudentSearchPage = lazy(() => import("./students/StudentSearchPage"));
// const StudentMorePage = lazy(() => import("./students/StudentMorePage"));
const AddStudents = lazy(() => import("./students/AddStudents"));
const ResumePage = lazy(() => import("./ResumePage"));
const SettingsPage = lazy(() => import("./SettingsPage"));

const AlertCenter = lazy(() => import("./AlertCenter/AlertCenter"));
const Permissions = lazy(() => import("./AccessControlBoard/index"));
const EditPermissionsPage = lazy(() => import("./AccessControlBoard/editPermissions"));

const DashboardRoutes = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    }
  >
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="students/view" element={<StudentViewPage />} />
      <Route path="students/edit" element={<StudentEditPage />} />
      <Route path="students/search" element={<StudentSearchPage />} />
      <Route path="students/add" element={<AddStudents />} />
      <Route path="resume" element={<ResumePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="accesscontrolboard/" element={<Permissions />} />
      <Route path="accesscontrolboard/editPermissions" element={<EditPermissionsPage />} />
      <Route path="alertcenter" element={<AlertCenter />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default DashboardRoutes;
