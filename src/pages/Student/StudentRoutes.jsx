import {
  lazy,
  Suspense,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedStudentLayer
  from "./ProtectedStudentLayer";

// Lazy load dashboard
const Studentdashboard = lazy(
  () => import("./StudentDashboard")
);

const StudentRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          Loading dashboard...
        </div>
      }
    >

      <Routes>
        {/* -------------------------
            PROTECTED STUDENT ROUTES
        -------------------------- */}
        <Route element={<ProtectedStudentLayer />}>
          {/* /student */}
          <Route index element={<Studentdashboard />}/>
          {/* Unknown student route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/student"
                replace
              />
            }
          />
        </Route>
      </Routes>

    </Suspense>
  );
};

export default StudentRoutes;