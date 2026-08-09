import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "../DashboardShell";

import {
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Clock3,
  CalendarDays,
  AlertTriangle,
  Activity,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* =========================================================
   DEPARTMENT DATA
========================================================= */

const defaultDepartments = [
  { name: "CSE", value: 92, students: 1240, color: "#4ade80" },
  { name: "ECE", value: 88, students: 820, color: "#38bdf8" },
  { name: "ME", value: 84, students: 760, color: "#facc15" },
  { name: "CE", value: 81, students: 690, color: "#a78bfa" },
  { name: "EEE", value: 79, students: 540, color: "#fb7185" },
];

/* =========================================================
   ATTENDANCE DATA
========================================================= */

const attendanceData = [
  {
    name: "Present",
    value: 3256,
    color: "#4ade80",
  },
  {
    name: "Absent",
    value: 521,
    color: "#fb7185",
  },
  {
    name: "Late",
    value: 61,
    color: "#facc15",
  },
];

/* =========================================================
   TREND DATA
========================================================= */

const trendData = [
  { day: "Mon", attendance: 81 },
  { day: "Tue", attendance: 84 },
  { day: "Wed", attendance: 82 },
  { day: "Thu", attendance: 87 },
  { day: "Fri", attendance: 85 },
  { day: "Sat", attendance: 89 },
  { day: "Sun", attendance: 85 },
];

/* =========================================================
   STAT CARD
========================================================= */

function AttendanceStat({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.015,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="
        group
        rounded-xl
        border border-slate-800
        bg-slate-900/65
        p-3
        shadow-lg
        transition
        hover:border-slate-700
      "
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-[10px] font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-[8px] text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`
            flex h-9 w-9 items-center justify-center
            rounded-lg ${bg}
            transition-transform
            duration-300
            group-hover:scale-110
          `}
        >
          <Icon className={`h-4 w-4 ${color}`} />
        </div>

      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AttendanceOverview({
  departments = defaultDepartments,
  dateLabel = "May 28, 2024",
  onDownload,
  onFilter,
}) {
  const [period, setPeriod] = useState("Today");
  const [refreshing, setRefreshing] = useState(false);
  const [showTrend, setShowTrend] = useState(true);

  /* =======================================================
     TOTAL
  ======================================================= */

  const total = useMemo(
    () =>
      attendanceData.reduce(
        (sum, item) => sum + item.value,
        0
      ),
    []
  );

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 900);
  };

  /* =======================================================
     ATTENDANCE PERCENTAGE
  ======================================================= */

  const attendancePercentage = Math.round(
    (attendanceData[0].value / total) * 100
  );

  /* =======================================================
     LOWEST DEPARTMENT
  ======================================================= */

  const lowestDepartment = [...departments].sort(
    (a, b) => a.value - b.value
  )[0];

  return (
    <DashboardShell title="Attendance Monitoring">

      <motion.section
        layout
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-2xl
          border border-slate-800/90
          bg-[radial-gradient(circle_at_15%_0%,rgba(27,77,79,.20),transparent_42%),linear-gradient(145deg,#071321,#091827_55%,#07111e)]
          p-4
          text-white
          shadow-[0_20px_55px_rgba(0,0,0,.36)]
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-emerald-500/10
                ring-1 ring-emerald-500/10
              "
            >
              <CalendarDays className="h-5 w-5 text-emerald-400" />
            </div>

            <div>

              <h2 className="text-base font-bold tracking-tight text-white">
                Attendance Overview
              </h2>

              <p className="mt-0.5 text-[9px] text-slate-500">
                Real-time attendance monitoring & department performance
              </p>

            </div>

          </div>


          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">

            {/* REFRESH */}

            <button
              type="button"
              onClick={refresh}
              title="Refresh"
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                border border-slate-700
                bg-slate-900/70
                text-slate-400
                transition
                hover:border-emerald-500/40
                hover:text-emerald-400
              "
            >

              <motion.span
                animate={{
                  rotate: refreshing ? 360 : 0,
                }}
                transition={{
                  duration: 0.7,
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </motion.span>

            </button>


            {/* PERIOD */}

            <div className="relative">

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value)
                }
                className="
                  h-8
                  appearance-none
                  rounded-lg
                  border border-slate-700
                  bg-slate-900/70
                  py-0
                  pl-3
                  pr-7
                  text-[9px]
                  font-medium
                  text-slate-300
                  outline-none
                  transition
                  focus:border-emerald-500/50
                "
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Semester</option>
              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute
                  right-2
                  top-1/2
                  h-3
                  w-3
                  -translate-y-1/2
                  text-slate-500
                "
              />

            </div>

          </div>

        </div>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-4 grid grid-cols-2 gap-2 xl:grid-cols-4">

          <AttendanceStat
            title="Present Students"
            value="3,256"
            subtitle="+4.2% from yesterday"
            icon={UserCheck}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />

          <AttendanceStat
            title="Absent Students"
            value="521"
            subtitle="10.9% of total"
            icon={UserX}
            color="text-rose-400"
            bg="bg-rose-500/10"
          />

          <AttendanceStat
            title="Late Arrivals"
            value="61"
            subtitle="1.6% of total"
            icon={Clock3}
            color="text-yellow-400"
            bg="bg-yellow-500/10"
          />

          <AttendanceStat
            title="Overall Attendance"
            value={`${attendancePercentage}%`}
            subtitle="Above target by 5%"
            icon={CheckCircle2}
            color="text-cyan-400"
            bg="bg-cyan-500/10"
          />

        </div>


        {/* =================================================
            MAIN ANALYTICS
        ================================================= */}

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.05fr_.95fr]">

          {/* =================================================
              LEFT - DONUT
          ================================================= */}

          <div
            className="
              rounded-xl
              border border-slate-800
              bg-slate-900/45
              p-3
            "
          >

            <div className="mb-2 flex items-center justify-between">

              <div>

                <h3 className="text-[11px] font-bold text-slate-200">
                  Attendance Distribution
                </h3>

                <p className="mt-0.5 text-[8px] text-slate-500">
                  Student attendance status
                </p>

              </div>

              <Activity className="h-3.5 w-3.5 text-emerald-400" />

            </div>


            <div className="flex min-h-[180px] items-center">

              {/* DONUT */}

              <div className="relative h-[170px] w-[170px] shrink-0">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={attendanceData}
                      dataKey="value"
                      innerRadius={54}
                      outerRadius={76}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive
                      animationDuration={1100}
                    >

                      {attendanceData.map(
                        (item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#071321",
                        border: "1px solid #26364a",
                        borderRadius: 10,
                        fontSize: 10,
                      }}
                      itemStyle={{
                        color: "#fff",
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>


                {/* CENTER */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >

                  <motion.span
                    key={attendancePercentage}
                    initial={{
                      opacity: 0,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="text-2xl font-bold text-white"
                  >
                    {attendancePercentage}%
                  </motion.span>

                  <span className="mt-0.5 text-[8px] text-slate-500">
                    Overall
                  </span>

                </div>

              </div>


              {/* LEGEND */}

              <div className="ml-4 flex-1 space-y-3">

                {attendanceData.map(
                  (item) => {

                    const percentage = Math.round(
                      (item.value / total) * 100
                    );

                    return (
                      <div
                        key={item.name}
                        className="group"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  item.color,
                              }}
                            />

                            <span className="text-[9px] font-medium text-slate-400">
                              {item.name}
                            </span>

                          </div>

                          <span className="text-[9px] font-bold text-slate-200">
                            {item.value.toLocaleString()}
                          </span>

                        </div>

                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">

                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${percentage}%`,
                            }}
                            transition={{
                              duration: 0.8,
                            }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                item.color,
                            }}
                          />

                        </div>

                        <p className="mt-1 text-[7px] text-slate-600">
                          {percentage}% of students
                        </p>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT - DEPARTMENT
          ================================================= */}

          <div
            className="
              rounded-xl
              border border-slate-800
              bg-slate-900/45
              p-3
            "
          >

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h3 className="text-[11px] font-bold text-slate-200">
                  Department Performance
                </h3>

                <p className="mt-0.5 text-[8px] text-slate-500">
                  Attendance percentage by department
                </p>

              </div>

              <button
                type="button"
                onClick={onFilter}
                className="
                  flex h-7 w-7
                  items-center justify-center
                  rounded-lg
                  border border-slate-700
                  text-slate-500
                  transition
                  hover:border-cyan-500/40
                  hover:text-cyan-400
                "
              >
                <Filter className="h-3 w-3" />
              </button>

            </div>


            <div className="space-y-3">

              {departments.map(
                (dept, index) => (

                  <motion.div
                    key={dept.name}
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.07,
                    }}
                    className="group"
                  >

                    <div className="mb-1.5 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <span className="text-[9px] font-bold text-slate-300">
                          {dept.name}
                        </span>

                        <span className="text-[7px] text-slate-600">
                          {dept.students} students
                        </span>

                      </div>

                      <span
                        className="text-[9px] font-bold"
                        style={{
                          color: dept.color,
                        }}
                      >
                        {dept.value}%
                      </span>

                    </div>


                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${dept.value}%`,
                        }}
                        transition={{
                          duration: 0.9,
                          delay: index * 0.07,
                        }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor:
                            dept.color,
                        }}
                      />

                    </div>

                  </motion.div>

                )
              )}

            </div>


            {/* LOW ATTENDANCE ALERT */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-2
                rounded-lg
                border border-yellow-500/10
                bg-yellow-500/5
                p-2
              "
            >

              <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />

              <p className="text-[8px] leading-relaxed text-slate-400">

                <span className="font-semibold text-yellow-400">
                  Attention:
                </span>{" "}
                {lowestDepartment.name} has the lowest attendance
                at {lowestDepartment.value}%.

              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            ATTENDANCE TREND
        ================================================= */}

        <AnimatePresence>

          {showTrend && (

            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="
                mt-3
                overflow-hidden
                rounded-xl
                border border-slate-800
                bg-slate-900/45
                p-3
              "
            >

              <div className="mb-2 flex items-center justify-between">

                <div>

                  <h3 className="text-[11px] font-bold text-slate-200">
                    Attendance Trend
                  </h3>

                  <p className="text-[8px] text-slate-500">
                    Last 7 days performance
                  </p>

                </div>

                <div className="flex items-center gap-1 text-[8px] font-semibold text-emerald-400">

                  <TrendingUp className="h-3 w-3" />

                  +4.2%

                </div>

              </div>


              <div className="h-[130px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart data={trendData}>

                    <defs>

                      <linearGradient
                        id="attendanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#4ade80"
                          stopOpacity={0.28}
                        />

                        <stop
                          offset="100%"
                          stopColor="#4ade80"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      tick={{
                        fill: "#64748b",
                        fontSize: 8,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[70, 100]}
                      tick={{
                        fill: "#64748b",
                        fontSize: 8,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#071321",
                        border: "1px solid #26364a",
                        borderRadius: 8,
                        fontSize: 9,
                      }}
                      labelStyle={{
                        color: "#94a3b8",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="#4ade80"
                      strokeWidth={2}
                      fill="url(#attendanceGradient)"
                      isAnimationActive
                      animationDuration={1000}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </motion.div>

          )}

        </AnimatePresence>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            mt-3
            flex
            flex-col
            gap-2
            border-t border-slate-800/70
            pt-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-3">

            <span className="flex items-center gap-1.5 text-[8px] text-slate-500">

              <TrendingUp className="h-3 w-3 text-emerald-400" />

              +4.2% vs previous period

            </span>

            <span className="hidden text-slate-700 sm:block">
              |
            </span>

            <span className="flex items-center gap-1.5 text-[8px] text-slate-500">

              <Users className="h-3 w-3 text-cyan-400" />

              {total.toLocaleString()} records

            </span>

          </div>


          <div className="flex items-center gap-3">

            <span className="text-[8px] text-slate-600">
              {dateLabel}
            </span>

            <button
              type="button"
              onClick={onDownload}
              className="
                flex
                items-center
                gap-1.5
                rounded-lg
                border border-slate-700
                bg-slate-900/60
                px-2.5
                py-1.5
                text-[8px]
                font-medium
                text-slate-400
                transition
                hover:border-cyan-500/40
                hover:text-white
              "
            >

              <Download className="h-3 w-3" />

              Export Report

            </button>

          </div>

        </div>

      </motion.section>

    </DashboardShell>
  );
}