import React, { useState } from "react";
import {
  UserPlus,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Send,
  Settings,
  ChevronRight,
  Check,
} from "lucide-react";

const defaultActions = [
  {
    id: "student",
    label: "Add New Student",
    icon: UserPlus,
    tone: "purple",
  },
  {
    id: "faculty",
    label: "Add New Faculty",
    icon: GraduationCap,
    tone: "blue",
  },
  {
    id: "attendance",
    label: "Mark Attendance",
    icon: ClipboardCheck,
    tone: "green",
  },
  {
    id: "report",
    label: "Generate Report",
    icon: FileText,
    tone: "orange",
  },
  {
    id: "notification",
    label: "Send Notification",
    icon: Send,
    tone: "red",
  },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    tone: "gray",
  },
];

const tones = {
  purple: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-900/20",
  blue: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-900/20",
  green: "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 shadow-emerald-900/20",
  orange: "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-orange-900/20",
  red: "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-900/20",
  gray: "bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 shadow-slate-900/20",
};

export default function QuickActions({
  actions = defaultActions,
  title = "Quick Actions",
  onAction,
  onViewAll,
}) {
  const [active, setActive] = useState(null);

  const safeActions = actions?.length ? actions : defaultActions;

  const handleAction = (action) => {
    setActive(action.id);

    onAction?.(action);

    window.setTimeout(() => {
      setActive((current) => (current === action.id ? null : current));
    }, 900);
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_50%_0%,rgba(90,63,27,.16),transparent_45%),linear-gradient(145deg,#071321,#091827_55%,#07111e)] p-2.5 text-white shadow-[0_20px_55px_rgba(0,0,0,.35)]">
      <div className="mb-2 flex h-7 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400">ϟ</span>
          <h2 className="text-[12px] font-semibold tracking-tight">{title}</h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-1.5 text-[8px] text-slate-300 transition hover:border-yellow-400/30 hover:text-white"
        >
          View All
        </button>
      </div>

      <div className="space-y-1.5">
        {safeActions.slice(0, 6).map((action) => {
          const Icon = action.icon || Settings;
          const done = active === action.id;

          return (
            <button
              type="button"
              key={action.id}
              onClick={() => handleAction(action)}
              className={`group relative flex h-10 w-full items-center gap-2.5 overflow-hidden rounded-lg px-3 text-left text-[9px] font-medium text-white shadow-lg transition duration-200 hover:-translate-y-[1px] active:scale-[.985] ${tones[action.tone] || tones.gray}`}
            >
              <span className="relative z-10 grid h-5 w-5 place-items-center">
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>

              <span className="relative z-10 flex-1 truncate">
                {done ? "Action completed" : action.label}
              </span>

              <ChevronRight className="relative z-10 h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />

              <span className="pointer-events-none absolute -right-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-white/10 blur-2xl transition duration-500 group-hover:right-8" />
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[7px] text-slate-600">
        Administrative shortcuts
      </p>
    </section>
  );
}