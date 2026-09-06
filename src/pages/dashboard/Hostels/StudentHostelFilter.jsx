import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Layers,
  DoorOpen,
  Users,
  Search,
  RefreshCw,
  Loader2,
  X,
  User,
  CheckCircle2,
  UserMinus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

const IC =
  "w-full px-3.5 py-2.5 rounded-xl bg-[#060e1d] border border-slate-700/60 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition text-sm";

const getStudentImage = (p) => {
  if (!p) return null;
  const n = p.replace(/\\/g, "/");
  return n.startsWith("http") ? n : `http://localhost:5001/${n}`;
};

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();

  const styles = {
    active:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    allocated:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    occupied:
      "bg-violet-500/10 text-violet-400 border-violet-500/20",
    vacated:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    inactive:
      "bg-slate-700/40 text-slate-400 border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
        styles[s] ||
        "bg-slate-700/40 text-slate-300 border-slate-600"
      }`}
    >
      {status || "Allocated"}
    </span>
  );
};

export default function StudentHostelFilter() {
  const { accessToken } = useAuth();

  const [hostels, setHostels] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------

  const api = async (url, options = {}) => {
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const res = await fetch(`${BASE_URI}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Server error ${res.status}`
      );
    }

    return data;
  };

  // ---------------------------------------------------------------------------
  // Load Hostels
  // ---------------------------------------------------------------------------

  const loadHostels = async () => {
    const d = await api("/api/hostel/hostels");

    const list = Array.isArray(d)
      ? d
      : d?.hostels || d?.data || [];

    setHostels(Array.isArray(list) ? list : []);
  };

  // ---------------------------------------------------------------------------
  // Load Floors
  // ---------------------------------------------------------------------------

  const loadFloors = async (hostelId) => {
    if (!hostelId) {
      setFloors([]);
      return;
    }

    const d = await api(
      `/api/hostel/floors?hostel_id=${hostelId}`
    );

    const list = Array.isArray(d)
      ? d
      : d?.floors || d?.data || [];

    setFloors(Array.isArray(list) ? list : []);
  };

  // ---------------------------------------------------------------------------
  // Load Rooms
  // ---------------------------------------------------------------------------

  const loadRooms = async (hostelId, floorId) => {
    if (!hostelId) {
      setRooms([]);
      return;
    }

    let url = `/api/hostel/rooms?hostel_id=${hostelId}`;

    if (floorId) {
      url += `&floor_id=${floorId}`;
    }

    const d = await api(url);

    const list = Array.isArray(d)
      ? d
      : d?.rooms || d?.data || [];

    setRooms(Array.isArray(list) ? list : []);
  };

  // ---------------------------------------------------------------------------
  // Load Students / Residents
  // ---------------------------------------------------------------------------

  const loadStudents = async (hostelId) => {
    if (!hostelId) {
      setStudents([]);
      return;
    }

    const d = await api(
      `/api/hostel/residents?hostel_id=${hostelId}`
    );

    const list = Array.isArray(d)
      ? d
      : d?.residents || d?.data || [];

    setStudents(Array.isArray(list) ? list : []);
  };

  // ---------------------------------------------------------------------------
  // Initial Load
  // ---------------------------------------------------------------------------

  const loadInitialData = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      await loadHostels();
    } catch (error) {
      toast.error(error.message || "Failed to load hostels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadInitialData();
    }
  }, [accessToken]);

  // ---------------------------------------------------------------------------
  // Hostel Change
  // ---------------------------------------------------------------------------

  const handleHostelChange = async (e) => {
    const hostelId = e.target.value;

    setSelectedHostel(hostelId);
    setSelectedFloor("");
    setSelectedRoom("");
    setFloors([]);
    setRooms([]);
    setStudents([]);

    if (!hostelId) return;

    try {
      setLoading(true);

      await Promise.all([
        loadFloors(hostelId),
        loadRooms(hostelId),
        loadStudents(hostelId),
      ]);
    } catch (error) {
      toast.error(error.message || "Failed to load hostel data");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Floor Change
  // ---------------------------------------------------------------------------

  const handleFloorChange = async (e) => {
    const floorId = e.target.value;

    setSelectedFloor(floorId);
    setSelectedRoom("");

    if (!selectedHostel) return;

    try {
      setLoading(true);
      await loadRooms(selectedHostel, floorId);
    } catch (error) {
      toast.error(error.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Filter Students
  // ---------------------------------------------------------------------------

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((student) => {
      // Floor filter
      if (
        selectedFloor &&
        String(student.floor_id) !== String(selectedFloor)
      ) {
        return false;
      }

      // Room filter
      if (
        selectedRoom &&
        String(student.room_id) !== String(selectedRoom)
      ) {
        return false;
      }

      // Status filter
      if (selectedStatus) {
        const studentStatus = String(
          student.status ||
            student.allocation_status ||
            student.bed_status ||
            "Allocated"
        ).toLowerCase();

        if (studentStatus !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Search
      if (q) {
        const searchable = [
          student.student_name,
          student.name,
          student.student_id,
          student.enrollment_no,
          student.course,
          student.email,
          student.room_number,
          student.floor_name,
          student.floor_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    students,
    selectedFloor,
    selectedRoom,
    selectedStatus,
    search,
  ]);

  // ---------------------------------------------------------------------------
  // Clear Filters
  // ---------------------------------------------------------------------------

  const clearFilters = () => {
    setSelectedHostel("");
    setSelectedFloor("");
    setSelectedRoom("");
    setSelectedStatus("");
    setSearch("");

    setFloors([]);
    setRooms([]);
    setStudents([]);
  };

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = filteredStudents.length;

    const occupied = filteredStudents.filter((s) => {
      const status = String(
        s.status ||
          s.allocation_status ||
          s.bed_status ||
          "Allocated"
      ).toLowerCase();

      return (
        status === "occupied" ||
        status === "allocated" ||
        status === "active"
      );
    }).length;

    return {
      total,
      occupied,
      rooms: new Set(
        filteredStudents
          .map((s) => s.room_id)
          .filter(Boolean)
      ).size,
      floors: new Set(
        filteredStudents
          .map((s) => s.floor_id)
          .filter(Boolean)
      ).size,
    };
  }, [filteredStudents]);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (loading && hostels.length === 0) {
    return (
      <section className="p-6 text-white grid place-items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
            <Loader2
              size={22}
              className="animate-spin text-cyan-400"
            />
          </div>

          <span className="text-sm">
            Loading hostel data...
          </span>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="p-6 text-white space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
              <Users
                size={16}
                className="text-cyan-400"
              />
            </div>

            <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">
              Hostel Students
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            Student Filter
          </h2>

          <p className="text-sm text-slate-500 mt-0.5">
            Filter students by Hostel → Floor → Room → Status
          </p>
        </div>

        <button
          onClick={loadInitialData}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-[#071022] hover:bg-slate-800 flex items-center gap-2 text-sm transition"
        >
          <RefreshCw
            size={15}
            className={
              loading
                ? "animate-spin text-cyan-400"
                : "text-slate-400"
            }
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold">
              Filter Students
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Select one or multiple filters
            </p>
          </div>

          {(selectedHostel ||
            selectedFloor ||
            selectedRoom ||
            selectedStatus ||
            search) && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X size={13} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Hostel */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
              <Building2 size={13} />
              Hostel
            </label>

            <select
              value={selectedHostel}
              onChange={handleHostelChange}
              className={IC}
            >
              <option value="">
                All Hostels
              </option>

              {hostels.map((hostel) => (
                <option
                  key={hostel.id}
                  value={hostel.id}
                >
                  {hostel.name}
                  {hostel.code
                    ? ` · ${hostel.code}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
              <Layers size={13} />
              Floor
            </label>

            <select
              value={selectedFloor}
              onChange={handleFloorChange}
              disabled={!selectedHostel}
              className={`${IC} disabled:opacity-40`}
            >
              <option value="">
                All Floors
              </option>

              {floors.map((floor) => (
                <option
                  key={floor.id}
                  value={floor.id}
                >
                  {floor.floor_name ||
                    `Floor ${floor.floor_number}`}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
              <DoorOpen size={13} />
              Room
            </label>

            <select
              value={selectedRoom}
              onChange={(e) =>
                setSelectedRoom(e.target.value)
              }
              disabled={!selectedHostel}
              className={`${IC} disabled:opacity-40`}
            >
              <option value="">
                All Rooms
              </option>

              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  Room {room.room_number}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
              <CheckCircle2 size={13} />
              Status
            </label>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className={IC}
            >
              <option value="">
                All Status
              </option>
              <option value="Allocated">
                Allocated
              </option>
              <option value="Occupied">
                Occupied
              </option>
              <option value="Active">
                Active
              </option>
              <option value="Vacated">
                Vacated
              </option>
              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search student name, enrollment, course, room..."
            className={`${IC} pl-10 py-3`}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
              <Users
                size={17}
                className="text-cyan-400"
              />
            </div>

            <div>
              <div className="text-xl font-black">
                {stats.total}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Students
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 grid place-items-center">
              <Layers
                size={17}
                className="text-violet-400"
              />
            </div>

            <div>
              <div className="text-xl font-black">
                {stats.floors}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Floors
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 grid place-items-center">
              <DoorOpen
                size={17}
                className="text-amber-400"
              />
            </div>

            <div>
              <div className="text-xl font-black">
                {stats.rooms}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Rooms
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
              <CheckCircle2
                size={17}
                className="text-emerald-400"
              />
            </div>

            <div>
              <div className="text-xl font-black">
                {stats.occupied}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Allocated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#071022] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <Users
                size={16}
                className="text-cyan-400"
              />
              Student List
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredStudents.length} of{" "}
              {students.length} students
            </p>
          </div>

          {selectedHostel && (
            <div className="text-xs text-cyan-400">
              {
                hostels.find(
                  (h) =>
                    String(h.id) ===
                    String(selectedHostel)
                )?.name
              }
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-[#060e1d]">
              <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="text-left px-5 py-3 font-medium">
                  Student
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Hostel
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Floor
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Room
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Bed
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Course
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((student) => {
                const name =
                  student.student_name ||
                  student.name ||
                  "Student";

                const initials = name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const img = getStudentImage(
                  student.photo_path
                );

                const status =
                  student.status ||
                  student.allocation_status ||
                  student.bed_status ||
                  "Allocated";

                return (
                  <tr
                    key={
                      student.allocation_id ||
                      student.id ||
                      `${student.student_id}-${student.room_id}`
                    }
                    className="hover:bg-[#060e1d] transition-colors"
                  >
                    {/* Student */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-xs font-bold text-cyan-400 overflow-hidden flex-shrink-0">
                          {img ? (
                            <img
                              src={img}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            initials || <User size={14} />
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-sm">
                            {name}
                          </div>

                          <div className="text-[10px] text-slate-500">
                            {student.student_id ||
                              student.enrollment_no ||
                              "No ID"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Hostel */}
                    <td className="px-5 py-3">
                      <span className="text-slate-300">
                        {student.hostel_name ||
                          hostels.find(
                            (h) =>
                              String(h.id) ===
                              String(selectedHostel)
                          )?.name ||
                          "—"}
                      </span>
                    </td>

                    {/* Floor */}
                    <td className="px-5 py-3">
                      <span className="text-slate-300">
                        {student.floor_name ||
                          (student.floor_number !==
                          undefined
                            ? `Floor ${student.floor_number}`
                            : "—")}
                      </span>
                    </td>

                    {/* Room */}
                    <td className="px-5 py-3">
                      <span className="text-cyan-400 font-semibold">
                        {student.room_number
                          ? `Room ${student.room_number}`
                          : "—"}
                      </span>
                    </td>

                    {/* Bed */}
                    <td className="px-5 py-3 text-slate-300">
                      {student.bed_number
                        ? `Bed ${student.bed_number}`
                        : "—"}
                    </td>

                    {/* Course */}
                    <td className="px-5 py-3 text-slate-400">
                      {student.course || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      {statusBadge(status)}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center text-slate-600">
                      <Users
                        size={36}
                        className="mb-3 opacity-30"
                      />

                      <p className="text-sm">
                        No students found
                      </p>

                      <p className="text-xs mt-1">
                        Try changing your filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
