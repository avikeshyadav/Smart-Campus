import {
  CheckCircle2,
  Clock3,
  Fingerprint,
  Users,
} from "lucide-react";

export default function StatsGrid({
  total,
  present,
  late,
  uniqueStudents,
}) {
  const stats = [
    {
      label: "Today's Attendance",
      value: total,
      icon: Fingerprint,
      iconClass: "text-cyan-400",
      valueClass: "text-cyan-300",
    },
    {
      label: "Present",
      value: present,
      icon: CheckCircle2,
      iconClass: "text-emerald-400",
      valueClass: "text-emerald-400",
    },
    {
      label: "Late",
      value: late,
      icon: Clock3,
      iconClass: "text-yellow-300",
      valueClass: "text-yellow-300",
    },
    {
      label: "Students Detected",
      value: uniqueStudents,
      icon: Users,
      iconClass: "text-purple-400",
      valueClass: "text-purple-400",
    },
  ];

  return (
    <div className="mb-3 grid grid-cols-2 gap-1.5 md:grid-cols-4">
      {stats.map(
        ({
          label,
          value,
          icon: Icon,
          iconClass,
          valueClass,
        }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800/80 bg-slate-900/55 px-3 py-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[7px] uppercase tracking-wider text-slate-600">
                {label}
              </span>

              <Icon
                className={`h-3.5 w-3.5 ${iconClass}`}
              />
            </div>

            <p
              className={`mt-1.5 text-lg font-semibold ${valueClass}`}
            >
              {value}
            </p>

            <p className="text-[6px] uppercase tracking-wider text-slate-700">
              Today
            </p>
          </div>
        )
      )}
    </div>
  );
}
    