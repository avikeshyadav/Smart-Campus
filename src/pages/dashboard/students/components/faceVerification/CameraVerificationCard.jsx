import {
  Activity, Camera, CameraOff, CircleDot, Loader2, RotateCcw,
  Search, Target, Wifi, WifiOff, Zap,
} from "lucide-react";
import { MiniInfo } from "./UIHelpers";

export default function CameraVerificationCard({
  videoRef, cameraOn, scanning, cameraStatus,
  startCamera, stopCamera, flipCamera, searchFace, lastScan,
}) {
  return (
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            {/* CAMERA HEADER */}

            <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <Camera
                    size={18}
                    className="text-cyan-400"
                  />

                  <h2 className="font-bold text-white">
                    Live Camera
                  </h2>

                  {cameraOn && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">

                      <CircleDot
                        size={9}
                        className="animate-pulse"
                      />

                      LIVE

                    </span>
                  )}

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Position the student's face inside the frame
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-2">

                {!cameraOn ? (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-95"
                  >

                    <Camera size={16} />

                    Start Camera

                  </button>
                  
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"
                  >

                    <CameraOff size={16} />

                    Stop Camera

                  </button>
                  
                )}
                  <button
              onClick={flipCamera}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-400 transition hover:border-violet-400 hover:bg-violet-500/20 active:scale-95"
            >
              <RotateCcw
                size={16}
                className="transition-transform duration-500"
              />
              Flip Camera
            </button>

                <button
                  onClick={searchFace}
                  disabled={!cameraOn || scanning}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {scanning ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Search size={16} />
                  )}

                  {scanning
                    ? "Scanning..."
                    : "Search Face"}

                </button>

              </div>

            </div>

            {/* CAMERA */}

            <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-black shadow-inner">

              <div className="relative aspect-video w-full">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover transition duration-500 ${
                    cameraOn
                      ? "opacity-100"
                      : "opacity-30"
                  }`}
                />

                {/* EMPTY CAMERA */}

                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70">

                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-600">

                      <CameraOff size={34} />

                    </div>

                    <p className="text-sm font-semibold text-slate-400">
                      Camera is currently offline
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Click "Start Camera" to begin
                    </p>

                  </div>
                )}

                {/* SCAN OVERLAY */}

                {cameraOn && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

                    {/* FACE FRAME */}

                    <div className="absolute left-1/2 top-1/2 h-64 w-52 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-cyan-400/50 shadow-[0_0_0_9999px_rgba(2,6,23,.12)]">

                      <span className="absolute -left-px -top-px h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-cyan-400" />

                      <span className="absolute -right-px -top-px h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-cyan-400" />

                      <span className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-cyan-400" />

                      <span className="absolute -bottom-px -right-px h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-cyan-400" />

                      {scanning && (
                        <div className="absolute left-0 right-0 top-0 h-0.5 animate-[scan_1.8s_ease-in-out_infinite] bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
                      )}

                    </div>

                    {/* TOP STATUS */}

                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-[10px] text-slate-300 backdrop-blur">

                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                      FACE DETECTION READY

                    </div>

                    {/* BOTTOM INFO */}

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">
                          Identity Scanner
                        </p>

                        <p className="mt-1 text-xs text-slate-300">
                          Keep face centered
                        </p>

                      </div>

                      {scanning && (
                        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-950/80 px-3 py-2 text-xs text-cyan-300 backdrop-blur">

                          <Loader2
                            size={14}
                            className="animate-spin"
                          />

                          Analyzing...

                        </div>
                      )}

                    </div>

                  </>
                )}

              </div>

            </div>

            {/* CAMERA CONTROLS */}

            <div className="grid grid-cols-3 gap-2 p-4">

              <MiniInfo
                icon={Target}
                label="Face Frame"
                value={cameraOn ? "Ready" : "Waiting"}
              />

              <MiniInfo
                icon={Zap}
                label="Recognition"
                value={scanning ? "Running" : "Idle"}
              />

              <MiniInfo
                icon={Activity}
                label="Response"
                value={
                  lastScan?.responseTime
                    ? `${lastScan.responseTime}ms`
                    : "--"
                }
              />

            </div>

          </section>
  );
}
