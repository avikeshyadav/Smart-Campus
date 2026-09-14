import React, { useEffect, useState } from "react";
import { BASE_URI } from "../../../config/api";

const Attendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return sessionStorage.getItem("Student_access_token");
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${BASE_URI}/api/student/studentdashboard/attendance`,
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

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch attendance"
        );
      }

      setAttendance(data?.data || null);
    } catch (err) {
      console.error("Attendance API Error:", err);

      setError(
        err.message || "Unable to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="animate-pulse space-y-5">

          <div className="flex items-center justify-between">
            <div>
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-64 rounded bg-slate-200" />
            </div>

            <div className="h-12 w-12 rounded-xl bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
          </div>

          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />

        </div>
      </section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          Unable to load attendance
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={fetchAttendance}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!attendance) {
    return (
      <section className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-slate-500">
          No attendance information available.
        </p>
      </section>
    );
  }

  const student = attendance.student || {};
  const summary = attendance.summary || {};
  const today = attendance.today;

  const history = Array.isArray(attendance.history)
    ? attendance.history
    : [];

  const monthly = Array.isArray(attendance.monthly)
    ? attendance.monthly
    : [];

  const last7Days = Array.isArray(
    attendance.last7Days
  )
    ? attendance.last7Days
    : [];

  const totalAttendanceDays = Number(
    summary.totalAttendanceDays || 0
  );

  const currentMonthAttendance = Number(
    summary.currentMonthAttendance || 0
  );

  const isTodayPresent = Boolean(today);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Daily Attendance
          </h2>

          <p className="text-sm text-slate-500">
            Your daily attendance record
          </p>

          {student.name && (
            <p className="mt-1 text-xs text-slate-400">
              {student.name}

              {student.student_id
                ? ` • ${student.student_id}`
                : ""}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
          📅
        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">

        {/* Total Attendance */}

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">

          <div className="flex items-center justify-between">

            <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
              Total Days
            </p>

            <span className="text-lg">
              📅
            </span>

          </div>

          <p className="mt-2 text-2xl font-bold text-indigo-700">
            {totalAttendanceDays}
          </p>

          <p className="mt-1 text-xs text-indigo-500">
            Attendance marked
          </p>

        </div>

        {/* Current Month */}

        <div className="rounded-xl border border-green-100 bg-green-50 p-4">

          <div className="flex items-center justify-between">

            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              This Month
            </p>

            <span className="text-lg">
              🗓️
            </span>

          </div>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {currentMonthAttendance}
          </p>

          <p className="mt-1 text-xs text-green-600">
            Days present
          </p>

        </div>

        {/* Today */}

        <div
          className={`rounded-xl border p-4 ${
            isTodayPresent
              ? "border-green-100 bg-green-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >

          <div className="flex items-center justify-between">

            <p
              className={`text-xs font-medium uppercase tracking-wide ${
                isTodayPresent
                  ? "text-green-600"
                  : "text-slate-400"
              }`}
            >
              Today
            </p>

            <span className="text-lg">
              {isTodayPresent ? "✅" : "—"}
            </span>

          </div>

          <p
            className={`mt-2 text-lg font-bold ${
              isTodayPresent
                ? "text-green-700"
                : "text-slate-600"
            }`}
          >
            {isTodayPresent
              ? "Present"
              : "Not Marked"}
          </p>

          {today?.marked_at && (
            <p className="mt-1 text-xs text-slate-500">
              {formatTime(today.marked_at)}
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          TODAY ATTENDANCE
      ================================================= */}

      <div className="mb-6">

        <h3 className="mb-3 text-sm font-bold text-slate-800">
          Today's Attendance
        </h3>

        <div
          className={`rounded-xl border p-4 ${
            isTodayPresent
              ? "border-green-100 bg-green-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isTodayPresent
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isTodayPresent ? "✓" : "—"}
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  {isTodayPresent
                    ? "Attendance Marked"
                    : "Attendance Not Marked"}
                </p>

                {today?.marked_at && (
                  <p className="mt-1 text-xs text-slate-500">
                    Marked at{" "}
                    {formatTime(
                      today.marked_at
                    )}
                  </p>
                )}

              </div>

            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isTodayPresent
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isTodayPresent
                ? "Present"
                : "Not Marked"}
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          LAST 7 DAYS
      ================================================= */}

      <div className="mb-6">

        <div className="mb-3 flex items-center justify-between">

          <h3 className="text-sm font-bold text-slate-800">
            Last 7 Days
          </h3>

          <span className="text-xs text-slate-400">
            Daily record
          </span>

        </div>

        {last7Days.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No attendance found for the last 7 days.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">

            {last7Days.map((item, index) => (
              <DailyAttendanceItem
                key={item.date || index}
                item={item}
              />
            ))}

          </div>
        )}

      </div>

      {/* =================================================
          MONTHLY
      ================================================= */}

      {monthly.length > 0 && (
        <div className="mb-6">

          <div className="mb-3 flex items-center justify-between">

            <h3 className="text-sm font-bold text-slate-800">
              Monthly Attendance
            </h3>

            <span className="text-xs text-slate-400">
              Days marked
            </span>

          </div>

          <div className="space-y-2">

            {monthly.map((item, index) => (

              <div
                key={`${item.month}-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    📅
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {formatMonth(item.month)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Attendance marked
                    </p>
                  </div>

                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  {item.attendanceDays || 0} days
                </span>

              </div>

            ))}

          </div>

        </div>
      )}

      {/* =================================================
          FULL HISTORY
      ================================================= */}

      <div>

        <div className="mb-3 flex items-center justify-between">

          <h3 className="text-sm font-bold text-slate-800">
            Attendance History
          </h3>

          <span className="text-xs text-slate-400">
            Latest 100 days
          </span>

        </div>

        {history.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No attendance records found.
            </p>
          </div>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">

            {history.map((item, index) => (

              <DailyAttendanceItem
                key={item.id || index}
                item={item}
              />

            ))}

          </div>
        )}

      </div>

    </section>
  );
};

// =====================================================
// DAILY ATTENDANCE ITEM
// =====================================================

const DailyAttendanceItem = ({ item }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {formatDate(
              item.date || item.marked_at
            )}
          </p>

          {item.marked_at && (
            <p className="text-xs text-slate-400">
              Marked at{" "}
              {formatTime(item.marked_at)}
            </p>
          )}

        </div>

      </div>

      <div className="flex items-center gap-2">

        {item.confidence !== null &&
          item.confidence !== undefined && (
            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 sm:inline-block">
              Confidence{" "}
              {Number(item.confidence).toFixed(1)}
            </span>
          )}

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
          Present
        </span>

      </div>

    </div>
  );
};

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =====================================================
// FORMAT MONTH
// =====================================================

const formatMonth = (value) => {
  if (!value) {
    return "Unknown month";
  }

  const date = new Date(`${value}-01`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

export default Attendance;
