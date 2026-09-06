import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BedDouble, Building2, ChevronRight,
  Edit3, Home, Loader2, Plus, RefreshCw, Search,
  Trash2, UserMinus, UserPlus, Users, Wrench, X,
  Layers, DoorOpen, BarChart3, CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const emptyHostel = { campus_id: "", name: "", code: "", hostel_type: "", total_floors: 0, status: "" };
const emptyFloor  = { hostel_id: "", floor_number: "", floor_name: "" };
const emptyRoom   = { floor_id: "", room_number: "", room_type: "Triple Sharing", total_beds: 3, status: "Available" };
const IC = "w-full px-3.5 py-2.5 rounded-xl bg-[#060e1d] border border-slate-700/60 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition text-sm placeholder:text-slate-600";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStudentImage = (p) => {
  if (!p) return null;
  const n = p.replace(/\\/g, "/");
  return n.startsWith("http") ? n : `http://localhost:5001/${n}`;
};

const badge = (s) => {
  const map = {
    Active:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    active:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Available:    "bg-cyan-500/10    text-cyan-400    border-cyan-500/20",
    available:    "bg-cyan-500/10    text-cyan-400    border-cyan-500/20",
    Occupied:     "bg-violet-500/10  text-violet-400  border-violet-500/20",
    occupied:     "bg-violet-500/10  text-violet-400  border-violet-500/20",
    Partial:      "bg-amber-500/10   text-amber-400   border-amber-500/20",
    partial:      "bg-amber-500/10   text-amber-400   border-amber-500/20",
    Maintenance:  "bg-red-500/10     text-red-400     border-red-500/20",
    maintenance:  "bg-red-500/10     text-red-400     border-red-500/20",
    Inactive:     "bg-slate-700/40   text-slate-400   border-slate-700",
    inactive:     "bg-slate-700/40   text-slate-400   border-slate-700",
    Boys:         "bg-blue-500/10    text-blue-400    border-blue-500/20",
    Girls:        "bg-pink-500/10    text-pink-400    border-pink-500/20",
    Mixed:        "bg-purple-500/10  text-purple-400  border-purple-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${map[s] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
      {s}
    </span>
  );
};

const Divider = () => <div className="h-px bg-slate-800/60 my-1" />;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-[#070f1e] shadow-[0_0_60px_rgba(0,0,0,0.7)] text-white`}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-[#070f1e] z-10">
          <h3 className="font-bold text-base tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X size={17} />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between text-xs font-medium text-slate-400">
        <span>{label}</span>
        {hint && <span className="text-slate-600 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function FormButtons({ saving, onCancel, onSubmit, submitText, danger = false }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition text-sm font-medium">
        Cancel
      </button>
      <button type="button" onClick={onSubmit} disabled={saving}
        className={`flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex justify-center items-center gap-2 transition ${
          danger
            ? "bg-red-500 hover:bg-red-400 text-white"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
        }`}>
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? "Saving..." : submitText}
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "cyan" }) {
  const colors = {
    cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400"   },
    amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400"  },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
    emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400"},
    red:    { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400"    },
  };
  const c = colors[color];
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={c.text} />
      </div>
      <div>
        <div className="text-2xl font-black text-white tracking-tight">{value ?? "—"}</div>
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        {sub && <div className={`text-[10px] mt-0.5 ${c.text}`}>{sub}</div>}
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-[#060e1d] border border-slate-800 p-2.5 text-center">
      <div className={`text-base font-black ${highlight ? "text-cyan-400" : "text-white"}`}>{Number(value ?? 0)}</div>
      <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1 flex-wrap text-sm bg-[#071022] border border-slate-800 rounded-xl px-4 py-2.5">
      <Home size={13} className="text-slate-600" />
      {items.map((item, i) => (
        <React.Fragment key={`${item.label}-${i}`}>
          <ChevronRight size={13} className="text-slate-700" />
          {item.onClick ? (
            <button onClick={item.onClick} className="text-cyan-400 hover:text-cyan-300 hover:underline transition font-medium">
              {item.label}
            </button>
          ) : (
            <span className="text-slate-300 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function Empty({ text, icon: Icon = Building2 }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-600">
      <Icon size={36} className="mb-3 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function OccupancyBar({ occupied, total }) {
  const pct = total ? Math.round((occupied / total) * 100) : 0;
  const color = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-cyan-500";
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
        <span>{occupied}/{total} beds</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoomsOverview() {
  const { accessToken } = useAuth();

  const [hostels,        setHostels]        = useState([]);
  const [floors,         setFloors]         = useState([]);
  const [rooms,          setRooms]          = useState([]);
  const [roomDetail,     setRoomDetail]     = useState(null);
  const [students,       setStudents]       = useState([]);
  const [residents,      setResidents]      = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedFloor,  setSelectedFloor]  = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [search,         setSearch]         = useState("");

  const [showHostelModal,   setShowHostelModal]   = useState(false);
  const [showFloorModal,    setShowFloorModal]     = useState(false);
  const [showRoomModal,     setShowRoomModal]      = useState(false);
  const [showAllocateModal, setShowAllocateModal]  = useState(false);

  const [editingHostel, setEditingHostel] = useState(null);
  const [editingFloor,  setEditingFloor]  = useState(null);
  const [editingRoom,   setEditingRoom]   = useState(null);

  const [hostelForm, setHostelForm] = useState(emptyHostel);
  const [floorForm,  setFloorForm]  = useState(emptyFloor);
  const [roomForm,   setRoomForm]   = useState(emptyRoom);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBed,     setSelectedBed]     = useState("");

  // ── API ──────────────────────────────────────────────────────────────────────
  const api = async (url, options = {}) => {
    if (!accessToken) throw new Error("Not authenticated");
    const res  = await fetch(`${BASE_URI}${url}`, {
      ...options,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.error || `Server error ${res.status}`);
    return data;
  };

  const loadHostels   = async () => { const d = await api("/api/hostel/hostels"); const l = d?.hostels || d?.data || []; const list = Array.isArray(d) ? d : (Array.isArray(l) ? l : []); setHostels(list); return list; };
  const loadFloors    = async (hid) => { if (!hid) { setFloors([]); return []; } const d = await api(`/api/hostel/floors?hostel_id=${hid}`); const l = Array.isArray(d) ? d : (d?.floors || d?.data || []); setFloors(l); return l; };
  const loadRooms     = async (hid, fid) => { if (!hid) { setRooms([]); return []; } let u = `/api/hostel/rooms?hostel_id=${hid}`; if (fid) u += `&floor_id=${fid}`; const d = await api(u); const l = Array.isArray(d) ? d : (d?.rooms || d?.data || []); setRooms(l); return l; };
  const loadStudents  = async () => { const d = await api("/api/hostel/available-students"); const l = Array.isArray(d) ? d : (d?.students || d?.data || []); setStudents(l); };
  const loadResidents = async (hid) => { if (!hid) { setResidents([]); return; } const d = await api(`/api/hostel/residents?hostel_id=${hid}`); const l = Array.isArray(d) ? d : (d?.residents || d?.data || []); setResidents(l); };

  const refresh = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      await loadHostels();
      if (selectedHostel) await Promise.all([loadFloors(selectedHostel.id), loadRooms(selectedHostel.id, selectedFloor?.id), loadResidents(selectedHostel.id)]);
      await loadStudents();
    } catch (e) {
      toast.error(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (accessToken) refresh(); }, [accessToken]);

  const openHostel = async (h) => {
    try { setSelectedHostel(h); setSelectedFloor(null); setRoomDetail(null); await Promise.all([loadFloors(h.id), loadRooms(h.id), loadResidents(h.id)]); }
    catch (e) { toast.error(e.message); }
  };

  const openFloor = async (f) => {
    try { setSelectedFloor(f); setRoomDetail(null); await loadRooms(selectedHostel.id, f.id); }
    catch (e) { toast.error(e.message); }
  };

  const openRoom = async (r) => {
    try { const d = await api(`/api/hostel/rooms/${r.id}`); setRoomDetail(d?.room ? { ...d.room, beds: d.beds || [] } : null); }
    catch (e) { toast.error(e.message); }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    hostels:  hostels.length,
    floors:   selectedHostel ? (selectedHostel.floor_count || floors.length) : hostels.reduce((a, h) => a + Number(h.floor_count || 0), 0),
    rooms:    selectedHostel ? (selectedHostel.room_count  || rooms.length)  : hostels.reduce((a, h) => a + Number(h.room_count  || 0), 0),
    beds:     selectedHostel ? (selectedHostel.total_beds    || 0) : hostels.reduce((a, h) => a + Number(h.total_beds    || 0), 0),
    occupied: selectedHostel ? (selectedHostel.occupied_beds || 0) : hostels.reduce((a, h) => a + Number(h.occupied_beds || 0), 0),
  }), [hostels, selectedHostel, floors, rooms]);

  const filteredHostels = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return hostels;
    return hostels.filter(h => [h.name, h.code, h.hostel_type].some(v => String(v || "").toLowerCase().includes(q)));
  }, [hostels, search]);

  const filteredRooms = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rooms;
    return rooms.filter(r => String(r.room_number || "").toLowerCase().includes(q));
  }, [rooms, search]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const submitHostel = async () => {
    if (!hostelForm.name.trim()) { toast.error("Hostel name required"); return; }
    try {
      setSaving(true);
      if (editingHostel) { await api(`/api/hostel/hostels/${editingHostel.id}`, { method: "PUT", body: JSON.stringify(hostelForm) }); toast.success("Hostel updated"); }
      else               { await api("/api/hostel/hostels", { method: "POST", body: JSON.stringify(hostelForm) }); toast.success("Hostel created"); }
      setShowHostelModal(false); setEditingHostel(null); setHostelForm(emptyHostel);
      const list = await loadHostels();
      if (selectedHostel) { const cur = list.find(x => String(x.id) === String(selectedHostel.id)); if (cur) setSelectedHostel(cur); }
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const submitFloor = async () => {
    if (!floorForm.hostel_id || floorForm.floor_number === "") { toast.error("Hostel & floor number required"); return; }
    try {
      setSaving(true);
      if (editingFloor) { await api(`/api/hostel/floors/${editingFloor.id}`, { method: "PUT", body: JSON.stringify(floorForm) }); toast.success("Floor updated"); }
      else              { await api("/api/hostel/floors", { method: "POST", body: JSON.stringify(floorForm) }); toast.success("Floor created"); }
      setShowFloorModal(false); setEditingFloor(null); setFloorForm({ ...emptyFloor, hostel_id: selectedHostel?.id || "" });
      await loadFloors(selectedHostel.id);
      const list = await loadHostels(); const cur = list.find(x => String(x.id) === String(selectedHostel.id)); if (cur) setSelectedHostel(cur);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const submitRoom = async () => {
    if (!roomForm.floor_id || !roomForm.room_number.trim()) { toast.error("Floor & room number required"); return; }
    try {
      setSaving(true);
      if (editingRoom) { await api(`/api/hostel/rooms/${editingRoom.id}`, { method: "PUT", body: JSON.stringify(roomForm) }); toast.success("Room updated"); }
      else             { await api("/api/hostel/rooms", { method: "POST", body: JSON.stringify(roomForm) }); toast.success("Room created"); }
      setShowRoomModal(false); setEditingRoom(null); setRoomForm({ ...emptyRoom, floor_id: selectedFloor?.id || floors[0]?.id || "" });
      await loadRooms(selectedHostel.id, selectedFloor?.id);
      const list = await loadHostels(); const cur = list.find(x => String(x.id) === String(selectedHostel.id)); if (cur) setSelectedHostel(cur);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const deleteHostel = async (h) => {
    if (!window.confirm(`Delete ${h.name}?`)) return;
    try { await api(`/api/hostel/hostels/${h.id}`, { method: "DELETE" }); toast.success("Deleted"); if (selectedHostel?.id === h.id) { setSelectedHostel(null); setSelectedFloor(null); setRoomDetail(null); } await loadHostels(); }
    catch (e) { toast.error(e.message); }
  };

  const deleteFloor = async (f) => {
    if (!window.confirm(`Delete ${f.floor_name || `Floor ${f.floor_number}`}?`)) return;
    try { await api(`/api/hostel/floors/${f.id}`, { method: "DELETE" }); toast.success("Deleted"); if (selectedFloor?.id === f.id) { setSelectedFloor(null); setRoomDetail(null); } await loadFloors(selectedHostel.id); await loadRooms(selectedHostel.id); }
    catch (e) { toast.error(e.message); }
  };

  const deleteRoom = async (r) => {
    if (!window.confirm(`Delete Room ${r.room_number}?`)) return;
    try { await api(`/api/hostel/rooms/${r.id}`, { method: "DELETE" }); toast.success("Deleted"); setRoomDetail(null); await loadRooms(selectedHostel.id, selectedFloor?.id); }
    catch (e) { toast.error(e.message); }
  };

  const allocateStudent = async () => {
    if (!roomDetail?.id || !selectedStudent || !selectedBed) { toast.error("Select student and bed"); return; }
    try {
      setSaving(true);
      await api("/api/hostel/allocations", { method: "POST", body: JSON.stringify({ student_id: Number(selectedStudent), room_id: Number(roomDetail.id), bed_number: Number(selectedBed) }) });
      toast.success("Student allocated!");
      setShowAllocateModal(false); setSelectedStudent(""); setSelectedBed("");
      await Promise.all([openRoom(roomDetail), loadRooms(selectedHostel.id, selectedFloor?.id), loadStudents(), loadResidents(selectedHostel.id), loadHostels()]);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const vacate = async (allocationId) => {
    if (!window.confirm("Vacate this student?")) return;
    try {
      setSaving(true);
      await api(`/api/hostel/allocations/${allocationId}/vacate`, { method: "PATCH" });
      toast.success("Student vacated");
      await Promise.all([openRoom(roomDetail), loadRooms(selectedHostel.id, selectedFloor?.id), loadStudents(), loadResidents(selectedHostel.id), loadHostels()]);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const openEditHostel = (h) => { setEditingHostel(h); setHostelForm({ campus_id: h.campus_id || "", name: h.name || "", code: h.code || "", hostel_type: h.hostel_type || "Boys", total_floors: h.total_floors || 0, status: h.status || "Active" }); setShowHostelModal(true); };
  const openEditFloor  = (f) => { setEditingFloor(f);  setFloorForm({ hostel_id: f.hostel_id, floor_number: f.floor_number, floor_name: f.floor_name || "" }); setShowFloorModal(true); };
  const openEditRoom   = (r) => { setEditingRoom(r);   setRoomForm({ floor_id: r.floor_id, room_number: r.room_number || "", room_type: r.room_type || "Triple Sharing", total_beds: r.total_beds || 3, status: r.status || "Available" }); setShowRoomModal(true); };

  const availableBeds = roomDetail?.beds?.filter(b => b.status === "Available") || [];
  if (loading && !hostels.length) {
    return (
      <section className="p-6 text-white grid place-items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
            <Loader2 size={22} className="animate-spin text-cyan-400" />
          </div>
          <span className="text-sm">Loading hostel data...</span>
        </div>
      </section>
    );
  }
  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <section className="p-6 text-white space-y-6 max-w-[1400px]">

      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
              <Building2 size={16} className="text-cyan-400" />
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Hostel Module</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Hostel Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Campus → Hostel → Floor → Room → Bed → Student</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingHostel(null); setHostelForm(emptyHostel); setShowHostelModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <Plus size={16} /> Add Hostel
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-[#071022] hover:bg-slate-800 flex items-center gap-2 text-sm transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-cyan-400" : "text-slate-400"} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard icon={Building2}  label="Hostels"  value={stats.hostels}  color="cyan"    sub="Total blocks" />
        <StatCard icon={Layers}     label="Floors"   value={stats.floors}   color="violet"  sub="All floors" />
        <StatCard icon={DoorOpen}   label="Rooms"    value={stats.rooms}    color="amber"   sub="All rooms" />
        <StatCard icon={BedDouble}  label="Beds"     value={stats.beds}     color="emerald" sub="Total capacity" />
        <StatCard icon={Users}      label="Occupied" value={stats.occupied}  color="red"     sub={`${stats.beds ? Math.round((stats.occupied/stats.beds)*100) : 0}% occupancy`} />
      </div>

      {/* ── Global Search ── */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hostel, room number..."
          className={`${IC} pl-10 py-3`}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={15} />
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          VIEW 1 — Hostel Cards
      ════════════════════════════════════════════════════════════ */}
      {!selectedHostel && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHostels.map((h) => {
            const pct = h.total_beds ? Math.round(((h.occupied_beds || 0) / h.total_beds) * 100) : 0;
            return (
              <div key={h.id}
                className="group rounded-2xl border border-slate-800 bg-[#071022] p-5 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-200 flex flex-col"
              >
                {/* Card top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 grid place-items-center">
                      <Building2 size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{h.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{h.code || "No code"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {badge(h.status ?? "Active")}
                    {badge(h.hostel_type ?? "Boys")}
                  </div>
                </div>

                {/* Stats mini grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <MiniStat label="Floors" value={h.floor_count} />
                  <MiniStat label="Rooms"  value={h.room_count} />
                  <MiniStat label="Beds"   value={h.total_beds} />
                  <MiniStat label="Used"   value={h.occupied_beds} highlight />
                </div>

                {/* Occupancy bar */}
                <OccupancyBar occupied={Number(h.occupied_beds || 0)} total={Number(h.total_beds || 0)} />

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => openHostel(h)}
                    className="flex-1 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold text-sm flex items-center justify-center gap-1.5 transition border border-cyan-500/20"
                  >
                    <DoorOpen size={14} /> Open
                  </button>
                  <button onClick={() => openEditHostel(h)}
                    className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition" title="Edit">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => deleteHostel(h)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition border border-red-500/20" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filteredHostels.length === 0 && (
            <Empty text="No hostels found. Create your first hostel." icon={Building2} />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW 2 — Hostel Detail (Floors + Rooms)
      ════════════════════════════════════════════════════════════ */}
      {selectedHostel && !roomDetail && (
        <div className="space-y-5">
          <Breadcrumb items={[
            { label: "Hostels", onClick: () => { setSelectedHostel(null); setSelectedFloor(null); setRooms([]); setFloors([]); } },
            { label: selectedHostel.name },
          ]} />

          {/* Sub-header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 rounded-2xl border border-slate-800 bg-[#071022]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
                <Building2 size={22} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-black">{selectedHostel.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{selectedHostel.code || "No code"}</span>
                  {badge(selectedHostel.hostel_type)}
                  {badge(selectedHostel.status ?? "Active")}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingFloor(null); setFloorForm({ ...emptyFloor, hostel_id: selectedHostel.id }); setShowFloorModal(true); }}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 text-sm transition shadow-lg shadow-cyan-500/20"
              >
                <Plus size={15} /> Add Floor
              </button>
              <button onClick={() => openEditHostel(selectedHostel)}
                className="px-3 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 flex items-center gap-2 text-sm transition">
                <Edit3 size={15} /> Edit
              </button>
            </div>
          </div>

          {/* Floors + Rooms layout */}
          <div className="grid lg:grid-cols-[260px_1fr] gap-4">

            {/* Floors sidebar */}
            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm flex items-center gap-2"><Layers size={15} className="text-cyan-400" /> Floors</h4>
                <span className="text-xs text-slate-600">{floors.length} floors</span>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setSelectedFloor(null); loadRooms(selectedHostel.id); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition ${!selectedFloor ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300" : "hover:bg-slate-800 text-slate-400 border border-transparent"}`}
                >
                  All Floors
                </button>
                {floors.map((f) => (
                  <div key={f.id} className={`rounded-xl border transition ${selectedFloor?.id === f.id ? "border-cyan-500/30 bg-cyan-600/5" : "border-transparent hover:border-slate-700"}`}>
                    <button onClick={() => openFloor(f)} className="w-full text-left px-3 py-2.5">
                      <div className="font-semibold text-sm">{f.floor_name || `Floor ${f.floor_number}`}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{f.total_rooms || 0} rooms · {f.occupied_beds || 0}/{f.total_beds || 0} beds</div>
                    </button>
                    <div className="flex gap-1 px-2 pb-2">
                      <button onClick={() => openEditFloor(f)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"><Edit3 size={12} /></button>
                      <button onClick={() => deleteFloor(f)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {floors.length === 0 && <p className="text-xs text-slate-600 text-center py-4">No floors yet</p>}
              </div>
            </div>

            {/* Rooms grid */}
            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold">{selectedFloor ? (selectedFloor.floor_name || `Floor ${selectedFloor.floor_number}`) : "All Rooms"}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{filteredRooms.length} rooms</p>
                </div>
                <button
                  onClick={() => {
                    if (!floors.length) { toast.error("Create a floor first"); return; }
                    setEditingRoom(null);
                    setRoomForm({ ...emptyRoom, floor_id: selectedFloor?.id || floors[0].id });
                    setShowRoomModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 text-sm transition"
                >
                  <Plus size={14} /> Add Room
                </button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredRooms.map((r) => {
                  const occupied  = Number(r.occupied_beds  || 0);
                  const total     = Number(r.total_beds     || 0);
                  const available = Number(r.available_beds || (total - occupied));
                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-700/60 bg-[#0a1628] p-4 hover:border-slate-600 transition-all group">
                      {/* Room header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <DoorOpen size={15} className="text-cyan-400" />
                            <span className="font-black text-base">Room {r.room_number}</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5">{r.room_type}</p>
                        </div>
                        {badge(r.status)}
                      </div>

                      {/* Bed stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <MiniStat label="Total" value={total} />
                        <MiniStat label="Used"  value={occupied} highlight />
                        <MiniStat label="Free"  value={available} />
                      </div>

                      <OccupancyBar occupied={occupied} total={total} />

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                        <button onClick={() => openRoom(r)}
                          className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition">
                          Manage
                        </button>
                        <button onClick={() => openEditRoom(r)}
                          className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 transition">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => deleteRoom(r)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredRooms.length === 0 && <Empty text="No rooms on this floor." icon={DoorOpen} />}
              </div>
            </div>
          </div>

          {/* Residents table for this hostel */}
          {residents.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#071022] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-bold flex items-center gap-2"><Users size={15} className="text-cyan-400" /> Residents — {selectedHostel.name}</h4>
                <span className="text-xs text-slate-500">{residents.length} students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="bg-[#060e1d]">
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <th className="text-left px-5 py-3 font-medium">Student</th>
                      <th className="text-left px-5 py-3 font-medium">Room</th>
                      <th className="text-left px-5 py-3 font-medium">Bed</th>
                      <th className="text-left px-5 py-3 font-medium">Course</th>
                      <th className="text-left px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {residents.map((s) => {
                      const name = s.student_name || s.name || "Student";
                      const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
                      return (
                        <tr key={s.allocation_id} className="hover:bg-[#060e1d] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-xs font-bold text-cyan-400 overflow-hidden flex-shrink-0">
                                {getStudentImage(s.photo_path)
                                  ? <img src={getStudentImage(s.photo_path)} alt={name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                  : initials
                                }
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{name}</div>
                                <div className="text-[10px] text-slate-500">{s.student_id || s.enrollment_no}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-cyan-400 font-semibold">Room {s.room_number}</td>
                          <td className="px-5 py-3 text-slate-300">Bed {s.bed_number}</td>
                          <td className="px-5 py-3 text-slate-400">{s.course || "—"}</td>
                          <td className="px-5 py-3">
                            <button onClick={() => vacate(s.allocation_id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition">
                              <UserMinus size={12} /> Vacate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW 3 — Room Detail (Beds)
      ════════════════════════════════════════════════════════════ */}
      {roomDetail && (
        <div className="space-y-5">
          <Breadcrumb items={[
            { label: "Hostels",          onClick: () => { setSelectedHostel(null); setRoomDetail(null); } },
            { label: selectedHostel.name, onClick: () => setRoomDetail(null) },
            { label: selectedFloor?.floor_name || `Floor ${roomDetail.floor_number}`, onClick: () => setRoomDetail(null) },
            { label: `Room ${roomDetail.room_number}` },
          ]} />

          {/* Room header card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-[#071022] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/10 border border-cyan-500/20 grid place-items-center">
                <DoorOpen size={24} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Room {roomDetail.room_number}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500">{roomDetail.hostel_name}</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">{roomDetail.floor_name || `Floor ${roomDetail.floor_number}`}</span>
                  <span className="text-slate-700">·</span>
                  {badge(roomDetail.room_type)}
                  {badge(roomDetail.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingRoom(roomDetail); setRoomForm({ floor_id: roomDetail.floor_id, room_number: roomDetail.room_number, room_type: roomDetail.room_type, total_beds: roomDetail.total_beds, status: roomDetail.status }); setShowRoomModal(true); }}
                className="px-3 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 flex items-center gap-1.5 text-sm transition">
                <Edit3 size={14} /> Edit Room
              </button>
              <button onClick={() => setShowAllocateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 text-sm transition shadow-lg shadow-cyan-500/20">
                <UserPlus size={15} /> Allocate Student
              </button>
            </div>
          </div>

          {/* Room stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={BedDouble} label="Total Beds"     value={roomDetail.total_beds}  color="cyan" />
            <StatCard icon={Users}     label="Occupied"       value={roomDetail.occupied_beds} color="violet" />
            <StatCard icon={BedDouble} label="Available Beds" value={roomDetail.beds?.filter(b => b.status === "Available").length || 0} color="emerald" />
            <StatCard icon={Wrench}    label="Room Status"    value={roomDetail.status}      color="amber" />
          </div>

          {/* Bed cards */}
          <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <BedDouble size={16} className="text-cyan-400" /> Beds & Allocation
            </h4>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(roomDetail.beds || []).map((bed) => {
                const occupied = bed.status === "Occupied";
                const img = getStudentImage(bed.photo_path);
                const name = bed.student_name || "";
                const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
                return (
                  <div key={bed.id}
                    className={`rounded-2xl border p-4 transition-all ${occupied ? "border-emerald-500/25 bg-emerald-500/5" : "border-slate-700/60 bg-[#0a1628]"}`}>
                    {/* Bed header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl grid place-items-center border ${occupied ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-800 border-slate-700"}`}>
                          <BedDouble size={16} className={occupied ? "text-emerald-400" : "text-slate-500"} />
                        </div>
                        <span className="font-bold">Bed {bed.bed_number}</span>
                      </div>
                      {badge(bed.status)}
                    </div>

                    {occupied ? (
                      <>
                        {/* Student info */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 grid place-items-center overflow-hidden flex-shrink-0">
                            {img
                              ? <img src={img} alt={name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                              : <span className="text-xs font-bold text-cyan-400">{initials}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{bed.enrollment_no || "No ID"} · {bed.course || "—"}</div>
                            <div className="text-[10px] text-slate-600 mt-0.5">Allotted: {bed.allocation_date || "—"}</div>
                          </div>
                        </div>
                        <button onClick={() => vacate(bed.allocation_id)}
                          className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center gap-1.5 text-xs font-semibold transition">
                          <UserMinus size={13} /> Vacate Student
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-slate-600 mb-3">No student allocated to this bed</p>
                        <button onClick={() => { setSelectedBed(String(bed.bed_number)); setShowAllocateModal(true); }}
                          className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 flex items-center justify-center gap-1.5 text-xs font-semibold transition">
                          <UserPlus size={13} /> Allocate Student
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {(!roomDetail.beds || roomDetail.beds.length === 0) && (
                <Empty text="No beds found for this room." icon={BedDouble} />
              )}
            </div>
          </div>

          {/* Residents table for this room */}
          <div className="rounded-2xl border border-slate-800 bg-[#071022] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2"><Users size={15} className="text-cyan-400" /> Room Residents</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-[#060e1d] border-b border-slate-800">
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="text-left px-5 py-3 font-medium">Student</th>
                    <th className="text-left px-5 py-3 font-medium">Enrollment</th>
                    <th className="text-left px-5 py-3 font-medium">Bed</th>
                    <th className="text-left px-5 py-3 font-medium">Course</th>
                    <th className="text-left px-5 py-3 font-medium">Email</th>
                    <th className="text-left px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {residents.filter(x => String(x.room_id) === String(roomDetail.id)).map((s) => (
                    <tr key={s.allocation_id} className="hover:bg-[#060e1d] transition-colors">
                      <td className="px-5 py-3 font-semibold">{s.student_name}</td>
                      <td className="px-5 py-3 text-slate-400">{s.student_id}</td>
                      <td className="px-5 py-3"><span className="text-cyan-400 font-bold">Bed {s.bed_number}</span></td>
                      <td className="px-5 py-3 text-slate-400">{s.course || "—"}</td>
                      <td className="px-5 py-3 text-slate-400">{s.email || "—"}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => vacate(s.allocation_id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition">
                          <UserMinus size={12} /> Vacate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {residents.filter(x => String(x.room_id) === String(roomDetail.id)).length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-600 text-sm">No residents in this room</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ MODALS ════════════ */}

      {/* Add/Edit Hostel */}
      {showHostelModal && (
        <Modal title={editingHostel ? "Edit Hostel" : "Add New Hostel"} onClose={() => setShowHostelModal(false)}>
          <Field label="Hostel Name" hint="required">
            <input className={IC} value={hostelForm.name} onChange={e => setHostelForm({...hostelForm, name: e.target.value})} placeholder="e.g. Block A — Boys Hostel" />
          </Field>
          <Field label="Campus ID">
            <input className={IC} value={hostelForm.campus_id} onChange={e => setHostelForm({...hostelForm, campus_id: e.target.value})} placeholder="Campus ID from database" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hostel Code">
              <input className={IC} value={hostelForm.code} onChange={e => setHostelForm({...hostelForm, code: e.target.value})} placeholder="BH-A1" />
            </Field>
            <Field label="Type">
              <select className={IC} value={hostelForm.hostel_type} onChange={e => setHostelForm({...hostelForm, hostel_type: e.target.value})}>
                <option>Boys</option><option>Girls</option><option>Mixed</option>
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select className={IC} value={hostelForm.status} onChange={e => setHostelForm({...hostelForm, status: e.target.value})}>
              <option>Active</option><option>Inactive</option>
            </select>
          </Field>
          <Divider />
          <FormButtons saving={saving} onCancel={() => setShowHostelModal(false)} onSubmit={submitHostel} submitText={editingHostel ? "Update Hostel" : "Create Hostel"} />
        </Modal>
      )}

      {/* Add/Edit Floor */}
      {showFloorModal && (
        <Modal title={editingFloor ? "Edit Floor" : "Add New Floor"} onClose={() => setShowFloorModal(false)}>
          <Field label="Hostel">
            <select className={IC} value={floorForm.hostel_id} onChange={e => setFloorForm({...floorForm, hostel_id: e.target.value})}>
              <option value="">Select Hostel</option>
              {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Floor Number" hint="required">
              <input type="number" className={IC} value={floorForm.floor_number} onChange={e => setFloorForm({...floorForm, floor_number: e.target.value})} placeholder="1" />
            </Field>
            <Field label="Floor Name">
              <input className={IC} value={floorForm.floor_name} onChange={e => setFloorForm({...floorForm, floor_name: e.target.value})} placeholder="Ground Floor" />
            </Field>
          </div>
          <Divider />
          <FormButtons saving={saving} onCancel={() => setShowFloorModal(false)} onSubmit={submitFloor} submitText={editingFloor ? "Update Floor" : "Create Floor"} />
        </Modal>
      )}

      {/* Add/Edit Room */}
      {showRoomModal && (
        <Modal title={editingRoom ? "Edit Room" : "Add New Room"} onClose={() => setShowRoomModal(false)}>
          <Field label="Floor" hint="required">
            <select className={IC} value={roomForm.floor_id} onChange={e => setRoomForm({...roomForm, floor_id: e.target.value})}>
              <option value="">Select Floor</option>
              {floors.map(f => <option key={f.id} value={f.id}>{f.floor_name || `Floor ${f.floor_number}`} · {f.hostel_name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room Number" hint="required">
              <input className={IC} value={roomForm.room_number} onChange={e => setRoomForm({...roomForm, room_number: e.target.value})} placeholder="101" />
            </Field>
            {!editingRoom && (
              <Field label="Total Beds">
                <input type="number" min="1" max="10" className={IC} value={roomForm.total_beds} onChange={e => setRoomForm({...roomForm, total_beds: e.target.value})} />
              </Field>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room Type">
              <select className={IC} value={roomForm.room_type} onChange={e => setRoomForm({...roomForm, room_type: e.target.value})}>
                <option>Single</option><option>Double Sharing</option><option>Triple Sharing</option><option>Four Sharing</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={IC} value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})}>
                <option>Available</option><option>Partial</option><option>Occupied</option><option>Maintenance</option><option>Inactive</option>
              </select>
            </Field>
          </div>
          <Divider />
          <FormButtons saving={saving} onCancel={() => setShowRoomModal(false)} onSubmit={submitRoom} submitText={editingRoom ? "Update Room" : "Create Room"} />
        </Modal>
      )}

      {/* Allocate Student */}
      {showAllocateModal && (
        <Modal title="Allocate Student to Bed" onClose={() => setShowAllocateModal(false)}>
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs text-cyan-300 flex items-center gap-2 mb-2">
            <DoorOpen size={13} /> Allocating to Room {roomDetail?.room_number} {selectedBed ? `· Bed ${selectedBed}` : ""}
          </div>
          <Field label="Select Student" hint="required">
            <select className={IC} value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">Choose a student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} · {s.student_id}</option>)}
            </select>
          </Field>
          <Field label="Select Bed" hint="required">
            <select className={IC} value={selectedBed} onChange={e => setSelectedBed(e.target.value)}>
              <option value="">Choose available bed...</option>
              {availableBeds.map(b => <option key={b.id} value={b.bed_number}>Bed {b.bed_number}</option>)}
            </select>
          </Field>
          {availableBeds.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <Wrench size={13} /> No available beds in this room
            </div>
          )}
          <Divider />
          <FormButtons saving={saving} onCancel={() => setShowAllocateModal(false)} onSubmit={allocateStudent} submitText="Allocate Student" />
        </Modal>
      )}

    </section>
  );
}
