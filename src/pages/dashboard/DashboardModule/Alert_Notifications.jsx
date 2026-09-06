import React from "react";
import {
  Bell,
  ShieldAlert,
  UserX,
  UserRoundX,
  MonitorCog,
  CameraOff,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const defaultAlerts = [
  {
    id: 1,
    type: "danger",
    title: "Unauthorized Access Attempt",
    description: "Main Gate - 11:01 AM",
    priority: "High Priority",
    time: "1m ago",
    icon: ShieldAlert,
  },
  {
    id: 2,
    type: "info",
    title: "Student Not in Campus",
    description: "Classroom 102 - 10:45 AM",
    priority: "Medium",
    time: "16m ago",
    icon: UserX,
  },
  {
    id: 3,
    type: "warning",
    title: "Low Attendance Alert",
    description: "More than 20% students absent",
    priority: "Medium",
    time: "1h ago",
    icon: UserRoundX,
  },
  {
    id: 4,
    type: "info",
    title: "System Update",
    description: "All systems are running normally",
    priority: "Info",
    time: "2h ago",
    icon: MonitorCog,
  },
  {
    id: 5,
    type: "danger",
    title: "Camera Offline",
    description: "Camera 12 - Block B",
    priority: "Low",
    time: "3h ago",
    icon: CameraOff,
  },
];

const styles = {
  danger: {
    row: "border-red-500/10 bg-red-500/[0.08] hover:bg-red-500/[0.13]",
    icon: "bg-red-500/10 text-red-400 border-red-500/20",
    badge: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  warning: {
    row: "border-amber-500/10 bg-amber-500/[0.08] hover:bg-amber-500/[0.13]",
    icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  info: {
    row: "border-blue-500/10 bg-blue-500/[0.07] hover:bg-blue-500/[0.12]",
    icon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
};

export default function AlertsNotifications({
  alerts = defaultAlerts,
  title = "Alerts & Notifications",
  onViewAll,
  onAlertClick,
}) {
  const safeAlerts = alerts?.length ? alerts : defaultAlerts;

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_40%_0%,rgba(73,45,67,.14),transparent_45%),linear-gradient(145deg,#071321,#091827_55%,#07111e)] p-2.5 text-white shadow-[0_20px_55px_rgba(0,0,0,.35)]">
      <div className="mb-2 flex h-7 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-orange-400" />
          <h2 className="text-[12px] font-semibold tracking-tight">{title}</h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-1.5 text-[8px] text-slate-300 transition hover:border-orange-400/30 hover:text-white"
        >
          View All
        </button>
      </div>

      <div className="space-y-1.5">
        {safeAlerts.slice(0, 5).map((alert) => {
          const Icon = alert.icon || ShieldAlert;
          const tone = styles[alert.type] || styles.info;

          return (
            <button
              type="button"
              key={alert.id}
              onClick={() => onAlertClick?.(alert)}
              className={`group flex w-full items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition duration-200 hover:-translate-y-[1px] ${tone.row}`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${tone.icon}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[9px] font-semibold text-slate-200">
                  {alert.title}
                </span>
                <span className="mt-0.5 block truncate text-[7px] text-slate-400">
                  {alert.description}
                </span>
              </span>

              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-md border px-1.5 py-1 text-[7px] font-semibold ${tone.badge}`}>
                  {alert.priority}
                </span>
                <span className="flex items-center gap-1 text-[7px] text-slate-500">
                  <Clock3 className="h-2.5 w-2.5" />
                  {alert.time}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[7px] text-slate-600">
        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
        Monitoring systems are active
      </div>
    </section>
  );
}