import {
  Activity,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import StatusDot from "./StatusDot";

export default function PageHeader({
  monitorOnline,
  lastUpdated,
  onRefresh,
  loading,
}) {
  return (
    <div className="mb-3">

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/90 bg-slate-900/55 p-3 sm:flex-row sm:items-center sm:justify-between">

        {/* TITLE */}

        <div className="flex items-center gap-3">

          <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/5">

            <Activity className="h-5 w-5 text-emerald-400" />

          </div>

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-base font-semibold text-white">
                Attendance Monitor
              </h1>

              <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/10 bg-emerald-400/5 px-2 py-1 text-[7px] uppercase tracking-wider text-emerald-400">

                <StatusDot
                  active={
                    monitorOnline
                  }
                />

                {monitorOnline
                  ? "Live"
                  : "Offline"}

              </span>

            </div>

            <p className="mt-1 text-[7px] uppercase tracking-[0.18em] text-slate-600">
              Real-Time Facial Recognition Attendance
            </p>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-2 sm:flex">

            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />

            <div>

              <p className="text-[6px] uppercase tracking-wider text-slate-600">
                Last Sync
              </p>

              <p className="text-[8px] text-slate-400">
                {lastUpdated}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              onRefresh
            }
            disabled={
              loading
            }
            title="Refresh today's attendance"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-slate-950/50 text-slate-500 transition hover:text-white disabled:opacity-40"
          >

            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

          </button>

        </div>

      </div>

    </div>
  );
}
