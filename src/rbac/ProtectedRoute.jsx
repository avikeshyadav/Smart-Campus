import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAllPermissions, hasAnyPermission, hasPermission, isSuperAdmin } from "./rbac";

const ProtectedRoute = ({
  permission,
  permissions = [],
  requireAll = false,
  superAdminOnly = false,
}) => {
  const { accessToken, user } = useAuth();
  const location = useLocation();

  if (!accessToken) {
    return (<Navigate  to="/login" replace state={{ from: location.pathname }}/>);}
  if (superAdminOnly && !isSuperAdmin(user)) { return <Navigate to="/dashboard/access-denied" replace />;}
  if (permission) {
    const result = hasPermission(user, permission);
    if (!result) {
      console.log( "❌ ACCESS DENIED:",    permission);
      return (
        <Navigate
          to="/dashboard/access-denied"
          replace
        />
      );
    }
  }

  if (permissions.length) {
    const allowed = requireAll
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);

    if (!allowed) {
      console.log("❌ ACCESS DENIED:", permissions);
      return (
        <Navigate to="/dashboard/access-denied"  replace />
      );
    }
  }

  console.log("✅ ACCESS ALLOWED");

  return <Outlet />;
};

export default ProtectedRoute;
