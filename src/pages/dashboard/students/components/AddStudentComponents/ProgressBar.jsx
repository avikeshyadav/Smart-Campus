import { motion } from "framer-motion";

export default function ProgressBar({ value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[7px] uppercase tracking-wider text-slate-600">
          Registration Progress
        </span>

        <span className="text-[8px] font-bold text-emerald-400">
          {value}%
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
