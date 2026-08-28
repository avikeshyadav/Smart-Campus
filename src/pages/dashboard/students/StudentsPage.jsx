  import React, {useCallback,useEffect,useMemo, useState,} from "react";
  import DashboardShell from "../DashboardShell";
  import { useAuth } from "../../../context/AuthContext";
  import { BASE_URI } from "../../../config/api";
  import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    Eye,
    Pencil,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Download,
    RefreshCw,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    CalendarDays,
    Mail,
    Phone,
    BookOpen,
    Building2,
    User,
    SlidersHorizontal,
    RotateCcw,
    Check,
    Square,
  } from "lucide-react";

  import { toast } from "react-hot-toast";

  /* =========================================================
    CONSTANTS
  ========================================================= */

  const EMPTY_FORM = {
    student_id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    year: "",
    semester: "",
    gender: "",
    dob: "",
    status: "active",
    admission_date: "",
  };

  const PAGE_SIZE = 10;

  /* =========================================================
    INPUT COMPONENTS
    IMPORTANT:
    These components MUST stay outside StudentsPage.
    Otherwise input focus/cursor can jump after every key.
  ========================================================= */

  const InputField = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
  }) => {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          {label}

          {required && (
            <span className="ml-1 text-red-400">*</span>
          )}
        </label>

        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  };

  const SelectField = ({
    label,
    name,
    value,
    onChange,
    children,
    disabled = false,
  }) => {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          {label}
        </label>

        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-sm text-white outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {children}
        </select>
      </div>
    );
  };

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

    const item = config[normalized] || {
      text: status || "Unknown",
      className:
        "border-slate-500/20 bg-slate-500/10 text-slate-400",
      dot: "bg-slate-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.className}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${item.dot}`}
        />

        {item.text}
      </span>
    );
  };

  /* =========================================================
    STAT CARD
  ========================================================= */

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "cyan",
    subtitle,
  }) => {
    const colors = {
      cyan: {
        icon: "bg-cyan-500/10 text-cyan-400",
        value: "text-white",
      },

      emerald: {
        icon: "bg-emerald-500/10 text-emerald-400",
        value: "text-emerald-400",
      },

      orange: {
        icon: "bg-orange-500/10 text-orange-400",
        value: "text-orange-400",
      },

      yellow: {
        icon: "bg-yellow-500/10 text-yellow-400",
        value: "text-yellow-400",
      },

      blue: {
        icon: "bg-blue-500/10 text-blue-400",
        value: "text-blue-400",
      },
    };

    const colorConfig = colors[color] || colors.cyan;

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700 hover:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">
              {title}
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${colorConfig.value}`}
            >
              {value}
            </p>

            {subtitle && (
              <p className="mt-1 text-[10px] text-slate-600">
                {subtitle}
              </p>
            )}
          </div>

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorConfig.icon}`}
          >
            <Icon size={17} />
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================
    MAIN COMPONENT
  ========================================================= */

  const StudentsPage = () => {
    const { accessToken } = useAuth();

    /* -------------------------
      DATA
    ------------------------- */

    const [students, setStudents] = useState([]);

    /* -------------------------
      UI
    ------------------------- */

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] =
      useState("");

    const [statusFilter, setStatusFilter] =
      useState("");

    const [yearFilter, setYearFilter] =
      useState("");

    const [showFilters, setShowFilters] =
      useState(false);

    const [page, setPage] = useState(1);

    /* -------------------------
      MODALS
    ------------------------- */

    const [showFormModal, setShowFormModal] =
      useState(false);

    const [showViewModal, setShowViewModal] =
      useState(false);

    /* -------------------------
      EDIT
    ------------------------- */

    const [editingStudent, setEditingStudent] =
      useState(null);

    const [viewingStudent, setViewingStudent] =
      useState(null);

    /* -------------------------
      FORM
    ------------------------- */

    const [formData, setFormData] =
      useState(EMPTY_FORM);

    /* -------------------------
      BULK SELECT
    ------------------------- */

    const [selectedIds, setSelectedIds] =
      useState([]);

    /* =========================================================
      FETCH STUDENTS
    ========================================================= */

    const fetchStudents = useCallback(
      async (isRefresh = false) => {
        if (!accessToken) return;

        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const response = await fetch(
            `${BASE_URI}/api/students`,
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
                text ||
                "Failed to fetch students"
            );
          }

          const list = Array.isArray(data)
            ? data
            : data?.students ||
              data?.data ||
              [];

          setStudents(
            Array.isArray(list) ? list : []
          );
        } catch (error) {
          toast.error(`Faild To Load Students : ${error}`)
          setStudents([]);
          toast.error(
            error.message ||
              "Failed to load students"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken]
    );

    /* =========================================================
      INITIAL FETCH
    ========================================================= */

    useEffect(() => {
      if (accessToken) {
        fetchStudents();
      }
    }, [accessToken, fetchStudents]);

    /* =========================================================
      ESC KEY
    ========================================================= */

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          if (!submitting) {
            setShowFormModal(false);
            setShowViewModal(false);
            setEditingStudent(null);
            setViewingStudent(null);
          }
        }
      };

      window.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    }, [submitting]);

    /* =========================================================
      INPUT CHANGE
    ========================================================= */

    const handleInputChange = (event) => {
      const { name, value } = event.target;

      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    };

    /* =========================================================
      OPEN ADD MODAL
    ========================================================= */

    const openAddModal = () => {
      setEditingStudent(null);

      setFormData({
        ...EMPTY_FORM,
      });

      setShowFormModal(true);
    };

    /* =========================================================
      OPEN EDIT MODAL
    ========================================================= */

    const openEditModal = (student) => {
      setEditingStudent(student);

      setFormData({
        student_id:
          student.student_id ||
          student.rollNo ||
          "",
        name: student.name || "",
        email: student.email || "",
        phone:student.phone || student.mobile || "",
        department:  student.department || "",
        course: student.course || "",
        year: student.year
          ? String(student.year)
          : "",
        semester: student.semester
          ? String(student.semester)
          : "",
        gender: student.gender || "",

        dob:
          student.dob
            ? String(student.dob).slice(0, 10)
            : "",

        status:
          student.status || "active",

        admission_date:
          student.admission_date
            ? String(
                student.admission_date
              ).slice(0, 10)
            : "",
      });

      setShowFormModal(true);
    };

    /* =========================================================
      OPEN VIEW MODAL
    ========================================================= */

    const openViewModal = (student) => {
      setViewingStudent(student);
      setShowViewModal(true);
    };

    /* =========================================================
      VALIDATION
    ========================================================= */

    const validateForm = () => {
      if (!formData.student_id.trim()) {
        toast.error(
          "Enrollment number is required"
        );
        return false;
      }

      if (!formData.name.trim()) {
        toast.error(
          "Student name is required"
        );
        return false;
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.email
        )
      ) {
        toast.error(
          "Please enter a valid email"
        );
        return false;
      }

      return true;
    };

    /* =========================================================
      UPDATE STUDENT
    ========================================================= */
    const updateStudent = async (event) => {
      event?.preventDefault();

      if (!editingStudent) return;

      if (!validateForm()) return;
      try {
        setSubmitting(true);

        const response = await fetch(
          `${BASE_URI}/api/students/${editingStudent.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              student_id:formData.student_id.trim(),
              name:formData.name.trim(),
              email:formData.email.trim(),
              phone:formData.phone.trim(),
              department:formData.department.trim(),
              course:formData.course.trim(),
              year:formData.year,
              semester: formData.semester,
              gender:formData.gender,
              dob:formData.dob || null,
              status:formData.status,
              admission_date:formData.admission_date || null,
            }),
          }
        );

        const text = await response.text();
        let data = null;
        try {
          data = text
            ? JSON.parse(text)
            : null;
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              text ||
              "Failed to update student"
          );
        }

        toast.success(
          "Student updated successfully"
        );

        setShowFormModal(false);
        setEditingStudent(null);

        setFormData({
          ...EMPTY_FORM,
        });

        await fetchStudents(true);
      } catch (error) {
        console.error(
          "Update student error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update student"
        );
      } finally {
        setSubmitting(false);
      }
    };

    /* =========================================================
      DELETE STUDENT
    ========================================================= */

    const deleteStudent = async (
      studentId
    ) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this student?"
      );

      if (!confirmed) return;

      try {
        setDeleting(true);

        const response = await fetch(
          `${BASE_URI}/api/students/${studentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type":
                "application/json",
            },
          }
        );

        const text = await response.text();

        let data = null;

        try {
          data = text
            ? JSON.parse(text)
            : null;
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              text ||
              "Failed to delete student"
          );
        }

        setStudents((previous) =>
          previous.filter(
            (student) =>
              String(student.id) !==
              String(studentId)
          )
        );

        setSelectedIds((previous) =>
          previous.filter(
            (id) =>
              String(id) !==
              String(studentId)
          )
        );

        toast.success(
          "Student deleted successfully"
        );
      } catch (error) {
        console.error(
          "Delete student error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to delete student"
        );
      } finally {
        setDeleting(false);
      }
    };

    /* =========================================================
      BULK DELETE
    ========================================================= */

    const bulkDelete = async () => {
      if (!selectedIds.length) {
        toast.error(
          "Please select students first"
        );
        return;
      }

      const confirmed = window.confirm(
        `Delete ${selectedIds.length} selected student(s)?`
      );

      if (!confirmed) return;

      try {
        setDeleting(true);

        for (const id of selectedIds) {
          const response = await fetch(
            `${BASE_URI}/api/students/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

          if (!response.ok) {
            toast.error( `Failed to delete student ${id}`)
          }
        }

        setSelectedIds([]);

        await fetchStudents(true);

        toast.success(
          "Selected students deleted"
        );
      } catch (error) {
        console.error(
          "Bulk delete error:",
          error
        );

        toast.error(
          "Some students could not be deleted"
        );
      } finally {
        setDeleting(false);
      }
    };

    /* =========================================================
      FILTER OPTIONS
    ========================================================= */

    const departments = useMemo(() => {
      return [
        ...new Set(
          students
            .map(
              (student) =>
                student.department
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [students]);

    /* =========================================================
      FILTERED STUDENTS
    ========================================================= */

    const filteredStudents = useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return students.filter((student) => {
        const searchableText = [
          student.name,
          student.student_id,
          student.rollNo,
          student.department,
          student.course,
          student.email,
          student.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchableText.includes(query);

        const matchesDepartment =
          !departmentFilter ||
          String(
            student.department || ""
          ) === departmentFilter;

        const matchesStatus =
          !statusFilter ||
          String(
            student.status || ""
          ).toLowerCase() ===
            statusFilter.toLowerCase();

        const matchesYear =
          !yearFilter ||
          String(
            student.year || ""
          ) === yearFilter;

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesStatus &&
          matchesYear
        );
      });
    }, [
      students,
      search,
      departmentFilter,
      statusFilter,
      yearFilter,
    ]);

    /* =========================================================
      PAGINATION
    ========================================================= */

    const totalPages = Math.max(
      1,
      Math.ceil(
        filteredStudents.length /
          PAGE_SIZE
      )
    );

    const paginatedStudents = useMemo(() => {
      const start =
        (page - 1) * PAGE_SIZE;

      return filteredStudents.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      filteredStudents,
      page,
    ]);

    useEffect(() => {
      if (page > totalPages) {
        setPage(totalPages);
      }
    }, [page, totalPages]);

    /* =========================================================
      RESET FILTERS
    ========================================================= */

    const resetFilters = () => {
      setSearch("");
      setDepartmentFilter("");
      setStatusFilter("");
      setYearFilter("");
      setPage(1);
    };

    /* =========================================================
      SELECT LOGIC
    ========================================================= */

    const currentPageIds =
      paginatedStudents.map(
        (student) => student.id
      );

    const allCurrentPageSelected =
      currentPageIds.length > 0 &&
      currentPageIds.every((id) =>
        selectedIds.some(
          (selectedId) =>
            String(selectedId) ===
            String(id)
        )
      );

    const toggleStudentSelection = (
      studentId
    ) => {
      setSelectedIds((previous) => {
        const exists = previous.some(
          (id) =>
            String(id) ===
            String(studentId)
        );

        if (exists) {
          return previous.filter(
            (id) =>
              String(id) !==
              String(studentId)
          );
        }

        return [...previous, studentId];
      });
    };

    const toggleSelectAll = () => {
      if (allCurrentPageSelected) {
        setSelectedIds((previous) =>
          previous.filter(
            (id) =>
              !currentPageIds.some(
                (pageId) =>
                  String(pageId) ===
                  String(id)
              )
          )
        );
      } else {
        setSelectedIds((previous) => {
          const merged = [
            ...previous,
            ...currentPageIds,
          ];

          return [
            ...new Map(
              merged.map((id) => [
                String(id),
                id,
              ])
            ).values(),
          ];
        });
      }
    };

    /* =========================================================
      EXPORT CSV
    ========================================================= */

    const exportCSV = () => {
      if (!filteredStudents.length) {
        toast.error(
          "No students available to export"
        );
        return;
      }

      const headers = [
        "Enrollment No",
        "Name",
        "Email",
        "Phone",
        "Department",
        "Course",
        "Year",
        "Semester",
        "Gender",
        "Status",
        "DOB",
        "Admission Date",
      ];

      const rows = filteredStudents.map(
        (student) => [
          student.student_id ||
            student.rollNo ||
            "",

          student.name || "",

          student.email || "",

          student.phone ||
            student.mobile ||
            "",

          student.department || "",

          student.course || "",

          student.year || "",

          student.semester || "",

          student.gender || "",

          student.status || "",

          student.dob || "",

          student.admission_date ||
            "",
        ]
      );

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map((value) => {
              const text = String(
                value ?? ""
              ).replace(/"/g, '""');

              return `"${text}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob(
        [csv],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `students-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success(
        "Student data exported"
      );
    };

    /* =========================================================
      STATS
    ========================================================= */

    const totalStudents =
      students.length;

    const activeStudents =
      students.filter(
        (student) =>
          String(
            student.status || ""
          ).toLowerCase() ===
          "active"
      ).length;

    const inactiveStudents =
      students.filter(
        (student) =>
          String(
            student.status || ""
          ).toLowerCase() ===
          "inactive"
      ).length;

    const pendingStudents =
      students.filter(
        (student) =>
          String(
            student.status || ""
          ).toLowerCase() ===
          "pending"
      ).length;

    const currentYear =
      new Date().getFullYear();

    const newAdmissions =
      students.filter((student) => {
        if (!student.admission_date) {
          return false;
        }

        return (
          new Date(
            student.admission_date
          ).getFullYear() ===
          currentYear
        );
      }).length;

    /* =========================================================
      RETURN
    ========================================================= */

    return (
      <DashboardShell title="Student Record Management">
        <div className="w-full min-w-0 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#071425] via-[#091827] to-[#07111f] p-5 text-white shadow-2xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Student Record Management
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Manage student records, status
                  and academic information
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  fetchStudents(true)
                }
                disabled={refreshing}
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={exportCSV}
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <Download size={14} />

                Export CSV
              </button>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
            <StatCard
              title="Total Students"
              value={totalStudents}
              icon={Users}
              color="cyan"
            />

            <StatCard
              title="Active Students"
              value={activeStudents}
              icon={UserCheck}
              color="emerald"
            />

            <StatCard
              title="Inactive Students"
              value={inactiveStudents}
              icon={UserX}
              color="orange"
            />

            <StatCard
              title="Pending Students"
              value={pendingStudents}
              icon={AlertCircle}
              color="yellow"
            />

            <StatCard
              title="New Admissions"
              value={newAdmissions}
              icon={UserPlus}
              color="blue"
              subtitle={`${currentYear} admissions`}
            />
          </div>

          {/* =================================================
              SEARCH + ACTIONS
          ================================================= */}

          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative w-full xl:max-w-md">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                    setPage(1);
                  }}
                  placeholder="Search name, enrollment, department, email..."
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/70 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/70"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      (previous) =>
                        !previous
                    )
                  }
                  className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition ${
                    showFilters
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal
                    size={14}
                  />

                  Filters

                  {(departmentFilter ||
                    statusFilter ||
                    yearFilter) && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold text-slate-950">
                      {
                        [
                          departmentFilter,
                          statusFilter,
                          yearFilter,
                        ].filter(Boolean)
                          .length
                      }
                    </span>
                  )}
                </button>

                {(search ||
                  departmentFilter ||
                  statusFilter ||
                  yearFilter) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-400 hover:text-white"
                  >
                    <RotateCcw
                      size={13}
                    />

                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* FILTERS */}

            {showFilters && (
              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-800 pt-3 md:grid-cols-3">

                <SelectField
                  label="Department"
                  name="departmentFilter"
                  value={
                    departmentFilter
                  }
                  onChange={(event) => {
                    setDepartmentFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Departments
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department}
                      </option>
                    )
                  )}
                </SelectField>

                <SelectField
                  label="Status"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="pending">
                    Pending
                  </option>
                </SelectField>

                <SelectField
                  label="Year"
                  name="yearFilter"
                  value={yearFilter}
                  onChange={(event) => {
                    setYearFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Years
                  </option>

                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>
                </SelectField>
              </div>
            )}
          </div>

          {/* =================================================
              BULK ACTION BAR
          ================================================= */}

          {selectedIds.length > 0 && (
            <div className="mb-3 flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-cyan-300">
                <CheckCircle2
                  size={15}
                />

                {selectedIds.length} student
                {selectedIds.length > 1
                  ? "s"
                  : ""}{" "}
                selected
              </div>

              <button
                type="button"
                onClick={bulkDelete}
                disabled={deleting}
                className="flex h-8 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={13} />
                )}

                Delete Selected
              </button>
            </div>
          )}

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">

                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">

                    <th className="w-12 px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={
                          toggleSelectAll
                        }
                        className="text-slate-500 hover:text-cyan-400"
                      >
                        {allCurrentPageSelected ? (
                          <Check
                            size={16}
                            className="text-cyan-400"
                          />
                        ) : (
                          <Square
                            size={16}
                          />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-medium text-slate-400">
                      Enrollment No.
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-medium text-slate-400">
                      Name
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-medium text-slate-400">
                      Department
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-medium text-slate-400">
                      Course
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-medium text-slate-400">
                      Year
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-medium text-slate-400">
                      Status
                    </th>

                    <th className="px-4 py-4 text-center text-xs font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({
                      length: 6,
                    }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-800/70"
                      >
                        <td
                          colSpan="8"
                          className="px-5 py-4"
                        >
                          <div className="h-8 animate-pulse rounded bg-slate-800/50" />
                        </td>
                      </tr>
                    ))
                  ) : paginatedStudents.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-14 text-center"
                      >
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                            <Users
                              size={20}
                              className="text-slate-500"
                            />
                          </div>

                          <p className="text-sm font-medium text-slate-300">
                            No students found
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Try changing your
                            search or filters.
                          </p>

                          {(search ||
                            departmentFilter ||
                            statusFilter ||
                            yearFilter) && (
                            <button
                              type="button"
                              onClick={
                                resetFilters
                              }
                              className="mt-4 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map(
                      (student) => {
                        const isSelected =
                          selectedIds.some(
                            (id) =>
                              String(id) ===
                              String(
                                student.id
                              )
                          );

                        const initials = (
                          student.name ||
                          "NA"
                        )
                          .split(" ")
                          .map(
                            (part) =>
                              part[0]
                          )
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <tr
                            key={
                              student.id
                            }
                            className={`border-b border-slate-800/70 transition hover:bg-cyan-500/[0.035] ${
                              isSelected
                                ? "bg-cyan-500/[0.04]"
                                : ""
                            }`}
                          >

                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleStudentSelection(
                                    student.id
                                  )
                                }
                                className="text-slate-500 hover:text-cyan-400"
                              >
                                {isSelected ? (
                                  <span className="flex h-4 w-4 items-center justify-center rounded border border-cyan-400 bg-cyan-400 text-slate-950">
                                    <Check
                                      size={11}
                                      strokeWidth={
                                        3
                                      }
                                    />
                                  </span>
                                ) : (
                                  <span className="block h-4 w-4 rounded border border-slate-600" />
                                )}
                              </button>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-300">
                              {student.student_id ||
                                student.rollNo ||
                                "—"}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-xs font-semibold text-cyan-300">
                                  {initials}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-white">
                                    {student.name ||
                                      "—"}
                                  </p>

                                  {student.email && (
                                    <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-600">
                                      {
                                        student.email
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-400">
                              {student.department ||
                                "—"}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-400">
                              {student.course ||
                                "—"}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-400">
                              {student.year
                                ? `${student.year}${
                                    student.year ===
                                    1
                                      ? "st"
                                      : student.year ===
                                        2
                                      ? "nd"
                                      : student.year ===
                                        3
                                      ? "rd"
                                      : "th"
                                  }`
                                : "—"}
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge
                                status={
                                  student.status
                                }
                              />
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-1.5">

                                <button
                                  type="button"
                                  title="View"
                                  onClick={() =>
                                    openViewModal(
                                      student
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400"
                                >
                                  <Eye
                                    size={14}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() =>
                                    openEditModal(
                                      student
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:border-blue-500/50 hover:text-blue-400"
                                >
                                  <Pencil
                                    size={14}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={() =>
                                    deleteStudent(
                                      student.id
                                    )
                                  }
                                  disabled={
                                    deleting
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                                >
                                  <Trash2
                                    size={14}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="More"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white"
                                >
                                  <MoreHorizontal
                                    size={15}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================
              FOOTER / PAGINATION
          ================================================= */}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-300">
                {filteredStudents.length ===
                0
                  ? 0
                  : (page - 1) *
                      PAGE_SIZE +
                    1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-300">
                {Math.min(
                  page * PAGE_SIZE,
                  filteredStudents.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-300">
                {filteredStudents.length}
              </span>{" "}
              students
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(
                      1,
                      previous - 1
                    )
                  )
                }
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft
                  size={14}
                />

                Previous
              </button>

              <div className="flex h-8 items-center rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-300">
                {page} / {totalPages}
              </div>

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage((previous) =>
                    Math.min(
                      totalPages,
                      previous + 1
                    )
                  )
                }
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next

                <ChevronRight
                  size={14}
                />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            ADD / EDIT MODAL
        ===================================================== */}

        {showFormModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                if (!submitting) {
                  setEditingStudent(null);
                  setFormData({
                    ...EMPTY_FORM,
                  });
                }
              }
            }}
          >
            <form
              onSubmit={
                editingStudent
                  ? updateStudent
                  : createStudent
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#091827] shadow-2xl"
            >

              {/* MODAL HEADER */}

              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#091827] px-5 py-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                    {editingStudent ? (
                      <Pencil
                        size={18}
                        className="text-cyan-400"
                      />
                    ) : (
                      <UserPlus
                        size={18}
                        className="text-cyan-400"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {editingStudent
                        ? "Edit Student"
                        : "Add New Student"}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {editingStudent
                        ? "Update student information"
                        : "Enter student academic and personal details"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingStudent(null);
                    setFormData({
                      ...EMPTY_FORM,
                    });
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>

              {/* FORM */}

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">

                <InputField
                  label="Enrollment No."
                  name="student_id"
                  value={
                    formData.student_id
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="STU2026001"
                  required
                />

                <InputField
                  label="Student Name"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Avikesh Kumar"
                  required
                />

                <InputField
                  label="Email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleInputChange
                  }
                  type="email"
                  placeholder="student@example.com"
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="9876543210"
                />

                <InputField
                  label="Department"
                  name="department"
                  value={
                    formData.department
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Computer Science"
                />

                <InputField
                  label="Course"
                  name="course"
                  value={
                    formData.course
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="B.Tech"
                />

                <SelectField
                  label="Year"
                  name="year"
                  value={formData.year}
                  onChange={
                    handleInputChange
                  }
                >
                  <option value="">
                    Select Year
                  </option>

                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>
                </SelectField>

                <SelectField
                  label="Semester"
                  name="semester"
                  value={
                    formData.semester
                  }
                  onChange={
                    handleInputChange
                  }
                >
                  <option value="">
                    Select Semester
                  </option>

                  <option value="1">
                    Semester 1
                  </option>

                  <option value="2">
                    Semester 2
                  </option>

                  <option value="3">
                    Semester 3
                  </option>

                  <option value="4">
                    Semester 4
                  </option>

                  <option value="5">
                    Semester 5
                  </option>

                  <option value="6">
                    Semester 6
                  </option>

                  <option value="7">
                    Semester 7
                  </option>

                  <option value="8">
                    Semester 8
                  </option>
                </SelectField>

                <SelectField
                  label="Gender"
                  name="gender"
                  value={
                    formData.gender
                  }
                  onChange={
                    handleInputChange
                  }
                >
                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </SelectField>

                <InputField
                  label="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  onChange={
                    handleInputChange
                  }
                  type="date"
                />

                <InputField
                  label="Admission Date"
                  name="admission_date"
                  value={
                    formData.admission_date
                  }
                  onChange={
                    handleInputChange
                  }
                  type="date"
                />

                <SelectField
                  label="Status"
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleInputChange
                  }
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="pending">
                    Pending
                  </option>
                </SelectField>
              </div>

              {/* FORM FOOTER */}

              <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-800 bg-[#091827] px-5 py-4">

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingStudent(null);
                    setFormData({
                      ...EMPTY_FORM,
                    });
                  }}
                  className="h-9 rounded-lg border border-slate-700 px-4 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-9 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {editingStudent
                    ? "Update Student"
                    : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================
            VIEW STUDENT MODAL
        ===================================================== */}

        {showViewModal &&
          viewingStudent && (
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  setShowViewModal(false);
                  setViewingStudent(null);
                }
              }}
            >
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#091827] shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                      <GraduationCap
                        size={18}
                        className="text-cyan-400"
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Student Details
                      </h3>

                      <p className="text-xs text-slate-500">
                        Complete student
                        information
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingStudent(
                        null
                      );
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* PROFILE */}

                <div className="p-5">

                  <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-lg font-bold text-cyan-300">
                      {(viewingStudent.name ||
                        "NA")
                        .split(" ")
                        .map(
                          (part) =>
                            part[0]
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-semibold text-white">
                        {viewingStudent.name ||
                          "—"}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {viewingStudent.student_id ||
                          viewingStudent.rollNo ||
                          "No enrollment number"}
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={
                            viewingStudent.status
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* DETAILS GRID */}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                    <DetailItem
                      icon={GraduationCap}
                      label="Enrollment No."
                      value={
                        viewingStudent.student_id ||
                        viewingStudent.rollNo
                      }
                    />

                    <DetailItem
                      icon={Mail}
                      label="Email"
                      value={
                        viewingStudent.email
                      }
                    />

                    <DetailItem
                      icon={Phone}
                      label="Phone"
                      value={
                        viewingStudent.phone ||
                        viewingStudent.mobile
                      }
                    />

                    <DetailItem
                      icon={Building2}
                      label="Department"
                      value={
                        viewingStudent.department
                      }
                    />

                    <DetailItem
                      icon={BookOpen}
                      label="Course"
                      value={
                        viewingStudent.course
                      }
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Year"
                      value={
                        viewingStudent.year
                      }
                    />

                    <DetailItem
                      icon={BookOpen}
                      label="Semester"
                      value={
                        viewingStudent.semester
                      }
                    />

                    <DetailItem
                      icon={User}
                      label="Gender"
                      value={
                        viewingStudent.gender
                      }
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Date of Birth"
                      value={
                        viewingStudent.dob
                      }
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Admission Date"
                      value={
                        viewingStudent.admission_date
                      }
                    />
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex justify-end gap-2 border-t border-slate-800 pt-4">

                    <button
                      type="button"
                      onClick={() => {
                        setShowViewModal(
                          false
                        );

                        openEditModal(
                          viewingStudent
                        );
                      }}
                      className="flex h-9 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                      <Pencil
                        size={14}
                      />

                      Edit Student
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowViewModal(
                          false
                        );

                        setViewingStudent(
                          null
                        );
                      }}
                      className="h-9 rounded-lg border border-slate-700 px-4 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </DashboardShell>
    );
  };

  /* =========================================================
    DETAIL ITEM
  ========================================================= */

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }) => {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        <div className="flex items-center gap-2">
          <Icon
            size={14}
            className="text-cyan-400"
          />

          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
            {label}
          </span>
        </div>

        <p className="mt-2 break-words text-sm text-slate-300">
          {value || "—"}
        </p>
      </div>
    );
  };

  export default StudentsPage;