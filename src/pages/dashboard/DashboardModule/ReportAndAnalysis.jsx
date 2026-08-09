import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "../DashboardShell";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  FolderOpen,
  Search,
  Share2,
  Users,
  UserCheck,
  WalletCards,
  Award,
  Clock3,
  MoreHorizontal,
} from "lucide-react";

const defaultReports = [
  { id: 1, title: "Attendance Report", icon: UserCheck, tone: "purple", count: "156" },
  { id: 2, title: "Gate Entry Report", icon: Clock3, tone: "amber", count: "42" },
  { id: 3, title: "Student Report", icon: Users, tone: "blue", count: "1,284" },
  { id: 4, title: "Performance Report", icon: Award, tone: "pink", count: "89" },
  { id: 5, title: "Fee Collection Report", icon: WalletCards, tone: "green", count: "96%" },
  { id: 6, title: "Custom Report", icon: FileText, tone: "gray", count: "Create" },
];

const tones = {
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/15",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/15",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/15",
  pink: "bg-pink-500/10 text-pink-300 border-pink-500/15",
  green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/15",
  gray: "bg-slate-500/10 text-slate-300 border-slate-500/15",
};

export default function ReportsAnalytics({
  reports = defaultReports,
  onGenerate,
  onReportClick,
  onDownload,
}) {
  const [period, setPeriod] = useState("This Month");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filteredReports = useMemo(
    () =>
      reports.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
      ),
    [reports, query]
  );

  const stats = [
    ["Total Reports", "156"],
    ["Generated Today", "12"],
    ["This Month", "89"],
    ["Pending", "5"],
  ];

  return (
    <DashboardShell title={"Academic Reports"}>
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_50%_0%,rgba(41,59,103,.17),transparent_42%),linear-gradient(145deg,#071321,#091827_55%,#07111e)] p-2.5 text-white shadow-[0_20px_55px_rgba(0,0,0,.36)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-blue-500/10 text-blue-400">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[12px] font-semibold">Reports &amp; Analytics</h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDownload}
            className="grid h-6 w-6 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-500 hover:text-white"
          >
            <Download className="h-3 w-3" />
          </button>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-6 appearance-none rounded-md border border-slate-800 bg-slate-900/70 pl-2 pr-5 text-[8px] text-slate-300 outline-none"
            >
              <option>This Month</option>
              <option>This Week</option>
              <option>This Year</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {stats.map(([label, value], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * .06 }}
            className="rounded-xl border border-slate-800/90 bg-slate-900/65 p-2"
          >
            <p className="text-[7px] text-slate-500">{label}</p>
            <motion.p
              key={`${period}-${value}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-[16px] font-bold"
            >
              {value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports..."
            className="h-7 w-full rounded-lg border border-slate-800 bg-slate-900/60 pl-7 pr-2 text-[8px] text-slate-300 outline-none placeholder:text-slate-600 focus:border-blue-500/40"
          />
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-[8px] font-semibold text-white transition hover:bg-blue-500"
        >
          <FolderOpen className="h-3 w-3" />
          Generate
        </button>
      </div>

      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {filteredReports.map((report, index) => {
          const Icon = report.icon || FileText;
          const isSelected = selected === report.id;

          return (
            <motion.button
              type="button"
              key={report.id}
              onClick={() => {
                setSelected(report.id);
                onReportClick?.(report);
              }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: .98 }}
              initial={{ opacity: 0, scale: .96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * .045 }}
              className={`group relative min-h-[65px] overflow-hidden rounded-xl border bg-slate-900/55 p-2 text-left transition ${
                isSelected
                  ? "border-blue-400/40 ring-1 ring-blue-400/10"
                  : "border-slate-800/90 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className={`grid h-7 w-7 place-items-center rounded-lg border ${tones[report.tone] || tones.gray}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <MoreHorizontal className="h-3 w-3 text-slate-700 group-hover:text-slate-500" />
              </div>

              <p className="mt-1 truncate text-[7px] font-medium text-slate-300">
                {report.title}
              </p>
              <p className="mt-0.5 text-[6px] text-slate-600">{report.count}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-800/70 pt-1.5 text-[7px] text-slate-600">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-2.5 w-2.5" />
          {period}
        </span>
        <span className="flex items-center gap-1">
          <Share2 className="h-2.5 w-2.5" />
          Share reports
        </span>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-1.5 rounded-lg border border-blue-500/10 bg-blue-500/[0.05] px-2 py-1.5 text-[7px] text-blue-200"
          >
            Report selected — choose Generate or Download to continue.
          </motion.div>
        )}
      </AnimatePresence>
    </section>
    </DashboardShell>
  );
}