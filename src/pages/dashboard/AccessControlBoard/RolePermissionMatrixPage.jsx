import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { assignRolePermissions, getPermissions, getRolePermissions, getRoles } from "../../../rbac/rbacApi";
import PermissionGate from "../../../rbac/PermissionGate";

const RolePermissionMatrixPage = () => {
  const { accessToken } = useAuth();
  const [roles,setRoles]=useState([]);
  const [permissions,setPermissions]=useState([]);
  const [roleId,setRoleId]=useState("");
  const [selected,setSelected]=useState([]);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{(async()=>{try{const [r,p]=await Promise.all([getRoles(accessToken),getPermissions(accessToken)]);const rr=r?.roles||r||[];setRoles(rr);setPermissions(p?.permissions||p||[]);if(!roleId&&rr[0]?.id)setRoleId(String(rr[0].id));}catch(e){toast.error(e.message||"Unable to load RBAC matrix");}})()},[accessToken]);

  useEffect(()=>{if(!roleId)return;(async()=>{try{const d=await getRolePermissions(accessToken,roleId);setSelected((d?.permissions||d||[]).map((p)=>Number(p.id)));}catch(e){toast.error(e.message||"Unable to load role permissions");}})()},[accessToken,roleId]);

  const groups=useMemo(()=>permissions.reduce((a,p)=>{const k=p.module||"other";(a[k] ||= []).push(p);return a;},{}),[permissions]);
  const toggle=(id)=>setSelected((p)=>p.includes(Number(id))?p.filter(x=>x!==Number(id)):[...p,Number(id)]);
  const toggleModule=(items)=>{const ids=items.map(p=>Number(p.id));const all=ids.every(id=>selected.includes(id));setSelected(p=>all?p.filter(id=>!ids.includes(id)):[...new Set([...p,...ids])]);};
  const save=async()=>{try{setSaving(true);await assignRolePermissions(accessToken,roleId,selected);toast.success("Role permissions updated");}catch(e){toast.error(e.message||"Unable to save permissions");}finally{setSaving(false)}};

  return <PermissionGate permissions={["roles.assign","permissions.manage"]} fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">You do not have permission to manage role permissions.</div>}>
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-white">Role Permission Matrix</h1>
          <p className="mt-1 text-sm text-slate-400">Configure exactly what each role can do.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <label className="mb-2 block text-sm text-slate-300">Select Role</label>
            <select value={roleId} onChange={e=>setRoleId(e.target.value)} 
                className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white">
                  {roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
      </div>
      {Object.entries(groups).map(([module,items])=>{const all=items.every(p=>selected.includes(Number(p.id)));return <section key={module} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center justify-between border-b border-slate-800 pb-4"><div><h2 className="font-semibold capitalize text-white">{module}</h2><p className="text-xs text-slate-500">{items.length} permissions</p></div><button onClick={()=>toggleModule(items)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">{all?"Clear Module":"Select Module"}</button></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(p=>{const checked=selected.includes(Number(p.id));return <button key={p.id} onClick={()=>toggle(p.id)} className={`flex items-center justify-between rounded-xl border p-4 text-left ${checked?"border-cyan-500/40 bg-cyan-500/10":"border-slate-800 bg-slate-950"}`}><div><p className="text-sm font-medium text-white">{p.name}</p><p className="font-mono text-xs text-slate-500">{p.slug}</p></div>{checked?<Check size={18} className="text-cyan-400"/>:<ShieldCheck size={18} className="text-slate-700"/>}</button>})}</div></section>})}
      <div className="sticky bottom-4 flex justify-end"><button onClick={save} disabled={saving||!roleId} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 shadow-xl disabled:opacity-60">{saving&&<RefreshCw size={17} className="animate-spin"/>}Save Permission Matrix</button></div>
    </div>
  </PermissionGate>;
};

export default RolePermissionMatrixPage;
