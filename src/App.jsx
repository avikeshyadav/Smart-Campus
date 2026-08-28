import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

const Main_layout = lazy(() => import("./components/Main_layout"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ResetPassword = lazy(() => import("./pages/ForgetPassword"));
const DashboardRoutes = lazy(() =>import("./pages/dashboard/DashboardRoutes"));
const StudentDashboard = lazy(()=> import("./pages/Student/StudentDashboard"));
const StudentLogin = lazy(()=> import("./pages/Student/Studentlogin"));

const App = () => {
  const { accessToken, isLoading , logout} = useAuth();
  const isLoggedIn = Boolean(accessToken);
    if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            Loading...
          </div>
        }
      >
     <Toaster
        position="top-right"
        reverseOrder={false}
      />
        <Routes>
          <Route path="/" element={ <Main_layout isLoggedIn={isLoggedIn} onLogout={logout} /> } />
          <Route path="/login" element={ isLoggedIn ? <Navigate to="/dashboard"  replace />:<LoginPage />} />
          <Route path="/dashboard/*" element={ <DashboardRoutes />} />
          <Route path="/forgetpassword"element={  <ResetPassword />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/" element={ <StudentDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App; 