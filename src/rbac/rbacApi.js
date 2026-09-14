import { BASE_URI } from "../config/api";

const API_ROOT = `${BASE_URI}/api/rbac`;

const request = async (accessToken, path, options = {}) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });
 
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.message || `RBAC request failed (${response.status})`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }
console.log(data)
  return data;
};

export const getRbacMe = (token) => request(token, "/me");
export const getRbacSummary = (token) => request(token, "/summary");

export const getRoles = (token) => request(token, "/roles");
export const createRole = (token, body) =>
  request(token, "/roles", { method: "POST", body: JSON.stringify(body) });
export const updateRole = (token, id, body) =>
  request(token, `/roles/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteRole = (token, id) =>
  request(token, `/roles/${id}`, { method: "DELETE" });

export const getPermissions = (token) => request(token, "/permissions");
export const createPermission = (token, body) =>
  request(token, "/permissions", { method: "POST", body: JSON.stringify(body) });
export const updatePermission = (token, id, body) =>
  request(token, `/permissions/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deletePermission = (token, id) =>
  request(token, `/permissions/${id}`, { method: "DELETE" });

export const getRbacUsers = (token) => request(token, "/users"); 
export const getUserRoles = (token, userId) =>
  request(token, `/users/${userId}/roles`);
export const assignUserRoles = (token, userId, roleIds) =>
  request(token, `/users/${userId}/roles`, {
    method: "PUT",
    body: JSON.stringify({ roleIds }),
  });

export const getRolePermissions = (token, roleId) =>
  request(token, `/roles/${roleId}/permissions`);
export const assignRolePermissions = (token, roleId, permissionIds) =>
  request(token, `/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionIds }),
  });
