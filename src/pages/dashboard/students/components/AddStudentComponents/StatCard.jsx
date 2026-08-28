import { motion } from "framer-motion";
import StatusDot from "./StatusDot";

export default function StatCard({
  icon: Icon,
  label,
  value,
  subText,
  color = "text-emerald-400",
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="
        rounded-xl border border-slate-800/90
        bg-slate-900/55 p-3 transition
        hover:border-slate-700
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="
            grid h-7 w-7 place-items-center rounded-lg
            border border-slate-800 bg-slate-950/50
          ">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>

          <span className="text-[8px] uppercase tracking-wider text-slate-500">
            {label}
          </span>
        </div>

        <StatusDot />
      </div>

      <div className="mt-2 flex items-end justify-between">
        <span className={`text-xl font-bold ${color}`}>{value}</span>

        {subText && (
          <span className="text-[7px] text-slate-600">{subText}</span>
        )}
      </div>
    </motion.div>
  );
}
