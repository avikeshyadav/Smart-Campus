export const SUPER_ADMIN_SLUG = "super_admin";

export const isSuperAdmin = (user) => {
  if (user?.isSuperAdmin === true) return true;

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some(
    (role) =>
      role?.slug === SUPER_ADMIN_SLUG ||
      role?.role_slug === SUPER_ADMIN_SLUG
  );
};

export const getUserPermissions = (user) => {
  if (Array.isArray(user?.permissions)) return user.permissions;

  if (Array.isArray(user?.permissions?.items)) {
    return user.permissions.items;
  }

  return [];
};

export const hasPermission = (user, permission) => {
  if (!permission) return true;
  if (isSuperAdmin(user)) return true;

  return getUserPermissions(user).some((item) =>
    typeof item === "string"
      ? item === permission
      : item?.slug === permission
  );
};

export const hasAnyPermission = (user, permissions = []) =>
  isSuperAdmin(user) || permissions.some((p) => hasPermission(user, p));

export const hasAllPermissions = (user, permissions = []) =>
  isSuperAdmin(user) || permissions.every((p) => hasPermission(user, p));
