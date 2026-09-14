import { useEffect, useMemo, useState } from "react";
import { Edit3, KeyRound, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { createPermission, deletePermission, getPermissions, updatePermission } from "../../../rbac/rbacApi";
import PermissionGate from "../../../rbac/PermissionGate";

const emptyForm = { name: "", slug: "", module: "", action: "", description: "" };

const PermissionsPage = () => {
  const { accessToken } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPermissions(accessToken);
      setPermissions(data?.permissions || data || []);
    } catch (e) { toast.error(e.message || "Unable to load permissions"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [accessToken]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return permissions;
    return permissions.filter((p) => [p.name,p.slug,p.module,p.action,p.description].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [permissions, search]);

  const save = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await updatePermission(
          accessToken,
          editing.id,
          form
        );

        toast.success("Permission updated");
      } else {
        await createPermission(
          accessToken,
          form
        );

        toast.success("Permission created");
      }

      closeModal();
      await load();

    } catch (e) {
      toast.error(
        e.message || "Unable to save permission"
      );
    }
  };

  const remove = async (permission) => {
    if (!window.confirm(`Delete "${permission.name}"?`)) return;
    try { await deletePermission(accessToken, permission.id); toast.success("Permission deleted"); load(); }
    catch (e) { toast.error(e.message || "Unable to delete permission"); }
  };
  const closeModal = () => {
  setEditing(null);
  setForm({ ...emptyForm });
  setShowModal(false);
};

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-2xl font-bold text-white">Permissions Management</h1><p className="mt-1 text-sm text-slate-400">Manage granular module and action permissions.</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-300"><RefreshCw size={18} className={loading ? "animate-spin" : ""}/></button>
          <PermissionGate permission="permissions.manage">
          <button
            onClick={() => {
              setEditing(null);
              setForm({ ...emptyForm });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            <Plus size={18} />
            Add Permission
          </button>
        </PermissionGate>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search permission..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none"/></div></div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="border-b border-slate-800 bg-slate-950/70 text-left text-slate-400"><tr><th className="px-5 py-4">Permission</th><th className="px-5 py-4">Module</th><th className="px-5 py-4">Action</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{filtered.map((p)=><tr key={p.id} className="border-b border-slate-800/80"><td className="px-5 py-4"><div className="flex items-center gap-3"><KeyRound size={17} className="text-cyan-400"/><div><p className="font-medium text-white">{p.name}</p><p className="font-mono text-xs text-slate-500">{p.slug}</p></div></div></td><td className="px-5 py-4 text-slate-300">{p.module}</td><td className="px-5 py-4 text-slate-300">{p.action}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><PermissionGate permission="permissions.manage"><button onClick={()=>{setEditing(p);setForm({name:p.name||"",slug:p.slug||"",module:p.module||"",action:p.action||"",description:p.description||""});setShowModal(true);}} className="rounded-lg border border-slate-700 p-2 text-slate-300"><Edit3 size={16}/></button><button onClick={()=>remove(p)} className="rounded-lg border border-slate-700 p-2 text-red-400"><Trash2 size={16}/></button></PermissionGate></div></td></tr>)}</tbody></table></div>{!loading&&!filtered.length&&<div className="p-10 text-center text-sm text-slate-500">No permissions found.</div>}</div>

     {showModal &&  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"><form onSubmit={save} className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">{editing?"Edit Permission":"Create Permission"}</h2><button type="button"  onClick={closeModal}><X className="text-slate-400"/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["name","Name","Students View"],["slug","Slug","students.view"],["module","Module","students"],["action","Action","view"]].map(([key,label,placeholder])=><div key={key}><label className="mb-2 block text-sm text-slate-300">{label}</label><input value={form[key]} onChange={(e)=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"/></div>)}<div className="sm:col-span-2"><label className="mb-2 block text-sm text-slate-300">Description</label><input value={form.description} onChange={(e)=>setForm(p=>({...p,description:e.target.value}))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"/></div></div><button className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">{editing?"Update Permission":"Create Permission"}</button></form></div>}
    </div>
  );
};

export default PermissionsPage;
