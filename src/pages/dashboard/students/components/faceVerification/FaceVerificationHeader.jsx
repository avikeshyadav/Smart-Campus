import { ScanFace, ShieldCheck, Wifi, WifiOff } from "lucide-react";

export default function FaceVerificationHeader({ cameraOn, cameraStatus }) {
  return (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-5 shadow-xl">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10">

                <ScanFace size={30} />

              </div>

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                    Identity Verification
                  </span>

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Face Verification Register
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Live student identification & attendance verification
                </p>

              </div>

            </div>

            {/* SYSTEM STATUS */}

            <div className="flex flex-wrap items-center gap-2">

              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                  cameraOn
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
              >

                {cameraOn ? (
                  <Wifi size={14} />
                ) : (
                  <WifiOff size={14} />
                )}

                {cameraStatus}

              </div>

              <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400">

                <ShieldCheck size={14} />

                Recognition Active

              </div>

            </div>

          </div>

        </div>
  );
}
