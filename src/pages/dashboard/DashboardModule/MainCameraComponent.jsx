import React from "react";
import {
  Activity,
  Camera,
  CheckCircle2,
  Maximize2,
  Wifi,
  WifiOff,
} from "lucide-react";

function getStatusColor(status) {
  return String(status).toLowerCase() === "live";
}

function CameraPreview({ camera }) {
  const live = getStatusColor(camera.status);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-black">
      {camera.stream_url && live ? (
        /*
         * HLS/WebRTC/MJPEG stream yahan aayega.
         *
         * Agar stream_url .m3u8 hai to hls.js use karna better hai.
         * Simple browser-supported stream ke liye video chalega.
         */
        <video
          src={camera.stream_url}
          autoPlay
          muted
          playsInline
          controls={false}
          className="h-[190px] w-full bg-black object-cover"
        />
      ) : camera.preview_url ? (
        <img
          src={camera.preview_url}
          alt={camera.name}
          className="h-[190px] w-full object-cover"
        />
      ) : (
        <div className="grid h-[190px] place-items-center bg-gradient-to-br from-slate-900 to-black">
          {live ? (
            <div className="text-center">
              <Camera className="mx-auto h-8 w-8 text-slate-700" />
              <p className="mt-2 text-[9px] text-slate-600">
                Waiting for video...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <WifiOff className="mx-auto h-8 w-8 text-red-500/50" />
              <p className="mt-2 text-[9px] text-slate-600">
                Camera Offline
              </p>
            </div>
          )}
        </div>
      )}

      {/* TOP STATUS */}
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/60 px-2 py-1 backdrop-blur">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            live
              ? "animate-pulse bg-emerald-400"
              : "bg-red-500"
          }`}
        />

        <span className="text-[8px] font-bold text-white">
          {live ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {/* RESOLUTION */}
      <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[7px] text-slate-300 backdrop-blur">
        {camera.resolution || "1080p"}
      </div>

      {/* BOTTOM INFO */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold text-white">
              {camera.name}
            </p>

            <p className="mt-0.5 text-[7px] text-slate-400">
              {camera.location || "Unknown Location"}
            </p>
          </div>

          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-black/50 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Open camera"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CameraCard({ camera }) {
  const live = getStatusColor(camera.status);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60">
      <CameraPreview camera={camera} />

      <div className="grid grid-cols-2 gap-px border-t border-slate-800 bg-slate-800">
        <div className="bg-slate-900/90 px-2.5 py-2">
          <p className="text-[6px] uppercase tracking-wider text-slate-600">
            Camera ID
          </p>

          <p className="mt-0.5 text-[8px] font-semibold text-slate-300">
            {camera.camera_id || "—"}
          </p>
        </div>

        <div className="bg-slate-900/90 px-2.5 py-2">
          <p className="text-[6px] uppercase tracking-wider text-slate-600">
            Status
          </p>

          <p
            className={`mt-0.5 flex items-center gap-1 text-[8px] font-semibold ${
              live
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {live ? (
              <Wifi className="h-2.5 w-2.5" />
            ) : (
              <WifiOff className="h-2.5 w-2.5" />
            )}

            {live ? "LIVE" : "OFFLINE"}
          </p>
        </div>

        <div className="bg-slate-900/90 px-2.5 py-2">
          <p className="text-[6px] uppercase tracking-wider text-slate-600">
            Type
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            {camera.type || "IP Camera"}
          </p>
        </div>

        <div className="bg-slate-900/90 px-2.5 py-2">
          <p className="text-[6px] uppercase tracking-wider text-slate-600">
            Resolution
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            {camera.resolution || "1080p"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function MainCameraComponent({
  cameras = [],
  loading = false,
}) {
  const liveCameras = cameras.filter(
    (camera) =>
      String(camera.status).toLowerCase() === "live"
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#07101e] via-[#0a1727] to-[#07101c] p-3 text-white shadow-xl">
      
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/5">
            <Camera className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">
              Connected Cameras
            </h2>

            <p className="text-[7px] uppercase tracking-wider text-slate-600">
              Live Camera Monitoring
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/50 px-2 py-1.5 sm:flex">
            <Activity className="h-3 w-3 text-cyan-400" />

            <span className="text-[7px] text-slate-400">
              {cameras.length} Cameras
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-emerald-400/10 bg-emerald-400/5 px-2 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-[7px] font-bold text-emerald-400">
              {liveCameras.length} LIVE
            </span>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid min-h-[220px] place-items-center rounded-xl border border-slate-800 bg-slate-950/40">
          <div className="text-center">
            <Activity className="mx-auto h-6 w-6 animate-pulse text-cyan-400" />

            <p className="mt-2 text-[8px] text-slate-600">
              Loading cameras...
            </p>
          </div>
        </div>
      ) : cameras.length === 0 ? (
        <div className="grid min-h-[220px] place-items-center rounded-xl border border-slate-800 bg-slate-950/40">
          <div className="text-center">
            <Camera className="mx-auto h-8 w-8 text-slate-800" />

            <p className="mt-2 text-[9px] text-slate-600">
              No connected cameras
            </p>
          </div>
        </div>
      ) : (
        /*
         * Responsive camera grid
         */
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-2">
          {cameras.map((camera) => (
            <CameraCard
              key={
                camera.camera_id ||
                camera.id ||
                camera.name
              }
              camera={camera}
            />
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />

          <span className="text-[7px] text-slate-500">
            Monitoring System
          </span>

          <span className="text-[7px] font-bold text-emerald-400">
            HEALTHY
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[7px] text-slate-500">
          <Wifi className="h-3 w-3 text-cyan-400" />

          <span>
            {liveCameras.length}/{cameras.length} online
          </span>
        </div>
      </div>
    </section>
  );
}
