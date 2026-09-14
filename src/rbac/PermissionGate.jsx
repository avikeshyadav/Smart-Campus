import { useAuth } from "../context/AuthContext";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "./rbac";

const PermissionGate = ({
  permission,
  permissions = [],
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  let allowed = true;

  if (permission) {
    allowed = hasPermission(user, permission);
  }

  if (permissions.length) {
    allowed = requireAll
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);
  }

  return allowed ? children : fallback;
};

export default PermissionGate;
