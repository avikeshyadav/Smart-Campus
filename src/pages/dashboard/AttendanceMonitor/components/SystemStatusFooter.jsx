    import {
  Activity,
  Cloud,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

export default function SystemStatusFooter({
  monitorOnline,
  total,
  lastUpdated,
}) {
  const items = [
    {
      icon: Activity,
      label: "Attendance API",
      value: monitorOnline
        ? "Operational"
        : "Offline",
      iconClass: "text-purple-400",
      valueClass: monitorOnline
        ? "text-emerald-400"
        : "text-red-400",
    },
    {
      icon: Cloud,
      label: "Database",
      value: monitorOnline
        ? "Connected"
        : "Disconnected",
      iconClass: "text-blue-400",
      valueClass: monitorOnline
        ? "text-emerald-400"
        : "text-red-400",
    },
    {
      icon: Fingerprint,
      label: "Face Engine",
      value: "Ready",
      iconClass: "text-purple-400",
      valueClass: "text-emerald-400",
    },
    {
      icon: ShieldCheck,
      label: "Security",
      value: "Protected",
      iconClass: "text-yellow-300",
      valueClass: "text-yellow-300",
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-4">
      {items.map(
        ({
          icon: Icon,
          label,
          value,
          iconClass,
          valueClass,
        }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-800/70 bg-slate-900/35 px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5">
              <Icon
                className={`h-3 w-3 ${iconClass}`}
              />

              <span className="text-[7px] text-slate-500">
                {label}
              </span>
            </div>

            <p
              className={`mt-1 text-[8px] font-semibold ${valueClass}`}
            >
              {value}
            </p>
          </div>
        )
      )}
    </div>
  );
}
