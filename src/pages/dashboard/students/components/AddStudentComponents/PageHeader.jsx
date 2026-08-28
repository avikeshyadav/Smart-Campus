import { UserPlus } from "lucide-react";
import StatusDot from "./StatusDot";

export default function PageHeader() {
  return (
    <div className="
      mb-3 rounded-xl border border-slate-800/90
      bg-slate-900/55 p-4
    ">
      <div className="
        flex flex-col justify-between gap-4
        md:flex-row md:items-center
      ">
        <div className="flex items-center gap-3">
          <div className="
            grid h-10 w-10 place-items-center rounded-xl
            border border-emerald-400/20 bg-emerald-400/5
          ">
            <UserPlus className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">
                Register Student
              </h1>

              <span className="
                rounded-md border border-emerald-400/20
                bg-emerald-400/5 px-2 py-0.5 text-[7px]
                uppercase tracking-wider text-emerald-400
              ">
                Enrollment
              </span>
            </div>

            <p className="mt-0.5 text-[8px] text-slate-500">
              Create student profile with facial enrollment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[8px] text-slate-500">
            <StatusDot active />
            System Online
          </span>

          <span className="
            rounded-md border border-slate-800
            bg-slate-950/50 px-2 py-1 text-[7px] text-slate-600
          ">
            SECURE MODE
          </span>
        </div>
      </div>
    </div>
  );
}
