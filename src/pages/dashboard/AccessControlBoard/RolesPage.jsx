import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCw, Search, Shield, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { createRole, deleteRole, getRoles, updateRole } from "../../../rbac/rbacApi";
import PermissionGate from "../../../rbac/PermissionGate";

const emptyForm = { name: "", slug: "", description: "", is_active: true };

const RolesPage = () => {
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getRoles(accessToken);
      setRoles(data?.roles || data || []);
    } catch (e) {
      toast.error(e.message || "Unable to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [accessToken]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return roles;
    return roles.filter((r) =>
      [r.name, r.slug, r.description].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [roles, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditing(role);

    setForm({
      name: role.name || "",
      slug: role.slug || "",
      description: role.description || "",
      is_active: role.is_active !== false,
    });

    setShowModal(true);
  };
  const save = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      return toast.error("Role name and slug are required");
    }

    try {
      setSaving(true);

      if (editing) {
        await updateRole(accessToken, editing.id, {
          ...form,
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
        });

        toast.success("Role updated successfully");
      } else {
        await createRole(accessToken, {
          ...form,
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
        });

        toast.success("Role created successfully");
      }

      close();
      await load();

    } catch (e) {
      console.error("Role save error:", e);
      toast.error(e.message || "Unable to save role");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (role) => {
    if (role.is_system_role || role.slug === "super_admin") {
      return toast.error("System roles cannot be deleted");
    }
    if (!window.confirm(`Delete role "${role.name}"?`)) return;

    try {
      await deleteRole(accessToken, role.id);
      toast.success("Role deleted");
      load();
    } catch (e) {
      toast.error(e.message || "Unable to delete role");
    }
  };

  const close = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles Management</h1>
          <p className="mt-1 text-sm text-slate-400">Create and maintain custom RBAC roles.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-300">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <PermissionGate permission="roles.create">
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">
              <Plus size={18} /> Add Role
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-left text-slate-400">
              <tr><th className="px-5 py-4">Role</th><th className="px-5 py-4">Slug</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((role) => (
                <tr key={role.id} className="border-b border-slate-800/80">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Shield size={17} className="text-cyan-400" /><div><p className="font-medium text-white">{role.name}</p><p className="text-xs text-slate-500">{role.description || "No description"}</p></div></div></td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-300">{role.slug}</td>
                  <td className="px-5 py-4 text-slate-300">{role.is_system_role ? "System" : "Custom"}</td>
                  <td className={`px-5 py-4 ${role.is_active === false ? "text-red-400" : "text-emerald-400"}`}>{role.is_active === false ? "Inactive" : "Active"}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">
                    <PermissionGate permission="roles.update"><button onClick={() => openEdit(role)} className="rounded-lg border border-slate-700 p-2 text-slate-300"><Edit3 size={16}/></button></PermissionGate>
                    <PermissionGate permission="roles.delete"><button onClick={() => remove(role)} className="rounded-lg border border-slate-700 p-2 text-red-400"><Trash2 size={16}/></button></PermissionGate>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No roles found.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={save} className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">{editing ? "Edit Role" : "Create Role"}</h2><button type="button" onClick={close}><X className="text-slate-400"/></button></div>
            <div className="mt-5 space-y-4">
              {[
                ["name","Role Name","Hostel Manager"],
                ["slug","Role Slug","hostel_manager"],
                ["description","Description","Role description"],
              ].map(([key,label,placeholder]) => (
                <div key={key}><label className="mb-2 block text-sm text-slate-300">{label}</label><input value={form[key]} onChange={(e)=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"/></div>
              ))}
              <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={form.is_active} onChange={(e)=>setForm(p=>({...p,is_active:e.target.checked}))}/> Active role</label>
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{editing ? "Update Role" : "Create Role"}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
