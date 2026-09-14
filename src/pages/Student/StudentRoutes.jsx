import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedStudentLayer from "./ProtectedStudentLayer";
import StudentShell from "./StudentShell";

const StudentDashboard = lazy(() => import("./StudentDashboard"));
const Services = lazy(() => import("./Services/Services.jsx"));
const HostelDetails = lazy(() => import("./Hostel/HostelDetail.jsx"));
const Notices = lazy(() => import("./Hostel/Notice.jsx"));
const Attendance = lazy(() => import("./Attendance/Attendance"));

const StudentRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          Loading...
        </div>
      }
    >

      <Routes>

        <Route element={<ProtectedStudentLayer />}>

          <Route element={<StudentShell />}>

            {/* /student */}
            <Route index element={<StudentDashboard />} />
            {/* /student/service */}
            <Route path="attendance"element={<Attendance />}/>
            <Route path="notices"element={<Notices />}/>
            <Route path="hosteldetails"element={<HostelDetails />}/>
          </Route>

        </Route>

      </Routes>

    </Suspense>
  );
};

export default StudentRoutes;
