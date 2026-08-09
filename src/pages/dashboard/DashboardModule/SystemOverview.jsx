import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  Wifi,
} from "lucide-react";

const defaultMetrics = [
  { name: "Server CPU", value: 23, status: "Normal", color: "#4ade80", icon: Cpu },
  { name: "Memory Usage", value: 62, status: "Normal", color: "#4ade80", icon: MemoryStick },
  { name: "Storage", value: 78, status: "Good", color: "#2dd4bf", icon: HardDrive },
  { name: "Network", value: 91, status: "Excellent", color: "#facc15", icon: Wifi },
];

function Gauge({ value, color }) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-[72px] w-[72px]">
      <svg viewBox="0 0 80 80" className="-rotate-90 h-full w-full">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(51,65,85,.45)"
          strokeWidth="6"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 5px ${color}55)` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: .8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[13px] font-bold"
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}

export default function SystemOverview({
  metrics = defaultMetrics,
  onMetricClick,
  onRefresh,
}) {
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setLive((v) => !v), 1800);
    return () => clearInterval(timer);
  }, []);

  const refresh = () => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_50%_0%,rgba(28,86,102,.18),transparent_45%),linear-gradient(145deg,#071321,#091827_55%,#07111e)] p-2.5 text-white shadow-[0_20px_55px_rgba(0,0,0,.36)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-cyan-500/10 text-cyan-400">
            <Server className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[12px] font-semibold">System Overview</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[7px] text-slate-500">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                live ? "shadow-[0_0_7px_rgba(74,222,128,.9)]" : ""
              }`}
            />
            Live
          </span>
          <button
            type="button"
            onClick={refresh}
            className="grid h-6 w-6 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-500 hover:text-white"
          >
            <motion.span animate={{ rotate: refreshing ? 360 : 0 }}>
              <RefreshCw className="h-3 w-3" />
            </motion.span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {metrics.slice(0, 4).map((metric, index) => {
          const Icon = metric.icon || Activity;

          return (
            <motion.button
              type="button"
              key={metric.name}
              onClick={() => onMetricClick?.(metric)}
              whileHover={{ y: -2 }}
              className="group rounded-xl border border-slate-800/90 bg-slate-900/55 p-2 text-center transition hover:border-slate-700"
            >
              <div className="flex items-center justify-center gap-1">
                <Icon className="h-2.5 w-2.5 text-slate-500" />
                <p className="truncate text-[7px] text-slate-400">{metric.name}</p>
              </div>

              <div className="mt-1 flex justify-center">
                <Gauge value={metric.value} color={metric.color} />
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1">
                {metric.status === "Normal" || metric.status === "Excellent" ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                )}
                <span
                  className={`text-[7px] ${
                    metric.status === "Excellent"
                      ? "text-yellow-300"
                      : metric.status === "Good"
                        ? "text-cyan-300"
                        : "text-emerald-400"
                  }`}
                >
                  {metric.status}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-slate-800/70 bg-slate-900/35 px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <Cloud className="h-3 w-3 text-blue-400" />
            <span className="text-[7px] text-slate-500">Cloud Backup</span>
          </div>
          <p className="mt-1 text-[8px] font-semibold text-emerald-400">Synced</p>
        </div>

        <div className="rounded-lg border border-slate-800/70 bg-slate-900/35 px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-purple-400" />
            <span className="text-[7px] text-slate-500">API Status</span>
          </div>
          <p className="mt-1 text-[8px] font-semibold text-emerald-400">Operational</p>
        </div>

        <div className="rounded-lg border border-slate-800/70 bg-slate-900/35 px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3 text-cyan-400" />
            <span className="text-[7px] text-slate-500">Cameras</span>
          </div>
          <p className="mt-1 text-[8px] font-semibold text-emerald-400">24 / 24 Online</p>
        </div>
      </div>
    </section>
  );
}