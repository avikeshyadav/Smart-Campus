import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState } from "react";

const ProtectedDashboardLayer = () => {
  const { accessToken, tryRefresh } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  // Prevent duplicate refresh calls
  const refreshStarted = useRef(false);
  useEffect(() => {
    let cancelled = false;

    const checkAuthentication = async () => {
      // Access token already available
      if (accessToken) {
        if (!cancelled) {
          setCheckingAuth(false);
        }

        return;
      }

      // Prevent duplicate refresh request
      if (refreshStarted.current) {
        return;
      }
      refreshStarted.current = true;
      try {
        const newToken = await tryRefresh()
        if (!cancelled) {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "❌ Dashboard refresh error:",
          error
        );

        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    };
    checkAuthentication();
    return () => {
      cancelled = true;
    };
  }, [accessToken, tryRefresh]);

  // Authentication check chal raha hai
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    );
  }

  // Refresh fail
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  // Authenticated
  return <Outlet />;
};

export default ProtectedDashboardLayer;