import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { getRbacSummary } from "../../../rbac/rbacApi";

const cards = [
  ["Roles", "Create, edit and manage custom roles.", "/dashboard/accesscontrolboard/roles", LockKeyhole],
  ["Permissions", "Create granular module/action permissions.", "/dashboard/accesscontrolboard/permissions", KeyRound],
  ["User Roles", "Assign one or multiple roles to users.", "/dashboard/accesscontrolboard/user-roles", Users],
  ["Role Permissions", "Configure permissions for each role.", "/dashboard/accesscontrolboard/role-permissions", ShieldCheck],
];

const AccessControlDashboard = () => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getRbacSummary(accessToken);
      setSummary(data?.summary || data || {});
    } catch (error) {
      toast.error(error.message || "Unable to load RBAC summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [accessToken]);

  const roleNames = Array.isArray(user?.roles)
    ? user.roles.map((role) => role.name).join(", ")
    : user?.role || "No role";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Security Center</p>
                <h1 className="text-2xl font-bold text-white">Access Control</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
              Super Admin can manage roles, permissions and user assignments from one place.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                Current role: {roleNames}
              </span>
              {user?.isSuperAdmin && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                  Full Access
                </span>
              )}
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white hover:border-cyan-500 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ["Users", summary.users ?? 0, Users],
          ["Roles", summary.roles ?? 0, LockKeyhole],
          ["Permissions", summary.permissions ?? 0, KeyRound],
          ["Super Admins", summary.superAdmins ?? 0, ShieldCheck],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Icon className="text-cyan-400" size={22} />
            <p className="mt-3 text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map(([title, description, path, Icon]) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left hover:border-cyan-500/40"
          >
            <div className="flex items-center justify-between">
              <Icon className="text-cyan-400" size={23} />
              <ArrowRight size={17} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
            </div>
            <h2 className="mt-5 font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccessControlDashboard;
