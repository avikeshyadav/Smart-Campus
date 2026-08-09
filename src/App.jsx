import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster,toast } from "react-hot-toast";

const Main_layout = lazy(() => import("./components/Main_layout"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ResetPassword = lazy(() => import("./pages/ForgetPassword"));
const DashboardRoutes = lazy(() =>import("./pages/dashboard/DashboardRoutes"));

const App = () => {
  const { accessToken, logout } = useAuth();
  const isLoggedIn = Boolean(accessToken);

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
          {/* Home Layout */}
          <Route path="/" element={ <Main_layout isLoggedIn={isLoggedIn} onLogout={logout}/> } />
          {/* Login */}
          <Route path="/login" element={ isLoggedIn ? <Navigate to="/dashboard"  replace />:<LoginPage />} />
          {/* Dashboard */}
          <Route path="/dashboard/*" element={ <DashboardRoutes />} />
          {/* Forgot Password */}
          <Route path="/forgetpassword"element={  <ResetPassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App; 