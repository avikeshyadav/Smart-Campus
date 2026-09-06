import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, Users, CalendarCheck, ShoppingCart,
  Settings, BedDouble, UserRound, FileBarChart, Building2, Plus,
  ArrowRightLeft, Search, Bell, ChevronDown
} from "lucide-react";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Academic", icon: GraduationCap, to: "#" },
  { label: "Students", icon: Users, to: "#" },
  { label: "Attendance Monitor", icon: CalendarCheck, to: "#" },
  { label: "Accounts", icon: ShoppingCart, to: "#" },
  { label: "Admin Control", icon: Settings, to: "#" },
];

const hostel = [
  { label: "Overview", icon: Building2, to: "/rooms" },
  { label: "All Rooms", icon: Building2, to: "/rooms/all" },
  { label: "Add Room", icon: Plus, to: "/rooms/add" },
  { label: "Room Changes", icon: ArrowRightLeft, to: "/rooms/changes" },
  { label: "Beds", icon: BedDouble, to: "/rooms/beds" },
  { label: "Residents", icon: UserRound, to: "/rooms/residents" },
  { label: "Reports", icon: FileBarChart, to: "/rooms/reports" },
];

function Item({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
          isActive
            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/50"
            : "text-slate-400 hover:text-white hover:bg-slate-800/70"
        }`
      }
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function RoomsLayout() {
  return (
    <div className="min-h-screen bg-[#030817] text-white flex">
      <aside className="w-[245px] shrink-0 border-r border-slate-800 bg-[#050b1c] p-3">
        <div className="h-16 flex items-center gap-3 px-3 border-b border-slate-800 mb-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 grid place-items-center">
            <Building2 className="text-cyan-300" />
          </div>
          <div>
            <div className="font-bold tracking-wide">Smart Campus</div>
            <div className="text-[10px] text-cyan-400 tracking-[3px]">STUDENT VISION</div>
          </div>
        </div>

        <div className="space-y-1">
          {nav.map((x) => <Item key={x.label} item={x} />)}
        </div>

        <div className="mt-7 mb-2 px-3 text-[10px] text-slate-500 tracking-[2px]">
          HOSTEL MANAGEMENT
        </div>

        <div className="space-y-1">
          {hostel.map((x) => <Item key={x.label} item={x} />)}
        </div>

        <div className="mt-8">
          <Item item={{ label: "Settings", icon: Settings, to: "#" }} />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-[78px] border-b border-slate-800 flex items-center justify-between px-7 bg-[#040a19]">
          <div>
            <div className="text-cyan-400 text-[11px] tracking-[4px] uppercase">Hostel Management</div>
            <h1 className="text-xl font-bold">Rooms</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex w-[330px] h-11 rounded-xl bg-[#0b1428] border border-slate-700 items-center px-4 gap-3">
              <Search size={18} className="text-slate-500" />
              <input className="bg-transparent outline-none w-full text-sm" placeholder="Search students, rooms, beds..." />
              <kbd className="text-[10px] text-slate-500">⌘ K</kbd>
            </div>
            <button className="h-11 w-11 rounded-xl border border-slate-700 bg-[#0b1428] grid place-items-center relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] grid place-items-center">9</span>
            </button>
            <div className="hidden sm:flex items-center gap-3 border border-slate-700 bg-[#0b1428] rounded-xl px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-slate-600 grid place-items-center text-xs">AK</div>
              <div>
                <div className="text-sm font-semibold">AVIKESH KUMAR</div>
                <div className="text-[10px] text-slate-400">ADMINISTRATOR</div>
              </div>
              <ChevronDown size={16} className="text-slate-500" />
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
