import React, { useEffect, useState } from "react";
import { Building2, BedDouble, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

export default function AddRoom() {
  const { accessToken } = useAuth();

  const [floors, setFloors] = useState([]);
  const [loadingFloors, setLoadingFloors] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    room: "",
    floor: "",
    type: "Triple Sharing",
    beds: 3,
    status: "Available",
  });

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =========================================================
  // GET FLOORS
  // GET /api/hostel/floors
  // =========================================================

  const fetchFloors = async () => {
    if (!accessToken) return;

    try {
      setLoadingFloors(true);

      const response = await fetch(
        `${BASE_URI}/api/hostel/floors`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Server error: ${response.status}`
        );
      }

      const floorData = Array.isArray(data)
        ? data
        : data?.floors ||
          data?.data ||
          [];

      setFloors(floorData);

      // First floor automatically select
      if (floorData.length > 0) {
        setForm((prev) => ({
          ...prev,
          floor:
            prev.floor ||
            floorData[0].id,
        }));
      }

    } catch (error) {
      console.error(
        "FETCH FLOORS ERROR:",
        error
      );

      toast.error(
        error.message ||
          "Unable to load floors"
      );

      setFloors([]);

    } finally {
      setLoadingFloors(false);
    }
  };

  // =========================================================
  // LOAD FLOORS
  // =========================================================

  useEffect(() => {
    fetchFloors();
  }, [accessToken]);

  // =========================================================
  // CREATE ROOM
  // POST /api/hostel/rooms
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------- VALIDATION ----------------

    if (!form.room.trim()) {
      toast.error("Please enter room number");
      return;
    }

    if (!form.floor) {
      toast.error("Please select a floor");
      return;
    }

    if (!form.beds || Number(form.beds) < 1) {
      toast.error("Beds must be at least 1");
      return;
    }

    try {
      setCreating(true);

      const selectedFloor = floors.find(
        (item) =>
          String(item.id) ===
          String(form.floor)
      );

      if (!selectedFloor) {
        toast.error("Selected floor not found");
        return;
      }

      // Backend payload
      const payload = {
        floor_id: Number(form.floor),
        room_number: form.room.trim(),
        room_type: form.type,
        total_beds: Number(form.beds),
      };

      console.log(
        "CREATE ROOM PAYLOAD:",
        payload
      );

      const response = await fetch(
        `${BASE_URI}/api/hostel/rooms`,
        {
          method: "POST", 

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Server error: ${response.status}`
        );
      }

      toast.success(
        "Room created successfully!"
      );

      // Reset form
      setForm({
        room: "",
        floor: floors.length
          ? floors[0].id
          : "",
        type: "Triple Sharing",
        beds: 3,
        status: "Available",
      });

    } catch (error) {
      console.error(
        "CREATE ROOM ERROR:",
        error
      );

      toast.error(
        error.message ||
          "Unable to create room"
      );

    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setForm({
      room: "",
      floor: floors.length
        ? floors[0].id
        : "",
      type: "Triple Sharing",
      beds: 3,
      status: "Available",
    });
  };

  // =========================================================
  // SELECTED FLOOR NAME
  // =========================================================

  const selectedFloor = floors.find(
    (item) =>
      String(item.id) ===
      String(form.floor)
  );

  const selectedFloorName =
    selectedFloor?.name ||
    selectedFloor?.floor_name ||
    selectedFloor?.floorName ||
    "Select Floor";

  // =========================================================
  // JSX
  // =========================================================

  return (
    <section className=" max-w-4xl text-white">
      {/* HEADER */}
      <p className="text-slate-500 text-sm mt-1">
        Create a new hostel room and define
        its bed capacity.
      </p>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-800 bg-[#071022] p-6"
      >

        <div className="grid md:grid-cols-3 gap-5">
          {/* ROOM NUMBER */}
          <label className="text-sm text-slate-300">
            Room Number
            <input
              type="text"
              value={form.room}
              onChange={(e) =>
                set("room", e.target.value)
              }
              placeholder="e.g. G01"
              className="mt-2 w-full p-3 rounded-xl bg-[#0a1428] border border-slate-700 outline-none text-white focus:border-cyan-500"
            />

          </label>

          {/* FLOOR */}

          <label className="text-sm text-slate-300">

            Floor

            <select
              value={form.floor}
              onChange={(e) =>
                set("floor", e.target.value)
              }
              disabled={loadingFloors}
              className="mt-2 w-full p-3 rounded-xl bg-[#0a1428] border border-slate-700 outline-none text-white focus:border-cyan-500 disabled:opacity-50"
            >

              {loadingFloors ? (
                <option value="">
                  Loading floors...
                </option>
              ) : floors.length === 0 ? (
                <option value="">
                  No floors available
                </option>
              ) : (
                floors.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name ||
                      item.floor_name ||
                      item.floorName ||
                      `Floor ${item.id}`}
                  </option>
                ))
              )}

            </select>

          </label>

          {/* ROOM TYPE */}

          <label className="text-sm text-slate-300">

            Room Type

            <select
              value={form.type}
              onChange={(e) =>
                set("type", e.target.value)
              }
              className="mt-2 w-full p-3 rounded-xl bg-[#0a1428] border border-slate-700 outline-none text-white focus:border-cyan-500"
            >

              <option value="Triple Sharing">
                Triple Sharing
              </option>

              <option value="Double Sharing">
                Double Sharing
              </option>

              <option value="Single Sharing">
                Single Sharing
              </option>

            </select>

          </label>

          {/* BEDS */}

          <label className="text-sm text-slate-300">

            Beds

            <input
              type="number"
              min="1"
              max="10"
              value={form.beds}
              onChange={(e) =>
                set("beds", e.target.value)
              }
              className="mt-2 w-full p-3 rounded-xl bg-[#0a1428] border border-slate-700 outline-none text-white focus:border-cyan-500"
            />

          </label>

          {/* STATUS */}

          <label className="text-sm text-slate-300">

            Initial Status

            <select
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value)
              }
              className="mt-2 w-full p-3 rounded-xl bg-[#0a1428] border border-slate-700 outline-none text-white focus:border-cyan-500"
            >

              <option value="Available">
                Available
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

            </select>

          </label>

        </div>

        {/* PREVIEW CARDS */}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* FLOOR */}

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">

            <Building2 className="text-cyan-300" />

            <div className="text-xs text-slate-500 mt-2">
              Floor
            </div>

            <b>
              {selectedFloorName}
            </b>

          </div>

          {/* BEDS */}

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">

            <BedDouble className="text-emerald-300" />

            <div className="text-xs text-slate-500 mt-2">
              Beds
            </div>

            <b>
              {form.beds || 0}
            </b>

          </div>

          {/* MEMBERS */}

          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">

            <div className="text-violet-300 text-xl">
              3
            </div>

            <div className="text-xs text-slate-500 mt-2">
              Default Members
            </div>

            <b>
              Max {form.beds || 0}
            </b>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={handleCancel}
            disabled={creating}
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              creating ||
              loadingFloors ||
              !floors.length
            }
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-2 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {creating && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {creating
              ? "Creating..."
              : "Create Room"}

          </button>

        </div>

      </form>

    </section>
  );
}