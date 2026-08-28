import { History, UserCheck } from "lucide-react";

export default function RecentScansCard({ scanHistory, formatTime }) {
  return (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <History
                  size={17}
                  className="text-cyan-400"
                />

                <h3 className="font-bold">
                  Recent Scans
                </h3>

              </div>

              <span className="text-[10px] text-slate-600">
                Last 5
              </span>

            </div>

            {scanHistory.length ? (
              <div className="space-y-2">

                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition hover:border-cyan-500/20"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">

                        <UserCheck size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-semibold text-slate-300">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {item.studentId}
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-xs font-bold text-emerald-400">
                        {item.accuracy}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-600">
                        {formatTime(item.time)}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-600">

                No scan history yet

              </div>
            )}

          </section>
  );
}
