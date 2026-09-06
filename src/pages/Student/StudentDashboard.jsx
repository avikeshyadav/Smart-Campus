import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URI } from "../../config/api";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ---------------------------------------
  // Get logged-in student
  // ---------------------------------------

  const getStudent = () => {
    try {
      const studentData = sessionStorage.getItem("student");

      if (!studentData) {
        return null;
      }

      return JSON.parse(studentData);
    } catch (error) {
      console.error("Student data parse error:", error);
      return null;
    }
  };

  const student = getStudent();

  // ---------------------------------------
  // If student session doesn't exist
  // ---------------------------------------

  if (!student) {
    sessionStorage.removeItem("student");
    sessionStorage.removeItem("Student_access_token");

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="mb-4 text-slate-600">
            Session expired. Please login again.
          </p>

          <button
            onClick={() => navigate("/student/login", { replace: true })}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // Student information
  // ---------------------------------------

  const studentName =
    student.name ||
    student.full_name ||
    student.student_name ||
    "Student";

  const studentEmail =
    student.email || "";

  const studentDepartment =
    student.department ||
    student.course ||
    "Student";

  // First letters for avatar
  const avatarName = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  // ---------------------------------------
  // Dashboard Stats
  // ---------------------------------------

  const stats = [
    {
      title: "Attendance",
      value: "92%",
      subtitle: "Good standing",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Assignments",
      value: "8",
      subtitle: "Pending",
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Courses",
      value: "6",
      subtitle: "This semester",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "CGPA",
      value: "8.7",
      subtitle: "Current score",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  // ---------------------------------------
  // Courses
  // ---------------------------------------

  const courses = [
    {
      name: "Data Structures",
      code: "CS301",
      teacher: "Dr. Sharma",
      progress: 78,
      color: "bg-blue-600",
    },
    {
      name: "Database Management",
      code: "CS302",
      teacher: "Prof. Verma",
      progress: 65,
      color: "bg-purple-600",
    },
    {
      name: "Web Development",
      code: "CS303",
      teacher: "Mr. Singh",
      progress: 85,
      color: "bg-green-600",
    },
  ];

  // ---------------------------------------
  // Assignments
  // ---------------------------------------

  const assignments = [
    {
      title: "React Project",
      subject: "Web Development",
      deadline: "Aug 25, 2026",
      status: "Pending",
    },
    {
      title: "SQL Queries",
      subject: "Database Management",
      deadline: "Aug 27, 2026",
      status: "Pending",
    },
    {
      title: "Binary Tree Assignment",
      subject: "Data Structures",
      deadline: "Aug 30, 2026",
      status: "Submitted",
    },
  ];

  // ---------------------------------------
  // Logout
  // ---------------------------------------

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      // Backend logout
      await fetch(`${BASE_URI}/api/student/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API Error:", error);
    } finally {
      // Remove frontend session
      sessionStorage.removeItem("student");
      sessionStorage.removeItem("Student_access_token");

      // Close sidebar
      setSidebarOpen(false);

      toast.success("Logged out successfully");

      // Redirect login
      navigate("/student/login", {
        replace: true,
      });

      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}

        <div className="flex h-16 items-center border-b border-slate-700 px-6">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold">
            S
          </div>

          <span className="ml-3 text-lg font-bold">
            Student Portal
          </span>

        </div>

        {/* Navigation */}

        <nav className="mt-6 px-3">

          <SidebarItem
            icon="🏠"
            text="Dashboard"
            active
          />

          <SidebarItem
            icon="📚"
            text="My Courses"
          />

          <SidebarItem
            icon="📝"
            text="Assignments"
          />

          <SidebarItem
            icon="📅"
            text="Timetable"
          />

          <SidebarItem
            icon="📊"
            text="Grades"
          />

          <SidebarItem
            icon="📢"
            text="Announcements"
          />

          <SidebarItem
            icon="💬"
            text="Messages"
          />

          <div className="my-5 border-t border-slate-700" />

          <SidebarItem
            icon="👤"
            text="Profile"
          />

          <SidebarItem
            icon="⚙️"
            text="Settings"
          />

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              🚪
            </span>

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>

        </nav>
      </aside>

      {/* =========================================
          MAIN
      ========================================== */}

      <div className="lg:pl-64">

        {/* =====================================
            HEADER
        ====================================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">

          {/* Mobile menu */}

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Desktop title */}

          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-slate-900">
              Dashboard
            </h1>
          </div>

          {/* Header Right */}

          <div className="ml-auto flex items-center gap-4">

            {/* Notification */}

            <button
              className="relative rounded-full p-2 hover:bg-slate-100"
              aria-label="Notifications"
            >
              🔔

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile */}

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold text-slate-900">
                  {studentName}
                </p>

                <p className="text-xs text-slate-500">
                  {studentDepartment}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                {avatarName || "S"}
              </div>

            </div>

          </div>

        </header>

        {/* =====================================
            CONTENT
        ====================================== */}

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Welcome */}

          <section className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">

            <p className="mb-1 text-sm text-indigo-100">
              Today
            </p>

            <h2 className="text-2xl font-bold sm:text-3xl">
              Welcome back, {studentName}! 👋
            </h2>

            <p className="mt-2 max-w-xl text-sm text-indigo-100 sm:text-base">
              Here's what's happening with your studies today.
            </p>

          </section>

          {/* Stats */}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-slate-500">
                      {stat.title}
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {stat.subtitle}
                    </p>

                  </div>

                  <div
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${stat.color}`}
                  >
                    ↗
                  </div>

                </div>

              </div>
            ))}

          </section>

          {/* Main Grid */}

          <div className="grid gap-6 xl:grid-cols-3">

            {/* Courses */}

            <section className="rounded-xl bg-white p-5 shadow-sm xl:col-span-2">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    My Courses
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your current semester courses
                  </p>

                </div>

                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  View all
                </button>

              </div>

              <div className="space-y-5">

                {courses.map((course) => (
                  <div
                    key={course.code}
                    className="rounded-lg border border-slate-200 p-4"
                  >

                    <div className="flex flex-col justify-between gap-3 sm:flex-row">

                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {course.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {course.code} • {course.teacher}
                        </p>

                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {course.progress}%
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full ${course.color}`}
                        style={{
                          width: `${course.progress}%`,
                        }}
                      />

                    </div>

                  </div>
                ))}

              </div>

            </section>

            {/* Today's Classes */}

            <section className="rounded-xl bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Today's Classes
                </h2>

                <p className="text-sm text-slate-500">
                  Your upcoming lectures
                </p>

              </div>

              <div className="space-y-4">

                <ClassItem
                  time="10:00 AM"
                  subject="Data Structures"
                  room="Room 204"
                  color="bg-blue-500"
                />

                <ClassItem
                  time="12:00 PM"
                  subject="Database Management"
                  room="Lab 3"
                  color="bg-purple-500"
                />

                <ClassItem
                  time="02:30 PM"
                  subject="Web Development"
                  room="Room 105"
                  color="bg-green-500"
                />

              </div>

            </section>

          </div>

          {/* Bottom Grid */}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">

            {/* Assignments */}

            <section className="rounded-xl bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Assignments
                  </h2>

                  <p className="text-sm text-slate-500">
                    Track your upcoming work
                  </p>

                </div>

                <button className="text-sm font-semibold text-indigo-600">
                  View all
                </button>

              </div>

              <div className="divide-y divide-slate-100">

                {assignments.map((assignment) => (
                  <div
                    key={assignment.title}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {assignment.title}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {assignment.subject}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Due: {assignment.deadline}
                      </p>

                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        assignment.status ===
                        "Submitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {assignment.status}
                    </span>

                  </div>
                ))}

              </div>

            </section>

            {/* Notifications */}

            <section className="rounded-xl bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Recent Notifications
                </h2>

                <p className="text-sm text-slate-500">
                  Latest updates from your college
                </p>

              </div>

              <div className="space-y-4">

                <Notification
                  icon="📢"
                  title="Exam schedule released"
                  message="Mid-semester examination schedule is now available."
                  time="2 hours ago"
                />

                <Notification
                  icon="📚"
                  title="New assignment"
                  message="Your Web Development assignment has been posted."
                  time="5 hours ago"
                />

                <Notification
                  icon="🎓"
                  title="Attendance updated"
                  message="Your attendance has been updated for this week."
                  time="Yesterday"
                />

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
};

// =============================================
// SIDEBAR ITEM
// =============================================

const SidebarItem = ({
  icon,
  text,
  active = false,
}) => {
  return (
    <button
      type="button"
      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  );
};

// =============================================
// CLASS ITEM
// =============================================

const ClassItem = ({
  time,
  subject,
  room,
  color,
}) => {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-100 p-3">

      <div
        className={`w-1 rounded-full ${color}`}
      />

      <div>

        <p className="text-sm font-semibold text-slate-900">
          {subject}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {time} • {room}
        </p>

      </div>

    </div>
  );
};

// =============================================
// NOTIFICATION
// =============================================

const Notification = ({
  icon,
  title,
  message,
  time,
}) => {
  return (
    <div className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </div>

      <div>

        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {message}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {time}
        </p>

      </div>

    </div>
  );
};

export default StudentDashboard;