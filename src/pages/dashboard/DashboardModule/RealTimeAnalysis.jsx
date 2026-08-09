import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

/*
  Install:
    npm i recharts framer-motion lucide-react

  Usage:
    import RealTimeAnalytics from "./RealTimeAnalytics";

    <RealTimeAnalytics />

  Tailwind CSS is used for all styling.
*/

import {
  Activity,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Bell,
  Users,
  LogIn,
  LogOut,
  RefreshCw,
  Maximize2,
  MoreHorizontal,
} from "lucide-react";

const chartData = {
  Today: {
    movements: [18, 25, 20, 37, 29, 42, 34, 52, 44, 49, 61, 55, 73, 66],
    attendanceChart: [82, 86, 79, 91, 84, 88, 90, 86, 93, 89, 92, 95, 91, 96],
    alerts: [4, 8, 3, 13, 9, 15, 8, 11, 7, 14, 9, 12, 10, 18],
    totalMovements: "2,428",
    attendance: "92.5%",
    alerts: "24",
    entry: "1,246",
    exit: "1,182",
  },
  Week: {
    movements: [45, 58, 42, 76, 63, 88, 72, 94, 80, 105, 96, 112, 101, 125],
    attendanceChart: [88, 91, 87, 93, 90, 94, 92, 95, 91, 96, 94, 97, 95, 96],
    alerts: [9, 13, 8, 16, 11, 20, 14, 19, 12, 17, 15, 22, 18, 24],
    totalMovements: "16,842",
    attendance: "93.8%",
    alerts: "184",
    entry: "8,624",
    exit: "8,218",
  },
  Month: {
    movements: [80, 94, 76, 110, 98, 128, 119, 141, 132, 157, 149, 166, 153, 181],
    attendanceChart: [89, 92, 90, 94, 91, 95, 93, 96, 94, 97, 95, 96, 97, 98],
    alerts: [14, 19, 11, 24, 17, 28, 19, 25, 21, 30, 23, 31, 26, 35],
    totalMovements: "68,426",
    attendance: "94.1%",
    alerts: "642",
    entry: "34,712",
    exit: "33,714",
  },
};

const statConfig = [
  {
    key: "movements",
    chartKey: "movements",
    title: "Gate Activity",
    label: "Total Movements",
    icon: Activity,
    tone: "cyan",
  },
  {
    key: "attendance",
    chartKey: "attendanceChart",
    title: "Class Attendance",
    label: "Average Attendance",
    icon: Users,
    tone: "emerald",
  },
  {
    key: "alerts",
    chartKey: "alerts",
    title: "Alerts Triggered",
    label: "Total Alerts",
    icon: Bell,
    tone: "orange",
  },
];

const toneClasses = {
  cyan: {
    icon: "text-cyan-400 bg-cyan-400/10 border-cyan-400/10",
    line: "#38bdf8",
    glow: "rgba(56,189,248,.22)",
    text: "text-cyan-300",
  },
  emerald: {
    icon: "text-emerald-400 bg-emerald-400/10 border-emerald-400/10",
    line: "#34d399",
    glow: "rgba(52,211,153,.22)",
    text: "text-emerald-300",
  },
  orange: {
    icon: "text-orange-400 bg-orange-400/10 border-orange-400/10",
    line: "#fb923c",
    glow: "rgba(251,146,60,.22)",
    text: "text-orange-300",
  },
};

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/95 px-2.5 py-2 text-[10px] shadow-2xl backdrop-blur-xl">
      <p className="text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-white">
        {payload[0].value}
      </p>
    </div>
  );
}

function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35 }}
    >
      {value}
    </motion.span>
  );
}

export default function RealTimeAnalytics() {
  const [range, setRange] = useState("Today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const data = chartData[range];

  const pieData = useMemo(
    () => [
      { name: "Entry", value: Number(data.entry.replace(",", "")) },
      { name: "Exit", value: Number(data.exit.replace(",", "")) },
    ],
    [data]
  );

  const refresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <motion.section
      layout
      className={`
        relative w-full max-w-[470px] overflow-hidden rounded-2xl
        border border-slate-800/90
        bg-[radial-gradient(circle_at_50%_-30%,rgba(27,65,96,.22),transparent_55%),linear-gradient(145deg,#071321,#091827_55%,#07111e)]
        p-2.5 text-white
        shadow-[0_25px_70px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.025)]
        ${expanded ? "ring-1 ring-cyan-400/20" : ""}
      `}
    >
      {/* subtle animated glow */}
      <motion.div
        className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl"
        animate={{ x: [0, -18, 0], y: [0, 12, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="relative mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-red-400"
          >
            <Activity className="h-3.5 w-3.5" />
          </motion.span>

          <h2 className="text-[12px] font-semibold tracking-tight">
            Real-time Analytics
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={refresh}
            className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-slate-700 hover:text-white"
            title="Refresh analytics"
          >
            <motion.span
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.6 }}
            >
              <RefreshCw className="h-3 w-3" />
            </motion.span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-slate-700 hover:text-white"
            title="Expand analytics"
          >
            <Maximize2 className="h-3 w-3" />
          </button>

          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="h-7 appearance-none rounded-md border border-slate-800 bg-slate-900/70 pl-2 pr-6 text-[9px] text-slate-300 outline-none transition focus:border-cyan-500/40"
            >
              <option>Today</option>
              <option>Week</option>
              <option>Month</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {statConfig.map((stat, index) => {
          const Icon = stat.icon;
          const tone = toneClasses[stat.tone];

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              whileHover={{ y: -2, scale: 1.015 }}
              className="group relative overflow-hidden rounded-xl border border-slate-800/90 bg-slate-900/70 p-2"
            >
              <motion.div
                className="absolute -bottom-7 -right-7 h-16 w-16 rounded-full blur-2xl"
                style={{ background: tone.glow }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] text-slate-400">{stat.title}</p>
                  <span className={`rounded-md border p-1 ${tone.icon}`}>
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                </div>

                <p className="mt-1 text-[17px] font-bold tracking-tight">
                  <AnimatedNumber
                    value={
                      stat.key === "movements"
                        ? data.totalMovements
                        : stat.key === "attendance"
                          ? data.attendance
                          : data.alerts
                    }
                  />
                </p>

                <p className="text-[7px] text-slate-500">{stat.label}</p>

                <div className="mt-1.5 h-[35px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(Array.isArray(data[stat.chartKey]) ? data[stat.chartKey] : []).map(
                        (value, i) => ({
                          i,
                          value,
                        })
                      )}
                    >
                      <defs>
                        <linearGradient id={`fill-${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={tone.line} stopOpacity={0.32} />
                          <stop offset="100%" stopColor={tone.line} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={<MiniTooltip />}
                        cursor={{
                          stroke: tone.line,
                          strokeOpacity: 0.18,
                          strokeDasharray: "3 3",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={tone.line}
                        strokeWidth={1.5}
                        fill={`url(#fill-${stat.key})`}
                        dot={false}
                        activeDot={{
                          r: 3,
                          fill: tone.line,
                          stroke: "#071321",
                          strokeWidth: 1.5,
                        }}
                        isAnimationActive
                        animationDuration={1100}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Entry / Exit chart */}
      <motion.div
        layout
        className="relative mt-1.5 overflow-hidden rounded-xl border border-slate-800/90 bg-slate-900/65 p-2"
      >
        <div className="flex items-center gap-2">
          <div className="relative h-[62px] w-[84px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={30}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef5350" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[8px] font-bold text-white">2.4K</span>
              <span className="text-[5px] text-slate-500">MOVES</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_7px_rgba(59,130,246,.55)]" />
                <span className="text-[8px] text-slate-300">Entry</span>
              </div>
              <span className="text-[8px] text-slate-400">
                {data.entry} ({Math.round((Number(data.entry.replace(",", "")) / (Number(data.entry.replace(",", "")) + Number(data.exit.replace(",", "")))) * 100)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_7px_rgba(239,83,80,.5)]" />
                <span className="text-[8px] text-slate-300">Exit</span>
              </div>
              <span className="text-[8px] text-slate-400">
                {data.exit} ({Math.round((Number(data.exit.replace(",", "")) / (Number(data.entry.replace(",", "")) + Number(data.exit.replace(",", "")))) * 100)}%)
              </span>
            </div>
          </div>

          <button
            type="button"
            className="self-start rounded-md p-1 text-slate-600 transition hover:bg-slate-800 hover:text-slate-300"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Live status */}
      <div className="mt-1.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.8)]"
          />
          <span className="text-[7px] text-slate-500">Live data updating</span>
        </div>

        <div className="flex items-center gap-1 text-[7px] text-slate-600">
          <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
          Real-time
        </div>
      </div>

      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px]"
          >
            <div className="rounded-lg border border-slate-700 bg-slate-950/85 px-3 py-2 text-[9px] text-slate-300 shadow-xl">
              Updating analytics...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}