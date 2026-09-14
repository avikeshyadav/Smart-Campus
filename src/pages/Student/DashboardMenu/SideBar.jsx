import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ student, onLogout }) => {
  const studentName =
    student?.name ||
    student?.full_name ||
    student?.student_name ||
    "Student";

  const studentEmail = student?.email || "";

  const studentDepartment =
    student?.department ||
    student?.course ||
    "Student";

  const avatarName = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const menuItems = [
    {
      icon: "🏠",
      text: "Dashboard",
      path: "/student",
    },
    {
      icon: "📊",
      text: "Attendance",
      path: "/student/attendance",
    },
    {
      icon: "🏫",
      text: "Hostel",
      path: "/student/hosteldetails",
    },
    {
      icon: "📅",
      text: "Timetable",
      path: "/student/timetable",
    },
    {
      icon: "🚌",
      text: "Bus Timing",
      path: "/student/bus",
    },
    {
      icon: "📢",
      text: "Notices",
      path: "/student/notices",
    },
  ];

  const accountItems = [
    {
      icon: "👤",
      text: "Profile",
      path: "/student/profile",
    },
    {
      icon: "⚙️",
      text: "Settings",
      path: "/student/settings",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[260px] flex-col bg-slate-950 text-white shadow-xl lg:flex">

      {/* ================================
          LOGO
      ================================= */}

      <div className="flex h-[72px] shrink-0 items-center border-b border-slate-800 px-5">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold shadow-lg shadow-indigo-600/20">
          S
        </div>

        <div className="ml-3 min-w-0">

          <h1 className="truncate text-sm font-bold">
            Smart Campus
          </h1>

          <p className="text-xs text-slate-400">
            Student Portal
          </p>

        </div>

      </div>

      {/* ================================
          NAVIGATION
      ================================= */}

      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-1">

          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              text={item.text}
              path={item.path}
            />
          ))}

        </nav>

        {/* ================================
            ACCOUNT
        ================================= */}

        <div className="my-5 border-t border-slate-800" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Account
        </p>

        <nav className="space-y-1">

          {accountItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              text={item.text}
              path={item.path}
            />
          ))}

        </nav>

        {/* ================================
            AI ASSISTANT
        ================================= */}

        <div className="mt-5 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-3">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              🤖
            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold">
                AI Assistant
              </p>

              <p className="text-[10px] text-slate-400">
                Ask anything
              </p>

            </div>

          </div>

          <NavLink
            to="/student/ai"
            className="mt-3 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-semibold transition hover:bg-indigo-500"
          >
            Open Assistant
          </NavLink>

        </div>

      </div>

      {/* ================================
          LOGOUT
      ================================= */}

      <div className="shrink-0 border-t border-slate-800 p-3">

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-red-600 hover:text-white"
        >

          <span className="text-base">
            🚪
          </span>

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
};


// =====================================
// SIDEBAR ITEM
// =====================================

const SidebarItem = ({
  icon,
  text,
  path,
}) => {
  return (
    <NavLink
      to={path}
      end={path === "/student"}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
          isActive
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <span className="flex w-6 justify-center text-base">
        {icon}
      </span>

      <span>
        {text}
      </span>
    </NavLink>
  );
};

export default Sidebar;