import { motion } from "framer-motion";
import {
  CheckCircle2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import StatusDot from "./StatusDot";

export default function StudentRegisterCard({
  students,
  filteredStudents,
  paginatedStudents,
  search,
  setSearch,
  loadingStudents,
  fetchStudents,
  currentPage,
  totalPages,
  setCurrentPage,
  baseUri,
}) {
  return (
    <section className="
      mt-3 rounded-xl border border-slate-800/90
      bg-slate-900/55 p-3
    ">
      <div className="
        mb-3 flex flex-col gap-3
        md:flex-row md:items-center md:justify-between
      ">
        <div className="flex items-center gap-2">
          <div className="
            grid h-8 w-8 place-items-center rounded-lg
            border border-purple-400/20 bg-purple-400/5
          ">
            <Users className="h-4 w-4 text-purple-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                Student Register
              </h2>

              <span className="
                rounded-md bg-slate-950 px-1.5 py-0.5
                text-[7px] text-cyan-300
              ">
                {filteredStudents.length}
              </span>
            </div>

            <p className="text-[7px] uppercase tracking-wider text-slate-600">
              Enrolled Students Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="
              absolute left-2.5 top-1/2 h-3 w-3
              -translate-y-1/2 text-slate-600
            " />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="
                w-full rounded-lg border border-slate-800
                bg-slate-950/50 py-2 pl-8 pr-2
                text-[8px] text-slate-300 outline-none
                placeholder:text-slate-700
                focus:border-cyan-400/30
              "
            />
          </div>

          <button
            type="button"
            onClick={fetchStudents}
            disabled={loadingStudents}
            className="
              grid h-8 w-8 shrink-0 place-items-center
              rounded-lg border border-slate-800
              bg-slate-950/50 text-slate-500
              transition hover:text-white
            "
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loadingStudents ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {filteredStudents.length > 0 && (
        <div className="
          hidden grid-cols-[auto_1fr_120px_150px_100px]
          gap-3 border-b border-slate-800/60
          px-2 py-2 md:grid
        ">
          <span />
          <span className="text-[7px] uppercase text-slate-600">Student</span>
          <span className="text-[7px] uppercase text-slate-600">Class</span>
          <span className="text-[7px] uppercase text-slate-600">Student ID</span>
          <span className="text-[7px] uppercase text-slate-600">Status</span>
        </div>
      )}

      {loadingStudents ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            <span className="text-[8px] text-slate-500">
              Loading student database...
            </span>
          </div>
        </div>
      ) : paginatedStudents.length === 0 ? (
        <EmptyState
          studentsLength={students.length}
          search={search}
          clearSearch={() => setSearch("")}
        />
      ) : (
        <div className="divide-y divide-slate-800/60">
          {paginatedStudents.map((student, index) => (
            <StudentRow
              key={student?.id || student?.student_id || index}
              student={student}
              index={index}
              baseUri={baseUri}
            />
          ))}
        </div>
      )}

      {filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          setCurrentPage={setCurrentPage}
        />
      )}
    </section>
  );
}

function EmptyState({ studentsLength, search, clearSearch }) {
  return (
    <div className="
      flex min-h-[180px] flex-col items-center justify-center
    ">
      <Users className="h-8 w-8 text-slate-800" />

      <p className="mt-2 text-[9px] text-slate-600">
        {studentsLength === 0
          ? "No students enrolled yet."
          : "No matching students found."}
      </p>

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="mt-2 text-[7px] uppercase text-cyan-300"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

function StudentRow({ student, index, baseUri }) {
  const id = student?.student_id || student?.id || "—";
  const studentClass = student?.class_name || student?.class || "—";
  const image = student?.image ? `${baseUri}${student.image}` : null;

  const initials = String(student?.name || "Student")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="
        grid gap-2 px-2 py-2.5 transition
        hover:bg-slate-950/30
        md:grid-cols-[auto_1fr_120px_150px_100px]
        md:items-center md:gap-3
      "
    >
      <div className="flex items-center">
        {image ? (
          <img
            src={image}
            alt={student?.name || "Student"}
            className="
              h-9 w-9 rounded-lg border
              border-slate-800 object-cover
            "
          />
        ) : (
          <div className="
            grid h-9 w-9 place-items-center rounded-lg
            border border-slate-800 bg-slate-950
            text-[9px] font-bold text-cyan-300
          ">
            {initials}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-medium text-slate-200">
          {student?.name || "Unknown Student"}
        </p>

        <div className="mt-1 flex items-center gap-1">
          <StatusDot />
          <span className="text-[7px] text-slate-600">
            Face enrolled
          </span>
        </div>
      </div>

      <div>
        <span className="
          inline-flex rounded-md border border-cyan-400/10
          bg-cyan-400/5 px-2 py-1 text-[7px] text-cyan-300
        ">
          {studentClass}
        </span>
      </div>

      <div>
        <span className="font-mono text-[8px] text-slate-500">
          {id}
        </span>
      </div>

      <div>
        <span className="
          inline-flex items-center gap-1
          text-[7px] text-emerald-400
        ">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Registered
        </span>
      </div>
    </motion.div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  setCurrentPage,
}) {
  return (
    <div className="
      mt-3 flex flex-col items-center justify-between
      gap-2 border-t border-slate-800/60 pt-3 sm:flex-row
    ">
      <span className="text-[7px] text-slate-600">
        Showing{" "}
        <span className="text-slate-400">
          {Math.min(
            (currentPage - 1) * 6 + 1,
            totalItems
          )}
        </span>{" "}
        -{" "}
        <span className="text-slate-400">
          {Math.min(currentPage * 6, totalItems)}
        </span>{" "}
        of{" "}
        <span className="text-slate-400">{totalItems}</span>
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((page) => Math.max(1, page - 1))
          }
          className="
            rounded-md border border-slate-800
            bg-slate-950/50 px-2.5 py-1.5
            text-[7px] text-slate-500 transition
            hover:text-white disabled:opacity-30
          "
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              type="button"
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`
                grid h-6 min-w-6 place-items-center
                rounded-md border text-[7px] transition
                ${
                  currentPage === page
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                    : "border-slate-800 bg-slate-950/50 text-slate-600 hover:text-white"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          className="
            rounded-md border border-slate-800
            bg-slate-950/50 px-2.5 py-1.5
            text-[7px] text-slate-500 transition
            hover:text-white disabled:opacity-30
          "
        >
          Next
        </button>
      </div>
    </div>
  );
}
