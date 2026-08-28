import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "../DashboardShell";

import {
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  UserCheck,
  UserX,
  Clock3,
  CalendarDays,
  AlertTriangle,
  Activity,
  Search,
  X,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  SlidersHorizontal,
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

import { BASE_URI } from "../../../config/api";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  Present: "#4ade80",
  Absent: "#fb7185",
  Late: "#facc15",
};

/* =========================================================
   EMPTY DATA
========================================================= */

const EMPTY_DATA = {
  summary: {
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    attendancePercentage: 0,
    changePercentage: 0,
    targetDifference: 0,
  },

  departments: [],
  trend: [],
  students: [],
  date: null,
};

/* =========================================================
   RESPONSE NORMALIZER
========================================================= */

function normalizeAttendanceResponse(response) {
  const data = response?.data || response || {};

  const summary = data.summary || {};
  const stats = data.stats || {};

  const present = Number(
    summary.present ??
      summary.presentStudents ??
      stats.presentStudents ??
      data.present ??
      data.presentStudents ??
      0
  );

  const absent = Number(
    summary.absent ??
      summary.absentStudents ??
      stats.absentStudents ??
      data.absent ??
      data.absentStudents ??
      0
  );

  const late = Number(
    summary.late ??
      summary.lateStudents ??
      stats.lateStudents ??
      data.late ??
      data.lateStudents ??
      0
  );

  const total = Number(
    summary.total ??
      summary.totalStudents ??
      stats.totalStudents ??
      data.total ??
      data.totalStudents ??
      present + absent + late
  );

  const attendancePercentage =
    summary.attendancePercentage != null
      ? Number(summary.attendancePercentage)
      : stats.attendancePercentage != null
      ? Number(stats.attendancePercentage)
      : total > 0
      ? Math.round((present / total) * 100)
      : 0;

  /* =======================================================
     DEPARTMENTS
  ======================================================= */

  const departments = Array.isArray(data.departments)
    ? data.departments.map((dept, index) => ({
        name:
          dept.name ??
          dept.department ??
          dept.departmentName ??
          `Department ${index + 1}`,

        value: Number(
          dept.value ??
            dept.attendancePercentage ??
            dept.attendance ??
            dept.percentage ??
            0
        ),

        students: Number(
          dept.students ??
            dept.totalStudents ??
            dept.studentCount ??
            0
        ),

        present: Number(dept.present ?? 0),

        color:
          dept.color ||
          [
            "#4ade80",
            "#38bdf8",
            "#facc15",
            "#a78bfa",
            "#fb7185",
            "#22d3ee",
          ][index % 6],
      }))
    : [];

  /* =======================================================
     TREND
  ======================================================= */

  const trendSource = Array.isArray(data.trend)
    ? data.trend
    : Array.isArray(data.trendData)
    ? data.trendData
    : [];

  const trend = trendSource.map((item) => ({
    day:
      item.day ??
      item.date ??
      item.label ??
      "",

    date: item.date ?? null,

    attendance: Number(
      item.attendance ??
        item.attendancePercentage ??
        item.percentage ??
        item.value ??
        0
    ),

    present: Number(item.present ?? 0),
  }));

  /* =======================================================
     STUDENTS
     
     Backend currently sends:
       students: attendanceStudents
     
     Future compatibility:
       attendanceStudents
       records
       attendanceRecords
  ======================================================= */

  const studentSource = Array.isArray(data.students)
    ? data.students
    : Array.isArray(data.attendanceStudents)
    ? data.attendanceStudents
    : Array.isArray(data.records)
    ? data.records
    : Array.isArray(data.attendanceRecords)
    ? data.attendanceRecords
    : [];

  const students = studentSource.map((student) => ({
    id: student.id,

    name: student.name || "Unknown Student",

    student_id:
      student.student_id ??
      student.studentId ??
      "",

    mobile:
      student.mobile ??
      student.phone ??
      "",

    email:
      student.email ??
      "",

    course:
      student.course ??
      "",

    department:
      student.department ??
      "",

    year:
      student.year ??
      "",

    gender:
      student.gender ??
      "",

    status:
      student.status ??
      "Active",

    semester:
      student.semester ??
      "",

    dob:
      student.dob ??
      null,

    photo_path:
      student.photo_path ??
      student.photoPath ??
      student.image ??
      student.avatar_url ??
      "",

    attendance_id:
      student.attendance_id ??
      student.attendanceId ??
      null,

    attendance_student_id:
      student.attendance_student_id ??
      student.attendanceStudentId ??
      student.student_id ??
      null,

    date:
      student.date ??
      null,

    marked_at:
      student.marked_at ??
      student.markedAt ??
      null,

    confidence:
      student.confidence != null
        ? Number(student.confidence)
        : null,

    attendanceStatus:
      student.attendanceStatus ??
      student.attendance_status ??
      student.attendance ??
      "Present",
  }));

  return {
    summary: {
      present,
      absent,
      late,
      total,
      attendancePercentage,

      changePercentage: Number(
        summary.changePercentage ??
          summary.change ??
          data.changePercentage ??
          data.change ??
          0
      ),

      targetDifference: Number(
        summary.targetDifference ??
          summary.aboveTarget ??
          data.targetDifference ??
          0
      ),
    },

    departments,

    trend,

    students,

    date:
      data.date ??
      data.dateLabel ??
      null,
  };
}

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
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const normalized = String(status || "Present")
    .toLowerCase();

  let config = {
    label: "Present",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    icon: UserCheck,
  };

  if (normalized === "absent") {
    config = {
      label: "Absent",
      className:
        "border-rose-500/20 bg-rose-500/10 text-rose-400",
      icon: UserX,
    };
  }

  if (normalized === "late") {
    config = {
      label: "Late",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
      icon: Clock3,
    };
  }

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full border px-2 py-1
        text-[8px] font-semibold
        ${config.className}
      `}
    >
      <Icon className="h-3 w-3" />

      {config.label}
    </span>
  );
}

/* =========================================================
   STUDENT AVATAR
========================================================= */

function StudentAvatar({ student }) {
  const [imageError, setImageError] = useState(false);

  const photo = student?.photo_path;

  if (!photo || imageError) {
    return (
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-full
          bg-gradient-to-br
          from-cyan-500/20
          to-emerald-500/20
          ring-1 ring-slate-700
        "
      >
        <span className="text-xs font-bold text-cyan-400">
          {(student?.name || "?")
            .charAt(0)
            .toUpperCase()}
        </span>
      </div>
    );
  }

  const imageUrl = photo.startsWith("http")
    ? photo
    : `${BASE_URI}/${photo.replace(/^\/+/, "")}`;

  return (
    <img
      src={imageUrl}
      alt={student?.name || "Student"}
      onError={() => setImageError(true)}
      className="
        h-9 w-9 shrink-0
        rounded-full
        object-cover
        ring-1 ring-slate-700
      "
    />
  );
}

/* =========================================================
   STUDENT DETAILS MODAL
========================================================= */

function StudentDetailsModal({
  student,
  onClose,
}) {
  if (!student) return null;

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-US", {
      dateStyle: "medium",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
          fixed inset-0 z-[100]
          flex items-center justify-center
          bg-black/70
          p-4
          backdrop-blur-sm
        "
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.94,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.94,
            y: 20,
          }}
          className="
            max-h-[90vh]
            w-full max-w-2xl
            overflow-y-auto
            rounded-2xl
            border border-slate-700
            bg-[#071321]
            shadow-[0_25px_80px_rgba(0,0,0,.65)]
          "
        >
          {/* HEADER */}

          <div
            className="
              flex items-center justify-between
              border-b border-slate-800
              p-4
            "
          >
            <div>
              <h3 className="text-sm font-bold text-white">
                Student Attendance Details
              </h3>

              <p className="mt-1 text-[9px] text-slate-500">
                Complete student information
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                border border-slate-700
                text-slate-400
                transition
                hover:border-rose-500/40
                hover:text-rose-400
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* PROFILE */}

          <div className="p-5">
            <div
              className="
                flex flex-col gap-4
                rounded-xl
                border border-slate-800
                bg-slate-900/50
                p-4
                sm:flex-row
                sm:items-center
              "
            >
              <StudentAvatar student={student} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {student.name}
                  </h4>

                  <StatusBadge
                    status={student.attendanceStatus}
                  />
                </div>

                <p className="mt-1 text-[10px] text-slate-500">
                  Student ID:{" "}
                  <span className="text-slate-300">
                    {student.student_id || "—"}
                  </span>
                </p>
              </div>
            </div>

            {/* INFORMATION GRID */}

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DetailItem
                icon={GraduationCap}
                label="Course"
                value={student.course}
              />

              <DetailItem
                icon={Building2}
                label="Department"
                value={student.department}
              />

              <DetailItem
                icon={BookOpen}
                label="Year"
                value={student.year}
              />

              <DetailItem
                icon={BookOpen}
                label="Semester"
                value={student.semester}
              />

              <DetailItem
                icon={Phone}
                label="Mobile"
                value={student.mobile}
              />

              <DetailItem
                icon={Mail}
                label="Email"
                value={student.email}
              />

              <DetailItem
                icon={Users}
                label="Gender"
                value={student.gender}
              />

              <DetailItem
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDate(student.dob)}
              />
            </div>

            {/* ATTENDANCE INFO */}

            <div className="mt-4">
              <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Attendance Information
              </h4>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <InfoBox
                  label="Attendance Date"
                  value={formatDate(student.date)}
                />

                <InfoBox
                  label="Marked At"
                  value={formatDateTime(student.marked_at)}
                />

                <InfoBox
                  label="Confidence"
                  value={
                    student.confidence != null
                      ? `${student.confidence}%`
                      : "—"
                  }
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-lg
        border border-slate-800
        bg-slate-900/40
        p-3
      "
    >
      <div
        className="
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-lg
          bg-cyan-500/10
        "
      >
        <Icon className="h-3.5 w-3.5 text-cyan-400" />
      </div>

      <div className="min-w-0">
        <p className="text-[7px] uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[9px] font-medium text-slate-300">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({ label, value }) {
  return (
    <div
      className="
        rounded-lg
        border border-slate-800
        bg-slate-900/40
        p-3
      "
    >
      <p className="text-[7px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AttendanceOverview({
  dateLabel = "",
  onDownload,
  onFilter,
}) {
  const [period, setPeriod] = useState("Today");

  const [attendance, setAttendance] =
    useState(EMPTY_DATA);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [showTrend] = useState(true);

  /* =======================================================
     STUDENT FILTER STATE
  ======================================================= */

  const [studentSearch, setStudentSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [courseFilter, setCourseFilter] =
    useState("All");

  const [yearFilter, setYearFilter] =
    useState("All");

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  /* =======================================================
     FETCH ATTENDANCE
  ======================================================= */

  const fetchAttendance = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${BASE_URI}/api/attendance?period=${encodeURIComponent(
            period
          )}`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
            },

            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to fetch attendance data (${response.status})`
          );
        }

        const result = await response.json();

        const normalizedData =
          normalizeAttendanceResponse(result);

        setAttendance(normalizedData);

        setCurrentPage(1);
      } catch (err) {
        console.error(
          "Attendance API Error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load attendance data."
        );

        setAttendance(EMPTY_DATA);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = () => {
    setRefreshing(true);

    fetchAttendance({
      showLoader: false,
    });
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const {
    present,
    absent,
    late,
    total,
    attendancePercentage,
    changePercentage,
    targetDifference,
  } = attendance.summary;

  /* =======================================================
     PIE DATA
  ======================================================= */

  const attendanceData = useMemo(
    () => [
      {
        name: "Present",
        value: present,
        color: COLORS.Present,
      },

      {
        name: "Absent",
        value: absent,
        color: COLORS.Absent,
      },

      {
        name: "Late",
        value: late,
        color: COLORS.Late,
      },
    ],
    [present, absent, late]
  );

  /* =======================================================
     DEPARTMENT LIST
  ======================================================= */

  const departmentOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          attendance.students
            .map((student) =>
              String(
                student.department || ""
              ).trim()
            )
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [attendance.students]);

  /* =======================================================
     COURSE LIST
  ======================================================= */

  const courseOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          attendance.students
            .map((student) =>
              String(
                student.course || ""
              ).trim()
            )
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [attendance.students]);

  /* =======================================================
     YEAR LIST
  ======================================================= */

  const yearOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          attendance.students
            .map((student) =>
              String(
                student.year || ""
              ).trim()
            )
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [attendance.students]);

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const search = studentSearch
      .trim()
      .toLowerCase();

    return attendance.students.filter(
      (student) => {
        const matchesSearch =
          !search ||
          [
            student.name,
            student.student_id,
            student.mobile,
            student.email,
            student.course,
            student.department,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(search)
            );

        const studentStatus =
          String(
            student.attendanceStatus ||
              "Present"
          ).toLowerCase();

        const matchesStatus =
          statusFilter === "All" ||
          studentStatus ===
            statusFilter.toLowerCase();

        const matchesDepartment =
          departmentFilter === "All" ||
          student.department ===
            departmentFilter;

        const matchesCourse =
          courseFilter === "All" ||
          student.course === courseFilter;

        const matchesYear =
          yearFilter === "All" ||
          student.year === yearFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDepartment &&
          matchesCourse &&
          matchesYear
        );
      }
    );
  }, [
    attendance.students,
    studentSearch,
    statusFilter,
    departmentFilter,
    courseFilter,
    yearFilter,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    Math.ceil(
      filteredStudents.length / pageSize
    ),
    1
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedStudents = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * pageSize;

    return filteredStudents.slice(
      start,
      start + pageSize
    );
  }, [
    filteredStudents,
    safeCurrentPage,
    pageSize,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    studentSearch,
    statusFilter,
    departmentFilter,
    courseFilter,
    yearFilter,
    pageSize,
  ]);

  /* =======================================================
     LOWEST DEPARTMENT
  ======================================================= */

  const lowestDepartment = useMemo(() => {
    if (!attendance.departments.length) {
      return null;
    }

    return [...attendance.departments].sort(
      (a, b) => a.value - b.value
    )[0];
  }, [attendance.departments]);

  /* =======================================================
     DATE
  ======================================================= */

  const displayDate =
    attendance.date ||
    dateLabel ||
    new Date().toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setStudentSearch("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setCourseFilter("All");
    setYearFilter("All");
    setCurrentPage(1);
  };

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const exportStudentsCSV = () => {
    if (!filteredStudents.length) {
      return;
    }

    const headers = [
      "Name",
      "Student ID",
      "Mobile",
      "Email",
      "Course",
      "Department",
      "Year",
      "Semester",
      "Gender",
      "Status",
      "Attendance Date",
      "Marked At",
      "Confidence",
    ];

    const rows = filteredStudents.map(
      (student) => [
        student.name,
        student.student_id,
        student.mobile,
        student.email,
        student.course,
        student.department,
        student.year,
        student.semester,
        student.gender,
        student.attendanceStatus ||
          "Present",
        student.date,
        student.marked_at,
        student.confidence ?? "",
      ]
    );

    const escapeCSV = (value) => {
      const stringValue =
        value == null
          ? ""
          : String(value);

      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `attendance-${period
      .toLowerCase()
      .replace(/\s+/g, "-")}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <DashboardShell title="Attendance Monitoring">
        <div
          className="
            flex min-h-[300px]
            w-full items-center justify-center
            rounded-2xl
            border border-slate-800
            bg-slate-900/60
            text-slate-400
          "
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />

            <span className="text-sm">
              Loading attendance data...
            </span>
          </div>
        </div>
      </DashboardShell>
    );
  }

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

        <div
          className="
            mb-4
            flex flex-col gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
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
                Live attendance data from backend
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* REFRESH */}

            <button
              type="button"
              onClick={refresh}
              title="Refresh"
              disabled={refreshing}
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <motion.span
                animate={{
                  rotate: refreshing
                    ? 360
                    : 0,
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
                <option value="Today">
                  Today
                </option>

                <option value="This Week">
                  This Week
                </option>

                <option value="This Month">
                  This Month
                </option>

                <option value="This Semester">
                  This Semester
                </option>
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
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-4
              flex items-center gap-2
              rounded-lg
              border border-rose-500/20
              bg-rose-500/5
              p-3
            "
          >
            <AlertTriangle className="h-4 w-4 text-rose-400" />

            <p className="text-[9px] text-rose-300">
              {error}
            </p>

            <button
              type="button"
              onClick={refresh}
              className="
                ml-auto
                text-[9px]
                font-semibold
                text-rose-400
                hover:text-rose-300
              "
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
          <AttendanceStat
            title="Present Students"
            value={present.toLocaleString()}
            subtitle={
              changePercentage > 0
                ? `+${changePercentage}% from previous period`
                : "Current period"
            }
            icon={UserCheck}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />

          <AttendanceStat
            title="Absent Students"
            value={absent.toLocaleString()}
            subtitle={
              total > 0
                ? `${Math.round(
                    (absent / total) * 100
                  )}% of total`
                : "0% of total"
            }
            icon={UserX}
            color="text-rose-400"
            bg="bg-rose-500/10"
          />

          <AttendanceStat
            title="Late Arrivals"
            value={late.toLocaleString()}
            subtitle={
              total > 0
                ? `${Math.round(
                    (late / total) * 100
                  )}% of total`
                : "0% of total"
            }
            icon={Clock3}
            color="text-yellow-400"
            bg="bg-yellow-500/10"
          />

          <AttendanceStat
            title="Overall Attendance"
            value={`${attendancePercentage}%`}
            subtitle={
              targetDifference > 0
                ? `Above target by ${targetDifference}%`
                : targetDifference < 0
                ? `Below target by ${Math.abs(
                    targetDifference
                  )}%`
                : "Current attendance"
            }
            icon={CheckCircle2}
            color="text-cyan-400"
            bg="bg-cyan-500/10"
          />
        </div>

        {/* =================================================
            MAIN ANALYTICS
        ================================================= */}

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.05fr_.95fr]">
          {/* DONUT */}

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
                        background:
                          "#071321",
                        border:
                          "1px solid #26364a",
                        borderRadius: 10,
                        fontSize: 10,
                      }}
                      itemStyle={{
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div
                  className="
                    pointer-events-none
                    absolute inset-0
                    flex flex-col
                    items-center
                    justify-center
                  "
                >
                  <motion.span
                    key={
                      attendancePercentage
                    }
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

              <div className="ml-4 flex-1 space-y-3">
                {attendanceData.map(
                  (item) => {
                    const percentage =
                      total > 0
                        ? Math.round(
                            (item.value /
                              total) *
                              100
                          )
                        : 0;

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
                          {percentage}% of
                          students
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* DEPARTMENT */}

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
              {attendance.departments
                .length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-6 w-6 text-slate-700" />

                  <p className="mt-2 text-[9px] text-slate-500">
                    No department data
                    available
                  </p>
                </div>
              ) : (
                attendance.departments.map(
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
                        delay:
                          index * 0.07,
                      }}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-300">
                            {dept.name}
                          </span>

                          <span className="text-[7px] text-slate-600">
                            {dept.students.toLocaleString()}{" "}
                            students
                          </span>
                        </div>

                        <span
                          className="text-[9px] font-bold"
                          style={{
                            color:
                              dept.color,
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
                            delay:
                              index *
                              0.07,
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
                )
              )}
            </div>

            {lowestDepartment && (
              <div
                className="
                  mt-4
                  flex items-center gap-2
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
                  {lowestDepartment.name} has
                  the lowest attendance at{" "}
                  {lowestDepartment.value}%.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            TREND
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
                    Attendance performance
                  </p>
                </div>

                {changePercentage !==
                  0 && (
                  <div
                    className={`flex items-center gap-1 text-[8px] font-semibold ${
                      changePercentage >
                      0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3" />

                    {changePercentage >
                    0
                      ? "+"
                      : ""}
                    {changePercentage}%
                  </div>
                )}
              </div>

              <div className="h-[130px] w-full">
                {attendance.trend
                  .length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-[9px] text-slate-600">
                      No trend data
                      available
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={
                        attendance.trend
                      }
                    >
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
                            stopOpacity={
                              0.28
                            }
                          />

                          <stop
                            offset="100%"
                            stopColor="#4ade80"
                            stopOpacity={
                              0
                            }
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
                        domain={[0, 100]}
                        tick={{
                          fill: "#64748b",
                          fontSize: 8,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            "#071321",
                          border:
                            "1px solid #26364a",
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
                        animationDuration={
                          1000
                        }
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STUDENT ATTENDANCE SECTION
        ================================================= */}

        <div
          className="
            mt-3
            rounded-xl
            border border-slate-800
            bg-slate-900/45
            overflow-hidden
          "
        >
          {/* STUDENT HEADER */}

          <div
            className="
              flex flex-col gap-3
              border-b border-slate-800
              p-3
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-cyan-500/10
                  "
                >
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-[11px] font-bold text-slate-200">
                    Student Attendance
                  </h3>

                  <p className="text-[8px] text-slate-500">
                    Attendance records returned
                    from backend
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* SEARCH */}

              <div
                className="
                  relative
                  min-w-[220px]
                  flex-1
                  xl:w-[280px]
                  xl:flex-none
                "
              >
                <Search
                  className="
                    pointer-events-none
                    absolute left-2.5
                    top-1/2
                    h-3.5 w-3.5
                    -translate-y-1/2
                    text-slate-600
                  "
                />

                <input
                  value={studentSearch}
                  onChange={(e) =>
                    setStudentSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search name, ID, email, mobile..."
                  className="
                    h-8 w-full
                    rounded-lg
                    border border-slate-700
                    bg-slate-950/50
                    pl-8 pr-8
                    text-[9px]
                    text-slate-300
                    outline-none
                    placeholder:text-slate-600
                    focus:border-cyan-500/40
                  "
                />

                {studentSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setStudentSearch("")
                    }
                    className="
                      absolute right-2
                      top-1/2
                      -translate-y-1/2
                      text-slate-600
                      hover:text-slate-300
                    "
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* FILTER BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (value) => !value
                  )
                }
                className={`
                  flex h-8 items-center
                  gap-1.5 rounded-lg
                  border px-2.5
                  text-[9px] font-medium
                  transition
                  ${
                    showFilters
                      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 bg-slate-900/70 text-slate-400 hover:text-white"
                  }
                `}
              >
                <SlidersHorizontal className="h-3 w-3" />

                Filters

                {(statusFilter !==
                  "All" ||
                  departmentFilter !==
                    "All" ||
                  courseFilter !==
                    "All" ||
                  yearFilter !==
                    "All") && (
                  <span
                    className="
                      flex h-4 w-4
                      items-center justify-center
                      rounded-full
                      bg-cyan-500
                      text-[7px]
                      font-bold
                      text-slate-950
                    "
                  >
                    !
                  </span>
                )}
              </button>

              {/* EXPORT */}

              <button
                type="button"
                onClick={
                  exportStudentsCSV
                }
                disabled={
                  !filteredStudents.length
                }
                className="
                  flex h-8
                  items-center gap-1.5
                  rounded-lg
                  border border-emerald-500/20
                  bg-emerald-500/5
                  px-2.5
                  text-[9px]
                  font-medium
                  text-emerald-400
                  transition
                  hover:bg-emerald-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FileSpreadsheet className="h-3 w-3" />

                Export
              </button>
            </div>
          </div>

          {/* FILTER PANEL */}

          <AnimatePresence>
            {showFilters && (
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
                className="overflow-hidden"
              >
                <div
                  className="
                    grid grid-cols-1
                    gap-2
                    border-b border-slate-800
                    bg-slate-950/30
                    p-3
                    sm:grid-cols-2
                    xl:grid-cols-4
                  "
                >
                  {/* STATUS */}

                  <FilterSelect
                    label="Status"
                    value={statusFilter}
                    onChange={
                      setStatusFilter
                    }
                    options={[
                      "All",
                      "Present",
                      "Absent",
                      "Late",
                    ]}
                  />

                  {/* DEPARTMENT */}

                  <FilterSelect
                    label="Department"
                    value={
                      departmentFilter
                    }
                    onChange={
                      setDepartmentFilter
                    }
                    options={
                      departmentOptions
                    }
                  />

                  {/* COURSE */}

                  <FilterSelect
                    label="Course"
                    value={courseFilter}
                    onChange={
                      setCourseFilter
                    }
                    options={courseOptions}
                  />

                  {/* YEAR */}

                  <FilterSelect
                    label="Year"
                    value={yearFilter}
                    onChange={
                      setYearFilter
                    }
                    options={yearOptions}
                  />

                  <div className="sm:col-span-2 xl:col-span-4">
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="
                        text-[8px]
                        font-semibold
                        text-slate-500
                        hover:text-cyan-400
                      "
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESULTS BAR */}

          <div
            className="
              flex flex-col gap-2
              border-b border-slate-800
              px-3 py-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex items-center gap-3">
              <span className="text-[8px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-300">
                  {filteredStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-300">
                  {attendance.students.length}
                </span>{" "}
                records
              </span>

              {studentSearch && (
                <span className="text-[8px] text-cyan-400">
                  Search active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[8px] text-slate-600">
                Rows:
              </span>

              <select
                value={pageSize}
                onChange={(e) =>
                  setPageSize(
                    Number(e.target.value)
                  )
                }
                className="
                  h-6
                  rounded-md
                  border border-slate-700
                  bg-slate-950
                  px-1.5
                  text-[8px]
                  text-slate-400
                  outline-none
                "
              >
                <option value={10}>
                  10
                </option>

                <option value={25}>
                  25
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>
              </select>
            </div>
          </div>

          {/* TABLE */}

          {paginatedStudents.length ===
          0 ? (
            <div
              className="
                flex min-h-[220px]
                flex-col
                items-center
                justify-center
                p-6
                text-center
              "
            >
              <Users className="h-8 w-8 text-slate-700" />

              <p className="mt-3 text-[10px] font-semibold text-slate-500">
                No attendance records
                found
              </p>

              <p className="mt-1 max-w-sm text-[8px] text-slate-700">
                Try changing the search
                text or filters, or check
                whether attendance has been
                marked for this period.
              </p>

              {(studentSearch ||
                statusFilter !==
                  "All" ||
                departmentFilter !==
                  "All" ||
                courseFilter !==
                  "All" ||
                yearFilter !==
                  "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-3
                    rounded-lg
                    border border-cyan-500/20
                    bg-cyan-500/5
                    px-3 py-1.5
                    text-[8px]
                    font-semibold
                    text-cyan-400
                  "
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/30">
                      <th className="px-3 py-2 text-left text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Student
                      </th>

                      <th className="px-3 py-2 text-left text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Course / Dept
                      </th>

                      <th className="px-3 py-2 text-left text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Year
                      </th>

                      <th className="px-3 py-2 text-left text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Contact
                      </th>

                      <th className="px-3 py-2 text-left text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Status
                      </th>

                      <th className="px-3 py-2 text-left text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Marked At
                      </th>

                      <th className="px-3 py-2 text-right text-[7px] font-semibold uppercase tracking-wider text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedStudents.map(
                      (
                        student,
                        index
                      ) => (
                        <motion.tr
                          key={
                            student.attendance_id ||
                            `${student.id}-${index}`
                          }
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay:
                              index *
                              0.025,
                          }}
                          className="
                            group
                            border-b
                            border-slate-800/70
                            transition
                            hover:bg-slate-800/20
                          "
                        >
                          {/* STUDENT */}

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <StudentAvatar
                                student={
                                  student
                                }
                              />

                              <div className="min-w-0">
                                <p className="truncate text-[9px] font-semibold text-slate-200">
                                  {
                                    student.name
                                  }
                                </p>

                                <p className="mt-0.5 text-[7px] text-slate-600">
                                  ID:{" "}
                                  <span className="text-slate-500">
                                    {student.student_id ||
                                      "—"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* COURSE */}

                          <td className="px-3 py-3">
                            <p className="text-[8px] font-medium text-slate-300">
                              {student.course ||
                                "—"}
                            </p>

                            <p className="mt-0.5 text-[7px] text-slate-600">
                              {student.department ||
                                "No department"}
                            </p>
                          </td>

                          {/* YEAR */}

                          <td className="px-3 py-3">
                            <p className="text-[8px] text-slate-300">
                              {student.year ||
                                "—"}
                            </p>

                            <p className="mt-0.5 text-[7px] text-slate-600">
                              {student.semester
                                ? `Semester ${student.semester}`
                                : "—"}
                            </p>
                          </td>

                          {/* CONTACT */}

                          <td className="px-3 py-3">
                            <p className="text-[8px] text-slate-400">
                              {student.mobile ||
                                "—"}
                            </p>

                            <p className="mt-0.5 max-w-[160px] truncate text-[7px] text-slate-600">
                              {student.email ||
                                "—"}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-3 py-3">
                            <StatusBadge
                              status={
                                student.attendanceStatus
                              }
                            />

                            {student.confidence !=
                              null && (
                              <p className="mt-1 text-[7px] text-slate-600">
                                Confidence:{" "}
                                {
                                  student.confidence
                                }
                                %
                              </p>
                            )}
                          </td>

                          {/* TIME */}

                          <td className="px-3 py-3">
                            <p className="text-[8px] text-slate-400">
                              {student.marked_at
                                ? new Date(
                                    student.marked_at
                                  ).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute:
                                        "2-digit",
                                    }
                                  )
                                : "—"}
                            </p>

                            <p className="mt-0.5 text-[7px] text-slate-600">
                              {student.date ||
                                displayDate}
                            </p>
                          </td>

                          {/* ACTION */}

                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                              className="
                                inline-flex
                                h-7 w-7
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-700
                                text-slate-500
                                transition
                                hover:border-cyan-500/40
                                hover:bg-cyan-500/5
                                hover:text-cyan-400
                              "
                              title="View student"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              <div
                className="
                  flex flex-col gap-2
                  border-t border-slate-800
                  px-3 py-2.5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p className="text-[8px] text-slate-600">
                  Page{" "}
                  <span className="text-slate-400">
                    {safeCurrentPage}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-400">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={
                      safeCurrentPage <= 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            page - 1,
                            1
                          )
                      )
                    }
                    className="
                      flex h-7 w-7
                      items-center justify-center
                      rounded-md
                      border border-slate-700
                      text-slate-500
                      transition
                      hover:text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  {Array.from(
                    {
                      length: Math.min(
                        totalPages,
                        5
                      ),
                    },
                    (_, index) => {
                      let page =
                        index + 1;

                      if (
                        totalPages >
                        5
                      ) {
                        if (
                          safeCurrentPage >
                            3 &&
                          safeCurrentPage <
                            totalPages -
                              2
                        ) {
                          page =
                            safeCurrentPage -
                            2 +
                            index;
                        } else if (
                          safeCurrentPage >=
                          totalPages - 2
                        ) {
                          page =
                            totalPages -
                            4 +
                            index;
                        }
                      }

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                          className={`
                            flex h-7 w-7
                            items-center
                            justify-center
                            rounded-md
                            border
                            text-[8px]
                            font-semibold
                            transition
                            ${
                              safeCurrentPage ===
                              page
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                : "border-slate-700 text-slate-600 hover:text-slate-300"
                            }
                          `}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    disabled={
                      safeCurrentPage >=
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            page + 1,
                            totalPages
                          )
                      )
                    }
                    className="
                      flex h-7 w-7
                      items-center justify-center
                      rounded-md
                      border border-slate-700
                      text-slate-500
                      transition
                      hover:text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            mt-3
            flex flex-col gap-2
            border-t border-slate-800/70
            pt-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            {changePercentage !==
              0 && (
              <>
                <span
                  className={`flex items-center gap-1.5 text-[8px] ${
                    changePercentage >
                    0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />

                  {changePercentage >
                  0
                    ? "+"
                    : ""}
                  {changePercentage}% vs
                  previous period
                </span>

                <span className="hidden text-slate-700 sm:block">
                  |
                </span>
              </>
            )}

            <span className="flex items-center gap-1.5 text-[8px] text-slate-500">
              <Users className="h-3 w-3 text-cyan-400" />

              {total.toLocaleString()}{" "}
              total students
            </span>

            <span className="hidden text-slate-700 sm:block">
              |
            </span>

            <span className="text-[8px] text-slate-600">
              {attendance.students.length}{" "}
              attendance records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[8px] text-slate-600">
              {displayDate}
            </span>

            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="
                  flex items-center gap-1.5
                  rounded-lg
                  border border-slate-700
                  bg-slate-900/60
                  px-2.5 py-1.5
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
            )}
          </div>
        </div>
      </motion.section>

      {/* =====================================================
          STUDENT MODAL
      ===================================================== */}

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() =>
            setSelectedStudent(null)
          }
        />
      )}
    </DashboardShell>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-1 block text-[7px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            h-8 w-full
            appearance-none
            rounded-lg
            border border-slate-700
            bg-slate-900
            px-2.5 pr-7
            text-[8px]
            text-slate-300
            outline-none
            focus:border-cyan-500/40
          "
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          className="
            pointer-events-none
            absolute right-2
            top-1/2
            h-3 w-3
            -translate-y-1/2
            text-slate-600
          "
        />
      </div>
    </div>
  );
}