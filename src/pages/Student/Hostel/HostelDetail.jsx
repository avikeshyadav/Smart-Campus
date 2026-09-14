import React, { useEffect, useState } from "react";
import { BASE_URI } from "../../../config/api";

const HostelDetails = () => {
  const [hostelData, setHostelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return sessionStorage.getItem("Student_access_token");
  };

  const fetchHostelInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      const response = await fetch(
        `${BASE_URI}/api/student/studentdashboard/hosteldetail`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch hostel information"
        );
      }

      setHostelData(data?.data || null);
    } catch (err) {
      console.error("Hostel API Error:", err);

      setError(
        err.message ||
          "Something went wrong while loading hostel information"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelInfo();
  }, []);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-5 w-44 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-64 rounded bg-slate-200" />
            </div>

            <div className="h-11 w-11 rounded-xl bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-20 rounded-xl bg-slate-200" />
            <div className="h-20 rounded-xl bg-slate-200" />
            <div className="h-20 rounded-xl bg-slate-200" />
            <div className="h-20 rounded-xl bg-slate-200" />
            <div className="h-20 rounded-xl bg-slate-200" />
            <div className="h-20 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          Unable to load hostel information
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={fetchHostelInfo}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // ==========================================================
  // NO DATA
  // ==========================================================

  if (!hostelData) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
          🏠
        </div>

        <p className="mt-4 font-semibold text-slate-700">
          No hostel information available
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Your hostel accommodation details could not be found.
        </p>
      </div>
    );
  }

  const {
    student,
    allocation,
    hostel,
    floor,
    room,
    bed,
    roommates = [],
  } = hostelData;

  // ==========================================================
  // NO ACTIVE ALLOCATION
  // ==========================================================

  if (!hostel) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Hostel Information
            </h2>

            <p className="text-sm text-slate-500">
              Your current hostel accommodation details
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
            🏠
          </div>
        </div>

        <div className="rounded-xl border border-orange-100 bg-orange-50 p-6 text-center">
          <div className="text-3xl">🏠</div>

          <p className="mt-3 font-semibold text-orange-800">
            No Active Hostel Allocation
          </p>

          <p className="mt-1 text-sm text-orange-700">
            You currently do not have an active hostel room allocation.
          </p>
        </div>
      </section>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Hostel Information
          </h2>

          <p className="text-sm text-slate-500">
            Your current hostel accommodation details
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
          🏠
        </div>
      </div>

      {/* HOSTEL SUMMARY */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm text-indigo-100">
              Current Hostel
            </p>

            <h3 className="mt-1 text-xl font-bold">
              {hostel.name || "Hostel"}
            </h3>

            {hostel.code && (
              <p className="mt-1 text-sm text-indigo-100">
                Code: {hostel.code}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              {hostel.type || "Hostel"}
            </span>

            <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              {hostel.status || "Active"}
            </span>
          </div>

        </div>
      </div>

      {/* ROOM DETAILS */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Accommodation
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <InfoItem
            label="Hostel"
            value={hostel.name}
            icon="🏠"
          />

          <InfoItem
            label="Hostel Code"
            value={hostel.code}
            icon="🔖"
          />

          <InfoItem
            label="Floor"
            value={
              floor?.floor_name ||
              (floor?.floor_number !== undefined
                ? `Floor ${floor.floor_number}`
                : null)
            }
            icon="🏢"
          />

          <InfoItem
            label="Room Number"
            value={room?.room_number}
            icon="🚪"
          />

          <InfoItem
            label="Room Type"
            value={room?.room_type}
            icon="🛏️"
          />

          <InfoItem
            label="Bed Number"
            value={bed?.bed_number}
            icon="🛌"
          />

          <InfoItem
            label="Total Beds"
            value={room?.total_beds}
            icon="🛏️"
          />

          <InfoItem
            label="Occupied Beds"
            value={room?.occupied_beds}
            icon="👥"
          />

          <InfoItem
            label="Room Status"
            value={room?.status}
            icon="📊"
          />

          <InfoItem
            label="Bed Status"
            value={bed?.status}
            icon="✅"
          />

          <InfoItem
            label="Allocation Date"
            value={
              allocation?.allocation_date
                ? new Date(
                    allocation.allocation_date
                  ).toLocaleDateString()
                : null
            }
            icon="📅"
          />

        </div>
      </div>

      {/* STUDENT DETAILS */}
      {student && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Student Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="Name"
              value={student.name}
              icon="👤"
            />

            <InfoItem
              label="Enrollment No."
              value={student.student_id}
              icon="🎓"
            />

            <InfoItem
              label="Department"
              value={student.department}
              icon="📚"
            />

            <InfoItem
              label="Course"
              value={student.course}
              icon="📖"
            />

            <InfoItem
              label="Year"
              value={student.year}
              icon="📅"
            />

            <InfoItem
              label="Semester"
              value={student.semester}
              icon="📝"
            />

          </div>
        </div>
      )}

      {/* ROOMMATES */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Roommates
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Students currently allocated to your room
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {roommates.length}{" "}
            {roommates.length === 1
              ? "Roommate"
              : "Roommates"}
          </span>
        </div>

        {roommates.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">
              No roommates currently allocated.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">

            {roommates.map((roommate) => (
              <div
                key={
                  roommate.id ||
                  roommate.student_id
                }
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
              >
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">

                    {roommate.photo_path ? (
                      <img
                        src={`http://localhost:5001/${roommate.photo_path}`}
                        alt={roommate.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      roommate.name
                        ?.charAt(0)
                        ?.toUpperCase() || "?"
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate font-semibold text-slate-800">
                      {roommate.name ||
                        "Unknown Student"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Enrollment Number: {roommate.student_id ||
                        "Enrollment unavailable"}
                    </p>

                  </div>

                  <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm">
                    <p className="text-[10px] uppercase text-slate-400">
                      Bed
                    </p>

                    <p className="font-bold text-indigo-600">
                      {roommate.bed?.bed_number ??
                        "—"}
                    </p>
                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">

                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-400">
                      Department
                    </p>

                    <p className="mt-0.5 truncate font-medium text-slate-700">
                      {roommate.department ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-400">
                      Course
                    </p>

                    <p className="mt-0.5 truncate font-medium text-slate-700">
                      {roommate.course ||
                        "Not available"}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>

    </section>
  );
};

// ==========================================================
// INFO ITEM
// ==========================================================

const InfoItem = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30">

      <div className="flex items-start gap-3">

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-sm">
            {icon}
          </div>
        )}

        <div className="min-w-0">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
              ? value
              : "Not available"}
          </p>

        </div>

      </div>

    </div>
  );
};

export default HostelDetails;