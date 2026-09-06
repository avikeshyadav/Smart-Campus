import React, { useMemo, useState } from "react";
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
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

const students = [
  {
    id: 1,
    roll: "250110874",
    name: "avikesh Kumar",
    department: "CSE",
    course: "BCA",
    year: "2nd",
    status: "Active",
  },
  {
    id: 2,
    roll: "2023002",
    name: "Priya Sharma",
    department: "ECE",
    course: "B.Tech",
    year: "2nd",
    status: "Active",
  },
  {
    id: 3,
    roll: "2023003",
    name: "Rahul Singh",
    department: "ME",
    course: "B.Tech",
    year: "3rd",
    status: "Active",
  },
  {
    id: 4,
    roll: "2023004",
    name: "Neha Verma",
    department: "CE",
    course: "B.Tech",
    year: "1st",
    status: "Active",
  },
  {
    id: 5,
    roll: "2023005",
    name: "Vijay Patel",
    department: "CSE",
    course: "B.Tech",
    year: "4th",
    status: "Active",
  },
  {
    id: 6,
    roll: "2023006",
    name: "Karan Gupta",
    department: "EEE",
    course: "B.Tech",
    year: "2nd",
    status: "Active",
  },
];

const stats = [
  {
    title: "Total Students",
    value: "4,782",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Active Students",
    value: "4,512",
    icon: UserCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Inactive Students",
    value: "270",
    icon: UserX,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    title: "New Admissions",
    value: "320",
    icon: UserPlus,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

const StudentRecordManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      `${student.name} ${student.roll} ${student.department}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = 797;

  return (
    <>
    <div className="w-full min-w-0 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#071425] via-[#091827] to-[#07111f] p-5 text-white shadow-2xl">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
            <Users className="h-5 w-5 text-cyan-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Student Record Management
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Manage student records, status and academic information
            </p>
          </div>
        </div>

        <button
          className="
            flex items-center justify-center gap-2
            rounded-xl
            border border-slate-700
            bg-slate-900/80
            px-4 py-2.5
            text-xs font-medium
            text-slate-300
            transition
            hover:border-cyan-500/50
            hover:bg-cyan-500/10
            hover:text-cyan-400
          "
        >
          View All
          <ChevronRight size={15} />
        </button>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="
                group
                rounded-xl
                border border-slate-800
                bg-slate-900/70
                p-4
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-slate-700
                hover:bg-slate-900
              "
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-400">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-xl ${stat.bg}
                  `}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* =====================================================
          SEARCH / FILTER BAR
      ===================================================== */}
      <div
        className="
          mb-4 flex flex-col gap-3
          rounded-xl
          border border-slate-800
          bg-slate-900/50
          p-3
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="relative w-full md:max-w-sm">

          <Search
            size={17}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search student, roll no..."
            className="
              h-10
              w-full
              rounded-lg
              border border-slate-700
              bg-slate-950/70
              pl-10
              pr-4
              text-sm
              text-white
              outline-none
              placeholder:text-slate-600
              transition
              focus:border-cyan-500/70
              focus:ring-2
              focus:ring-cyan-500/10
            "
          />

        </div>

        <div className="flex items-center gap-2">

          <button
            className="
              flex h-10 items-center gap-2
              rounded-lg
              border border-slate-700
              bg-slate-950/70
              px-3
              text-xs
              text-slate-300
              transition
              hover:border-cyan-500/50
              hover:text-cyan-400
            "
          >
            <Filter size={15} />
            Filter
          </button>

          <button
            className="
              flex h-10 items-center gap-2
              rounded-lg
              border border-slate-700
              bg-slate-950/70
              px-3
              text-xs
              text-slate-300
              transition
              hover:border-cyan-500/50
              hover:text-cyan-400
            "
          >
            <Download size={15} />
            Export
          </button>

          <button
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg
              border border-slate-700
              bg-slate-950/70
              text-slate-400
              transition
              hover:border-cyan-500/50
              hover:text-cyan-400
            "
          >
            <RefreshCw size={15} />
          </button>

        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}
      <div className="overflow-hidden rounded-xl border border-slate-800">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] border-collapse">

            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400">
                  Roll No.
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400">
                  Department
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400">
                  Course
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400">
                  Year
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold text-slate-400">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredStudents.map((student) => (

                <tr
                  key={student.id}
                  className="
                    border-b border-slate-800/70
                    transition
                    hover:bg-cyan-500/[0.035]
                  "
                >

                  <td className="px-5 py-4 text-sm text-slate-300">
                    {student.roll}
                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex h-9 w-9
                          items-center justify-center
                          rounded-full
                          bg-gradient-to-br
                          from-cyan-500/30
                          to-blue-500/20
                          text-xs font-semibold
                          text-cyan-300
                        "
                      >
                        {student.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <span className="text-sm font-medium text-white">
                        {student.name}
                      </span>

                    </div>

                  </td>

                  <td className="px-5 py-4 text-sm text-slate-400">
                    {student.department}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-400">
                    {student.course}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-400">
                    {student.year}
                  </td>

                  <td className="px-5 py-4">

                    <span
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        border border-emerald-500/20
                        bg-emerald-500/10
                        px-2.5 py-1
                        text-[11px]
                        font-semibold
                        text-emerald-400
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {student.status}
                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center justify-center gap-1.5">

                      <button
                        title="View"
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg
                          border border-slate-700
                          bg-slate-900
                          text-slate-400
                          transition
                          hover:border-cyan-500/50
                          hover:bg-cyan-500/10
                          hover:text-cyan-400
                        "
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        title="Edit"
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg
                          border border-slate-700
                          bg-slate-900
                          text-slate-400
                          transition
                          hover:border-blue-500/50
                          hover:bg-blue-500/10
                          hover:text-blue-400
                        "
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        title="Delete"
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg
                          border border-slate-700
                          bg-slate-900
                          text-slate-400
                          transition
                          hover:border-red-500/50
                          hover:bg-red-500/10
                          hover:text-red-400
                        "
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        title="More"
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg
                          text-slate-500
                          transition
                          hover:bg-slate-800
                          hover:text-white
                        "
                      >
                        <MoreHorizontal size={15} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          BOTTOM / PAGINATION
          ===================================================== */}
      <div
        className="
          relative
          mt-4
          flex
          min-h-[52px]
          items-center
          justify-center
          border-t border-slate-800/70
          pt-4
        "
      >

        {/* LEFT INFO */}
        <div
          className="
            absolute
            left-0
            hidden
            text-xs
            text-slate-500
            sm:block
          "
        >
          Showing{" "}
          <span className="font-medium text-slate-300">
            1–{filteredStudents.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-300">
            4,782
          </span>{" "}
          students
        </div>


        {/* CENTER PAGINATION */}
        <div className="flex items-center justify-center gap-1.5">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              border border-slate-700
              bg-slate-900
              text-slate-400
              transition
              hover:border-cyan-500/50
              hover:text-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <ChevronLeft size={16} />
          </button>

          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`
                flex h-9 min-w-9
                items-center justify-center
                rounded-lg
                px-2
                text-xs font-medium
                transition-all
                ${
                  page === num
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "border border-slate-700 bg-slate-900 text-slate-400 hover:border-cyan-500/50 hover:text-white"
                }
              `}
            >
              {num}
            </button>
          ))}

          <span className="flex h-9 w-9 items-center justify-center text-slate-600">
            ...
          </span>

          <button
            onClick={() => setPage(totalPages)}
            className="
              flex h-9 min-w-9
              items-center justify-center
              rounded-lg
              border border-slate-700
              bg-slate-900
              px-2
              text-xs
              text-slate-400
              transition
              hover:border-cyan-500/50
              hover:text-white
            "
          >
            {totalPages}
          </button>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              border border-slate-700
              bg-slate-900
              text-slate-400
              transition
              hover:border-cyan-500/50
              hover:text-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <ChevronRight size={16} />
          </button>

        </div>

      </div>

    </div>
    </>
  );
};

export default StudentRecordManagement;