import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URI } from "../../config/api";
import { Percent } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return sessionStorage.getItem("Student_access_token");
  };

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        sessionStorage.removeItem("student");
        sessionStorage.removeItem("Student_access_token");

        navigate("/student/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `${BASE_URI}/api/student/studentdashboard/dashboarddata`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch dashboard data"
        );
      }

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to load dashboard"
        );
      }

      setDashboard(result?.data || null);
    } catch (error) {
      console.error(
        "Student Dashboard API Error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <DashboardSkeleton />;
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Dashboard Unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            We could not load your dashboard data.
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // BACKEND DATA
  // =====================================================

  const student = dashboard.student || {};
  const hostel = dashboard.hostel || null;

  const attendance = dashboard.attendance || {
    overall: null,
    present: 0,
    absent: null,
    total: null,
    currentMonth: 0,
    today: null,
  };

  const timetable = Array.isArray(
    dashboard.timetable
  )
    ? dashboard.timetable
    : [];

  const buses = Array.isArray(
    dashboard.buses
  )
    ? dashboard.buses
    : [];

  const notices = Array.isArray(
    dashboard.notices
  )
    ? dashboard.notices
    : [];

  const quickActions = Array.isArray(
    dashboard.quickActions
  )
    ? dashboard.quickActions
    : [];

  // =====================================================
  // STUDENT INFO
  // =====================================================

  const studentName =
    student.name || "Student";

  const studentDepartment =
    student.department ||
    student.course ||
    "Student";

  const studentRollNo =
    student.studentId ||
    "N/A";

  // =====================================================
  // HOSTEL INFO
  // =====================================================

  const hostelName =
    hostel?.name ||
    "Hostel Not Assigned";

  const hostelRoom =
    hostel?.room?.number ||
    "N/A";

  const hostelFloor =
    hostel?.floor?.number ??
    "N/A";

  const hostelBed =
    hostel?.bed?.number ||
    "N/A";

  // =====================================================
  // ATTENDANCE
  // =====================================================

  const attendancePercentage =
    attendance.overall !== null &&
    attendance.overall !== undefined
      ? Number(attendance.overall)
      : null;

  const presentDays = Number(
    attendance.present || 0
  );

  const currentMonthAttendance = Number(
    attendance.currentMonth || 0
  );

  const todayAttendance =
    attendance.today || null;

  const todayPresent =
    Boolean(todayAttendance);

  // Backend currently returns absent/total as null
  const hasAttendancePercentage =
    attendancePercentage !== null;

  // =====================================================
  // ATTENDANCE COLOR
  // =====================================================

  const getAttendanceColor = () => {
    if (!hasAttendancePercentage) {
      return {
        text: "text-slate-600",
        bg: "bg-slate-50",
        bar: "bg-slate-400",
      };
    }

    if (attendancePercentage >= 75) {
      return {
        text: "text-green-600",
        bg: "bg-green-50",
        bar: "bg-green-500",
      };
    }

    if (attendancePercentage >= 60) {
      return {
        text: "text-orange-600",
        bg: "bg-orange-50",
        bar: "bg-orange-500",
      };
    }

    return {
      text: "text-red-600",
      bg: "bg-red-50",
      bar: "bg-red-500",
    };
  };

  const attendanceColor =
    getAttendanceColor();

  // =====================================================
  // NOTICE COUNT
  // =====================================================

  const noticeCount = notices.length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">

        <div className="relative z-10">

          <p className="text-sm text-indigo-100">
            Student Dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Welcome back, {studentName}! 👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:text-base">
            Here is everything you need to know
            about your hostel, attendance, 
            timetable and campus services.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
              🎓 {studentDepartment}
            </span>

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
              🪪 {studentRollNo}
            </span>

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
              🏢 Room {hostelRoom}
            </span>

          </div>

        </div>

        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-white/5" />

      </section>

      {/* =================================================
          TOP STATS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <DashboardStat
          icon="🏢"
          title="Hostel Room"
          value={hostelRoom}
          subtitle={hostelName}
          color="bg-purple-100 text-purple-700"
        />

        <DashboardStat
          icon="📊"
          title="Attendance"
          value={
            hasAttendancePercentage
              ? `${attendancePercentage}%`
              : "Percentage : N/A"
          }
          subtitle={
            hasAttendancePercentage
              ? `${presentDays} days present`
              : `${presentDays} days marked`
          }
          color="bg-green-100 text-green-700"
        />

        <DashboardStat
          icon="📅"
          title="Today's Classes"
          value={timetable.length}
          subtitle={
            timetable.length > 0
              ? "Classes scheduled"
              : "No classes scheduled"
          }
          color="bg-blue-100 text-blue-700"
        />

        <DashboardStat
          icon="📢"
          title="New Notices"
          value={noticeCount}
          subtitle={
            noticeCount > 0
              ? "Latest updates"
              : "No active notices"
          }
          color="bg-orange-100 text-orange-700"
        />

      </section>

      {/* =================================================
          HOSTEL + TIMETABLE
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* HOSTEL */}

        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Hostel
              </h2>

              <p className="text-sm text-slate-500">
                Your accommodation details
              </p>
            </div>

            <span className="rounded-lg bg-indigo-50 px-3 py-2 text-xl">
              🏢
            </span>

          </div>

          {!hostel ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <div className="text-3xl">
                🏢
              </div>

              <p className="mt-3 font-semibold text-slate-700">
                Hostel Not Assigned
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No active hostel allocation found.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {hostel.name ||
                        "Hostel"}
                    </h3>

                    {hostel.code && (
                      <p className="mt-1 text-xs text-slate-500">
                        Code: {hostel.code}
                      </p>
                    )}
                  </div>

                  {hostel.status && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                      {hostel.status}
                    </span>
                  )}

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <InfoItem
                    label="Room"
                    value={hostelRoom}
                  />

                  <InfoItem
                    label="Floor"
                    value={
                      hostelFloor !==
                      "N/A"
                        ? hostelFloor
                        : "N/A"
                    }
                  />

                  <InfoItem
                    label="Bed"
                    value={hostelBed}
                  />

                  <InfoItem
                    label="Room Type"
                    value={
                      hostel.room?.type ||
                      "N/A"
                    }
                  />

                </div>

              </div>

              <div className="mt-4 rounded-xl border border-slate-100 p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs text-slate-500">
                      Occupancy
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {hostel.room?.occupiedBeds ??
                        0}
                      {" / "}
                      {hostel.room?.totalBeds ??
                        0}{" "}
                      beds
                    </p>
                  </div>

                  <span className="text-xl">
                    🛏️
                  </span>

                </div>

              </div>
            </>
          )}

          <button
            onClick={() =>
              navigate("/student/hostel")
            }
            className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            View Hostel Details
          </button>

        </section>

        {/* TIMETABLE */}

        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-2">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Today's Timetable
              </h2>

              <p className="text-sm text-slate-500">
                Your classes for today
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/student/timetable")
              }
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>

          </div>

          {timetable.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center">

              <div className="text-3xl">
                📅
              </div>

              <p className="mt-3 font-semibold text-slate-700">
                No classes scheduled
              </p>

              <p className="mt-1 text-xs text-slate-500">
                There are no timetable entries
                for today.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {timetable.map(
                (item, index) => (

                  <div
                    key={
                      item.id ||
                      index
                    }
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30"
                  >

                    <div className="h-12 w-1.5 rounded-full bg-indigo-500" />

                    <div className="min-w-[100px]">

                      <p className="text-sm font-bold text-slate-900">
                        {item.time ||
                          "Time N/A"}
                      </p>

                      {item.endTime && (
                        <p className="text-xs text-slate-400">
                          to {item.endTime}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-400">
                        {item.type ||
                          "Lecture"}
                      </p>

                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-semibold text-slate-900">
                        {item.subject ||
                          "Subject"}
                      </h3>

                      {item.room && (
                        <p className="mt-1 text-sm text-slate-500">
                          📍 {item.room}
                        </p>
                      )}

                    </div>

                    <span className="hidden rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 sm:block">
                      Scheduled
                    </span>

                  </div>

                )
              )}

            </div>
          )}

        </section>

      </div>

      {/* =================================================
          ATTENDANCE + BUS
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ATTENDANCE */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Attendance
              </h2>

              <p className="text-sm text-slate-500">
                Daily attendance status
              </p>
            </div>

            <div
              className={`rounded-xl px-4 py-2 ${attendanceColor.bg}`}
            >
              <span
                className={`text-lg font-bold ${attendanceColor.text}`}
              >
                {hasAttendancePercentage
                  ? `${attendancePercentage}%`
                  : "N/A"}
              </span>
            </div>

          </div>

          {/* PERCENTAGE */}

          <div className="mb-5">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-slate-500">
                Overall Attendance
              </span>

              <span className="font-semibold text-slate-900">
                {hasAttendancePercentage
                  ? `${attendancePercentage}%`
                  : "Not calculated"}
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              {hasAttendancePercentage ? (
                <div
                  className={`h-full rounded-full transition-all duration-500 ${attendanceColor.bar}`}
                  style={{
                    width: `${Math.min(
                      Math.max(
                        attendancePercentage,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              ) : (
                <div className="h-full w-0" />
              )}

            </div>

            {!hasAttendancePercentage && (
              <p className="mt-2 text-xs text-slate-400">
                Attendance percentage will be
                available when working/class
                days are configured.
              </p>
            )}

          </div>

          {/* SUMMARY */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            <AttendanceBox
              label="Present Days"
              value={presentDays}
              color="text-green-600 bg-green-50"
            />

            <AttendanceBox
              label="This Month"
              value={currentMonthAttendance}
              color="text-indigo-600 bg-indigo-50"
            />

            <AttendanceBox
              label="Absent"
              value={
                attendance.absent ??
                "N/A"
              }
              color="text-red-600 bg-red-50"
            />

          </div>

          {/* TODAY */}

          <div
            className={`mt-4 rounded-xl border p-4 ${
              todayPresent
                ? "border-green-100 bg-green-50"
                : "border-slate-100 bg-slate-50"
            }`}
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    todayPresent
                      ? "bg-green-100 text-green-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {todayPresent
                    ? "✓"
                    : "—"}
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Today's Attendance
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {todayPresent
                      ? "Attendance marked"
                      : "Attendance not marked"}
                  </p>

                </div>

              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  todayPresent
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {todayPresent
                  ? "Present"
                  : "Not Marked"}
              </span>

            </div>

            {todayAttendance?.marked_at && (
              <p className="mt-3 text-xs text-slate-500">
                Marked at{" "}
                {formatTime(
                  todayAttendance.marked_at
                )}
              </p>
            )}

            {todayAttendance?.confidence !==
              null &&
              todayAttendance?.confidence !==
                undefined && (
                <p className="mt-1 text-xs text-slate-400">
                  Confidence:{" "}
                  {Number(
                    todayAttendance.confidence
                  ).toFixed(1)}
                </p>
              )}

          </div>

          <button
            onClick={() =>
              navigate("/student/attendance")
            }
            className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Daily Attendance
          </button>

        </section>

        {/* BUS */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Bus Schedule
              </h2>

              <p className="text-sm text-slate-500">
                Campus transportation
              </p>
            </div>

            <span className="rounded-xl bg-green-50 px-3 py-2 text-xl">
              🚌
            </span>

          </div>

          {buses.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center">

              <div className="text-3xl">
                🚌
              </div>

              <p className="mt-3 font-semibold text-slate-700">
                No bus schedule available
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No active bus schedules were
                found.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {buses.map(
                (bus, index) => (

                  <div
                    key={
                      bus.id ||
                      index
                    }
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                      🚌
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="text-sm font-semibold text-slate-900">
                        {bus.route ||
                          "Bus Route"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {bus.time ||
                          "Time N/A"}
                      </p>

                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {bus.status ||
                        "Scheduled"}
                    </span>

                  </div>

                )
              )}

            </div>
          )}

          <button
            onClick={() =>
              navigate("/student/bus")
            }
            className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            View Full Bus Schedule
          </button>

        </section>

      </div>

      {/* =================================================
          NOTICES
      ================================================= */}

      <section className="rounded-2xl bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Important Notices
            </h2>

            <p className="text-sm text-slate-500">
              Latest college and hostel updates
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/student/notices")
            }
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All
          </button>

        </div>

        {notices.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center">

            <div className="text-3xl">
              📢
            </div>

            <p className="mt-3 font-semibold text-slate-700">
              No active notices
            </p>

            <p className="mt-1 text-xs text-slate-500">
              There are currently no notices
              available for you.
            </p>

          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">

            {notices.slice(0, 3).map(
              (notice, index) => (

                <NoticeCard
                  key={
                    notice.id ||
                    index
                  }
                  notice={notice}
                />

              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      {quickActions.length > 0 && (
        <section>

          <div className="mb-4">

            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="text-sm text-slate-500">
              Frequently used student services
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {quickActions.map(
              (action, index) => (

                <button
                  key={
                    action.title ||
                    index
                  }
                  onClick={() =>
                    action.path &&
                    navigate(action.path)
                  }
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    {action.icon ||
                      "➡️"}
                  </div>

                  <div>

                    <p className="font-semibold text-slate-900">
                      {action.title ||
                        "Open Service"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Open service
                    </p>

                  </div>

                </button>

              )
            )}

          </div>

        </section>
      )}

      {/* =================================================
          AI ASSISTANT
      ================================================= */}

      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-lg">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-2xl shadow-lg">
              🤖
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold">
                  Smart Campus AI Assistant
                </h2>

                <span className="rounded-full bg-green-500/20 px-2 py-1 text-[10px] font-semibold text-green-300">
                  ONLINE
                </span>

              </div>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Ask me about your timetable,
                attendance, hostel, bus timings,
                notices, complaints and campus
                services.
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              navigate("/student/assistant")
            }
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-indigo-50"
          >
            Ask AI Assistant →
          </button>

        </div>

      </section>

    </div>
  );
};

// =====================================================
// DASHBOARD STAT
// =====================================================

const DashboardStat = ({
  icon,
  title,
  value,
  subtitle,
  color,
}) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

// =====================================================
// INFO ITEM
// =====================================================

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-lg bg-white p-3">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || "N/A"}
      </p>

    </div>
  );
};

// =====================================================
// ATTENDANCE BOX
// =====================================================

const AttendanceBox = ({
  label,
  value,
  color,
}) => {
  return (
    <div
      className={`rounded-xl p-3 text-center ${color}`}
    >

      <p className="text-xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs">
        {label}
      </p>

    </div>
  );
};

// =====================================================
// NOTICE CARD
// =====================================================

const NoticeCard = ({
  notice,
}) => {
  const getNoticeColor = () => {
    switch (notice.priority) {
      case "urgent":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "low":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:shadow-sm">

      <div className="flex items-start gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getNoticeColor()}`}
        >
          📢
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <h3 className="text-sm font-semibold text-slate-900">
              {notice.title ||
                "Notice"}
            </h3>

            {notice.priority &&
              notice.priority !==
                "normal" && (
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ${getNoticeColor()}`}
                >
                  {notice.priority}
                </span>
              )}

          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {notice.message ||
              "No message available."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">

            {notice.type && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                {notice.type}
              </span>
            )}

            {notice.createdBy && (
              <span className="text-[10px] text-slate-400">
                By {notice.createdBy}
              </span>
            )}

          </div>

        </div>

      </div>

    </div>
  );
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
    return String(value);
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// =====================================================
// SKELETON
// =====================================================

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">

      <section className="animate-pulse rounded-2xl bg-slate-200 p-8">

        <div className="h-4 w-24 rounded bg-slate-300" />

        <div className="mt-3 h-8 w-72 rounded bg-slate-300" />

        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-slate-300" />

        <div className="mt-5 flex gap-3">

          <div className="h-9 w-32 rounded-full bg-slate-300" />
          <div className="h-9 w-28 rounded-full bg-slate-300" />
          <div className="h-9 w-28 rounded-full bg-slate-300" />

        </div>

      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          )
        )}

      </section>

      <div className="grid gap-6 xl:grid-cols-3">

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200 xl:col-span-2" />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />

      </div>

    </div>
  );
};

export default StudentDashboard;
