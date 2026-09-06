import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Gauge,
  IdCard,
  LockKeyhole,
  RefreshCw,
  RotateCcw,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import Field from "./Field";
import ProgressBar from "./ProgressBar";

export default function StudentDetailsCard({
  studentId,
  setStudentId,
  name,
  setName,
  className,
  setClassName,
  duplicateStudent,
  formProgress,
  capturedPhoto,
  formReady,
  status,
  message,
  handleSubmit,
  resetForm,
}) {
  const courses = [
    "BBA",
    "BCA",
    "B.Tech",
    "BA LLB",
    "B.Com",
    "B.Sc",
    "BA",
    "B.Ed",
    "MBA",
    "MCA",
    "M.Tech",
    "LLB",
    "LLM",
    "PhD",
    "Other",
  ];

  return (
    <section
      className="
        rounded-xl border border-slate-800/90
        bg-slate-900/55 p-3
      "
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IdCard className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">
              Student Details
            </h2>
          </div>

          <p className="mt-1 text-[7px] uppercase tracking-wider text-slate-600">
            Enrollment Information
          </p>
        </div>

        <LockKeyhole className="h-4 w-4 text-slate-600" />
      </div>

      <div className="mb-4">
        <ProgressBar value={formProgress} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field
          label="Student ID"
          value={studentId}
          onChange={setStudentId}
          placeholder="STU-10245"
          icon={IdCard}
        />

        {duplicateStudent && (
          <div
            className="
              flex items-center gap-2 rounded-lg border
              border-red-400/20 bg-red-400/5 px-2.5 py-2
              text-[8px] text-red-300
            "
          >
            <AlertTriangle className="h-3 w-3" />
            Student ID already exists
          </div>
        )}

        <Field
          label="Full Name"
          value={name}
          onChange={setName}
          placeholder="Full Name : Avikesh Kumar Yadav"
          icon={UserCheck}
        />

        {/* COURSE / CLASS SELECT */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-wider text-slate-500">
            <FileCheck2 className="h-3 w-3 text-purple-400" />
            Course / Class
          </label>

          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="
              w-full rounded-lg border border-slate-800
              bg-slate-950/60 px-3 py-2.5
              text-[9px] text-slate-200
              outline-none transition
              focus:border-purple-400/40
              focus:ring-1 focus:ring-purple-400/20
            "
          >
            <option value="" className="bg-slate-900 text-slate-500">
              Select Course / Class
            </option>

            {courses.map((course) => (
              <option
                key={course}
                value={course}
                className="bg-slate-900 text-slate-200"
              >
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* CHECKLIST */}
        <div
          className="
            rounded-xl border border-slate-800/80
            bg-slate-950/30 p-3
          "
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className="
                text-[7px] uppercase tracking-wider text-slate-600
              "
            >
              Enrollment Checklist
            </span>

            <Gauge className="h-3 w-3 text-slate-600" />
          </div>

          {[
            ["Student ID", Boolean(studentId.trim())],
            ["Student Name", Boolean(name.trim())],
            ["Class / Section", Boolean(className.trim())],
            ["Face Photo", Boolean(capturedPhoto)],
          ].map(([item, complete]) => (
            <div
              key={item}
              className="
                flex items-center justify-between
                border-b border-slate-800/50 py-1.5 last:border-0
              "
            >
              <span
                className={`text-[8px] ${
                  complete ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {item}
              </span>

              {complete ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <XCircle className="h-3 w-3 text-slate-700" />
              )}
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <motion.button
          whileHover={{ y: formReady ? -1 : 0 }}
          whileTap={{ scale: formReady ? 0.98 : 1 }}
          type="submit"
          disabled={
            status === "submitting" ||
            !formReady ||
            duplicateStudent
          }
          className="
            flex w-full items-center justify-center gap-2
            rounded-lg border border-emerald-400/20
            bg-emerald-400/10 py-2.5 text-[9px]
            font-semibold uppercase tracking-wider
            text-emerald-400 transition
            hover:bg-emerald-400/15
            disabled:cursor-not-allowed disabled:opacity-30
          "
        >
          {status === "submitting" ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Add to Register
            </>
          )}
        </motion.button>

        {/* RESET */}
        <button
          type="button"
          onClick={resetForm}
          className="
            flex w-full items-center justify-center gap-2
            rounded-lg border border-slate-800
            bg-slate-950/40 py-2 text-[8px]
            uppercase tracking-wider text-slate-500
            transition hover:text-slate-300
          "
        >
          <RotateCcw className="h-3 w-3" />
          Clear Form
        </button>

        {/* ERROR */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="
                flex items-start gap-2 rounded-lg
                border border-red-400/20 bg-red-400/5
                p-2.5 text-[8px] text-red-300
              "
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUCCESS */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="
                rounded-lg border border-emerald-400/20
                bg-emerald-400/5 p-3
              "
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                <div>
                  <p className="text-[9px] font-semibold text-emerald-400">
                    Enrollment Successful
                  </p>

                  <p className="mt-0.5 text-[7px] text-slate-500">
                    {message}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </section>
  );
}
