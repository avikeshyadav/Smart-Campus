import React, { useCallback, useState ,useEffect} from "react";
import { useParams } from "react-router-dom";
import {Search,Loader2,X,User,GraduationCap,Mail,Phone,CalendarDays,Building2,
        BookOpen,MapPin,CreditCard,ShieldCheck,RefreshCw,AlertCircle,
        ParasolIcon,
        User2Icon,} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

/* =========================================================
   STATUS BADGE
========================================================= */
const StatusBadge = ({ status }) => {
  const normalized = String(status || "")
    .toLowerCase()
    .trim();

  const config = {
    active: {
      text: "Active",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      dot: "bg-emerald-400",
    },

    inactive: {
      text: "Inactive",
      className:
        "border-orange-500/20 bg-orange-500/10 text-orange-400",
      dot: "bg-orange-400",
    },

    pending: {
      text: "Pending",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
      dot: "bg-yellow-400",
    },
  };

  const item =
    config[normalized] || {
      text: status || "Unknown",
      className:
        "border-slate-500/20 bg-slate-500/10 text-slate-400",
      dot: "bg-slate-400",
    };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${item.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${item.dot}`}
      />

      {item.text}
    </span>
  );
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}) => {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? String(value)
      : "—";

  

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/40 p-4 ${
        fullWidth ? "md:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
          <Icon
            size={15}
            className="text-cyan-400"
          />
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-3 break-words text-sm font-medium text-slate-200">
        {displayValue}
      </p>
    </div>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
        <Icon
          size={17}
          className="text-cyan-400"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-0.5 text-[10px] text-slate-600">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name = "") => {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "ST";
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const StudentViewPage = () => {
  const { accessToken } = useAuth();
  const { id } = useParams();

  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH STUDENT
  ========================================================= */

 const fetchStudent = useCallback(
  async (value =studentId) => {
    const cleanId = String(value || "").trim();

    if (!cleanId) {
      toast.error(
        "Please enter Student ID / Enrollment No."
      );
      return;
    }

    if (!accessToken) {
      toast.error(
        "Authentication token not found"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStudent(null);

      const response = await fetch(
        `${BASE_URI}/api/students/${encodeURIComponent(
          cleanId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Student not found"
        );
      }

      const result =
        data?.student ||
        data?.data ||
        data;

      if (
        !result ||
        typeof result !== "object"
      ) {
        throw new Error(
          "Invalid student data received from server"
        );
      }

      setStudent(result);
      console.log(result?.photo_path)
      // setPhotoPath(result.photo_path);

      toast.success(
        "Student biodata loaded successfully"
      );
    } catch (err) {
      console.error(
        "Fetch student error:",
        err
      );

      setStudent(null);

      const message =
        err?.message ||
        "Failed to load student";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  },
  [accessToken, studentId]
);

useEffect(() => {
  if (!id) return;

  setStudentId(id);

  if (accessToken) {
    fetchStudent(id);
  }
}, [accessToken]);

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchStudent();
  };

  /* =========================================================
     CLEAR
  ========================================================= */

  const clearStudent = () => {
    setStudent(null);
    setStudentId("");
    setError("");
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#071425] via-[#091827] to-[#07111f] p-5 text-white shadow-2xl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
            <GraduationCap
              size={22}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Student Biodata
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search by Student ID / Enrollment Number
            </p>
          </div>
        </div>

        {student && (
          <button
            type="button"
            onClick={clearStudent}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 text-xs font-medium text-slate-400 transition hover:border-red-500/40 hover:text-red-400"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/50 p-4">

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              placeholder="Enter Student ID e.g. 250110874"
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                View Student
              </>
            )}
          </button>
        </form>

        <p className="mt-2 text-[10px] text-slate-600">
          Enter the exact Student ID stored in the database.
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <AlertCircle
              size={16}
              className="text-red-400"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-red-300">
              Unable to Load Student
            </p>

            <p className="mt-1 text-xs text-red-400/80">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">

          <Loader2
            size={30}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading student information...
          </p>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading && !student && !error && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-16 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <User
              size={28}
              className="text-cyan-400"
            />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-300">
            Search Student
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
            Enter a Student ID above to view
            complete student information.
          </p>
        </div>
      )}

      {/* =====================================================
          STUDENT
      ===================================================== */}

      { student && (
        <div className="space-y-5">

          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/[0.06] to-blue-500/[0.03] p-5">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* PHOTO / AVATAR */}

              {student.photo_path ? (
                <img
                  src={`http://localhost:5001/${student.photo_path}`}
                  alt={student.name || "Student"}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-cyan-500/20"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-2xl font-bold text-cyan-300 ring-1 ring-cyan-500/20">
                  {getInitials(student.name)}
                </div>
              )}

              {/* BASIC INFO */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {student.name || "Student Name"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Student ID:
                      {" "}
                      <span className="font-semibold text-cyan-400">
                        {student.student_id || "—"}
                      </span>
                    </p>
                  </div>

                  <StatusBadge
                    status={student.status}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-3">

                  <div className="flex items-center gap-2">
                    <Building2
                      size={13}
                      className="text-cyan-500"
                    />
                    <span>
                      {student.department || "Department —"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen
                      size={13}
                      className="text-cyan-500"
                    />
                    <span>
                      {`Course : ${student.course} `|| "Course —"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap
                      size={13}
                      className="text-cyan-500"
                    />
                    <span>
                      {student.year
                        ? `Year - ${student.year}`
                        : "Year —"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">

            <SectionHeader
              icon={User}
              title="Personal Information"
              description="Basic student information"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

              <DetailItem
                icon={User}
                label="Full Name"
                value={student.name}
              />

              <DetailItem
                icon={CreditCard}
                label="Student ID"
                value={student.student_id}
              />

              <DetailItem
                icon={User}
                label="Gender"
                value={student.gender}
              />

              <DetailItem
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDate(student.dob)}
              />

              <DetailItem
                icon={Mail}
                label="Email"
                value={student.email}
              />

              <DetailItem
                icon={Phone}
                label="Mobile"
                value={student.mobile}
              />
              {student?.parents ? (
              <DetailItem
                icon={User2Icon}
                label="Parent:"
                value={student?.parents}
              />) : (<></>)}
            </div>
          </div>

          {/* =================================================
              ACADEMIC INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">

            <SectionHeader
              icon={GraduationCap}
              title="Academic Information"
              description="Course and academic details"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

              <DetailItem
                icon={Building2}
                label="Department"
                value={student.department}
              />

              <DetailItem
                icon={BookOpen}
                label="Course"
                value={student.course}
              />

              <DetailItem
                icon={GraduationCap}
                label="Year"
                value={
                  student.year
                    ? `Year ${student.year}`
                    : ""
                }
              />

              <DetailItem
                icon={BookOpen}
                label="Semester"
                value={
                  student.semester
                    ? `Semester ${student.semester}`
                    : ""
                }
              />

              <DetailItem
                icon={ShieldCheck}
                label="Status"
                value={student.status}
              />

              <DetailItem
                icon={CalendarDays}
                label="Database ID"
                value={student.id}
              />
            </div>
          </div>

          {/* =================================================
              ADDRESS
          ================================================= */}

          {student.address && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">

              <SectionHeader
                icon={MapPin}
                title="Address"
                description="Student residential address"
              />

              <div className="grid grid-cols-1">

                <DetailItem
                  icon={MapPin}
                  label="Address"
                  value={student.address}
                  fullWidth
                />

              </div>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="text-[10px] text-slate-600">
              Student ID:
              {" "}
              <span className="text-slate-400">
                {student.student_id || "—"}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchStudent(student.student_id)
              }
              disabled={loading}
              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 text-xs font-medium text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentViewPage;
