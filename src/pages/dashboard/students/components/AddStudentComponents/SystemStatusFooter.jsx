import {
  Activity,
  Cloud,
  Fingerprint,
  Zap,
} from "lucide-react";

const statusItems = [
  {
    icon: Activity,
    label: "API Status",
    value: "Operational",
    iconClass: "text-purple-400",
    valueClass: "text-emerald-400",
  },
  {
    icon: Cloud,
    label: "Database",
    value: "Connected",
    iconClass: "text-blue-400",
    valueClass: "text-emerald-400",
  },
  {
    icon: Fingerprint,
    label: "Face Engine",
    value: "Ready",
    iconClass: "text-purple-400",
    valueClass: "text-emerald-400",
  },
  {
    icon: Zap,
    label: "Security",
    value: "Protected",
    iconClass: "text-yellow-300",
    valueClass: "text-yellow-300",
  },
];

export default function SystemStatusFooter() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-4">
      {statusItems.map(({ icon: Icon, label, value, iconClass, valueClass }) => (
        <div
          key={label}
          className="
            rounded-lg border border-slate-800/70
            bg-slate-900/35 px-2.5 py-2
          "
        >
          <div className="flex items-center gap-1.5">
            <Icon className={`h-3 w-3 ${iconClass}`} />
            <span className="text-[7px] text-slate-500">{label}</span>
          </div>

          <p className={`mt-1 text-[8px] font-semibold ${valueClass}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
