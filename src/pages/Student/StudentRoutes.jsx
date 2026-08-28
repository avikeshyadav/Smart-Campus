import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedStudentLayer from "./ProtectedStudentLayer";
const Studentdashboard = lazy(() => import("./StudentDashboard"));
const StudentRoutes = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div> 
    }
  >
    <Routes>
  <Route element={<ProtectedStudentLayer />}>
      <Route index element={<Studentdashboard />} />
      <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default StudentRoutes;
 