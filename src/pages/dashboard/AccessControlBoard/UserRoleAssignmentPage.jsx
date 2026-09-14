import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { assignUserRoles, getRbacUsers, getRoles, getUserRoles } from "../../../rbac/rbacApi";
import PermissionGate from "../../../rbac/PermissionGate";

const UserRoleAssignmentPage = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        getRbacUsers(accessToken),
        getRoles(accessToken),
      ]);
      const userList = usersResponse?.users || usersResponse || [];
      const roleList = rolesResponse?.roles || rolesResponse || [];
      setUsers(Array.isArray(userList) ? userList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
    } catch (error) {
      console.error("Load users/roles error:", error);
      toast.error(error.message || "Unable to load users and roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [accessToken]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.name, user.email, user.job_title, user.role_slugs, user.roles]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const selectUser = async (user) => {
    if (!user?.id || !accessToken) return;
    try {
      setSelectedUser(user);
      setLoadingRoles(true);
      setSelectedRoles([]);
      const response = await getUserRoles(accessToken, user.id);
      const assignedRoles = response?.roles || response || [];
      setSelectedRoles(
        Array.isArray(assignedRoles) ? assignedRoles.map((role) => Number(role.id)) : []
      );
    } catch (error) {
      console.error("Load user roles error:", error);
      toast.error(error.message || "Unable to load user roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const toggleRole = (roleId) => {
    const id = Number(roleId);
    setSelectedRoles((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const save = async () => {
    if (!selectedUser?.id || !accessToken) {
      toast.error("Please select a user first");
      return;
    }
    try {
      setSaving(true);
      await assignUserRoles(accessToken, selectedUser.id, selectedRoles);
      toast.success("User roles updated successfully");
      await load();
    } catch (error) {
      console.error("Assign user roles error:", error);
      toast.error(error.message || "Unable to assign roles");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate
      permission="users.roles.assign"
      fallback={
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          You do not have permission to assign roles.
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Assign User Roles</h1>
            <p className="mt-1 text-sm text-slate-400">
              Assign one or multiple roles to a user.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            title="Refresh users and roles"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(300px,1fr)_minmax(420px,1.2fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{filteredUsers.length} users</span>
                {selectedUser && <span className="text-cyan-400">Selected: {selectedUser.name || "User"}</span>}
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center text-slate-500">
                  <RefreshCw size={22} className="animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users size={36} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className={`w-full border-b border-slate-800 p-4 text-left transition last:border-b-0 ${
                        isSelected ? "bg-cyan-500/10" : "hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2 ${isSelected ? "bg-cyan-500/15 text-cyan-400" : "bg-slate-800 text-slate-300"}`}>
                          <Users size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{user.name || "Unnamed User"}</p>
                          <p className="truncate text-xs text-slate-500">{user.email || "No email"}</p>
                          {user.job_title && <p className="mt-1 truncate text-xs text-slate-600">{user.job_title}</p>}
                        </div>
                        {isSelected && <Check size={18} className="shrink-0 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            {!selectedUser ? (
              <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-slate-800 p-4">
                  <ShieldCheck className="text-slate-500" size={42} />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-300">Select a user</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Choose a user from the list to view and manage their assigned roles.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400"><ShieldCheck size={22} /></div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{selectedUser.name || "Unnamed User"}</p>
                      <p className="truncate text-xs text-slate-500">{selectedUser.email || "No email"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white">Available Roles</h2>
                    <p className="mt-1 text-xs text-slate-500">Select the roles this user should have.</p>
                  </div>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                    {selectedRoles.length} selected
                  </span>
                </div>

                {loadingRoles ? (
                  <div className="flex min-h-[300px] items-center justify-center text-slate-500">
                    <RefreshCw size={22} className="animate-spin" />
                  </div>
                ) : roles.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-500">
                    No roles available.
                  </div>
                ) : (
                  <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                    {roles.map((role) => {
                      const roleId = Number(role.id);
                      const checked = selectedRoles.includes(roleId);
                      const isSuperAdmin = role.slug === "super_admin";
                      return (
                        <label
                          key={role.id}
                          className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ${
                            checked ? "border-cyan-500/40 bg-cyan-500/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-white">{role.name}</p>
                              {isSuperAdmin && (
                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                                  Full Access
                                </span>
                              )}
                            </div>
                            <p className="mt-1 font-mono text-xs text-slate-500">{role.slug}</p>
                            {role.description && <p className="mt-1 text-xs text-slate-600">{role.description}</p>}
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRole(roleId)}
                            className="h-4 w-4 shrink-0 accent-cyan-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={save}
                  disabled={saving || loadingRoles}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <><RefreshCw size={17} className="animate-spin" /> Saving...</> : <><Check size={17} /> Save Role Assignment</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default UserRoleAssignmentPage;
