import React, { useMemo, useState } from "react";
import {
  LocateFixed,
  Plus,
  Minus,
  Target,
  Video,
  Clock3,
  MapPin,
} from "lucide-react";

export default function StudentLiveTracking({
  student = null,
  timeline = [],
  mapImage = "",
  live = false,
}) {
  const [zoom, setZoom] = useState(1);

  const safeStudent = useMemo(
    () => student || {},
    [student]
  );

  const safeTimeline = useMemo(
    () => (Array.isArray(timeline) ? timeline : []),
    [timeline]
  );

  const zoomIn = () => {
    setZoom((value) => Math.min(value + 0.15, 1.6));
  };

  const zoomOut = () => {
    setZoom((value) => Math.max(value - 0.15, 0.8));
  };

  const initials = String(
    safeStudent.name || "Student"
  )
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-[#07101e] via-[#0a1727] to-[#07101c] p-3 text-slate-100 shadow-2xl shadow-black/30">

      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-red-500" />

          <h2 className="text-sm font-bold">
            Student Live Tracking
          </h2>
        </div>

        <div
          className={`flex items-center gap-1.5 text-[8px] font-bold ${
            live
              ? "text-emerald-400"
              : "text-slate-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              live
                ? "animate-pulse bg-emerald-400"
                : "bg-slate-600"
            }`}
          />

          {live ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      {!student ? (
        <div className="grid min-h-[330px] place-items-center rounded-xl border border-slate-800 bg-slate-950/40">
          <div className="text-center">
            <Target className="mx-auto h-8 w-8 text-slate-700" />

            <p className="mt-2 text-[10px] text-slate-500">
              Select a student to track
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* TOP */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[120px_minmax(0,1fr)_120px]">

            {/* STUDENT */}
            <aside className="rounded-xl border border-slate-700/25 bg-slate-900/60 p-3">

              <div className="mx-auto mb-2.5 h-[78px] w-[68px] overflow-hidden rounded-md bg-slate-800">

                {safeStudent.image ? (
                  <img
                    src={safeStudent.image}
                    alt={safeStudent.name || "Student"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-600 to-slate-800 text-xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              <h3 className="mb-2 truncate text-[12px] font-bold text-white">
                {safeStudent.name || "Unknown Student"}
              </h3>

              <div className="space-y-1.5 text-[9px] text-slate-400">
                <p>
                  {safeStudent.rollNo || "—"}
                </p>

                <p>
                  {safeStudent.course || "—"}
                </p>

                <p>
                  <span className="text-slate-600">
                    Year:
                  </span>{" "}
                  {safeStudent.year || "—"}
                </p>

                <p>
                  <span className="text-slate-600">
                    Status:
                  </span>{" "}
                  <span className="font-semibold text-emerald-400">
                    {safeStudent.status || "Unknown"}
                  </span>
                </p>
              </div>
            </aside>

            {/* CAMERA */}
            <div className="min-w-0 rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5">

              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
                <Video className="h-3 w-3 text-slate-400" />
                Live Camera
              </div>

              <div className="relative h-[197px] overflow-hidden rounded-lg bg-slate-950">

                {safeStudent.cameraImage ? (
                  <img
                    src={safeStudent.cameraImage}
                    alt="Student camera"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[9px] text-slate-600">
                    Camera unavailable
                  </div>
                )}

                {live && (
                  <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-red-500 px-2 py-1 text-[8px] font-bold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    LIVE
                  </div>
                )}

                <div className="absolute right-2 top-2 flex items-center gap-1 text-[8px] font-semibold text-white drop-shadow">
                  <Clock3 className="h-2.5 w-2.5" />
                  {safeStudent.time || "--:--"}
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <aside className="rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5">

              <div className="mb-2 text-[10px] font-semibold text-slate-300">
                Today's Timeline
              </div>

              {safeTimeline.length === 0 ? (
                <p className="py-6 text-center text-[8px] text-slate-600">
                  No tracking activity
                </p>
              ) : (
                <div>
                  {safeTimeline.map((event, index) => (
                    <div
                      key={`${event.time}-${index}`}
                      className="relative flex min-h-[42px] gap-2"
                    >
                      <div className="relative flex w-2 shrink-0 justify-center">
                        <span
                          className={`mt-0.5 h-2 w-2 rounded-full ${
                            event.dot ||
                            "bg-cyan-400"
                          }`}
                        />

                        {index !==
                          safeTimeline.length - 1 && (
                          <span className="absolute left-1/2 top-2.5 h-full w-px -translate-x-1/2 bg-slate-700" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-semibold text-slate-300">
                          {event.time || "—"}
                        </span>

                        <span className="text-[8px] text-slate-500">
                          {event.title || "Activity"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>

          {/* MAP */}
          <div className="mt-2 rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5">

            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
              <MapPin className="h-3 w-3 text-slate-400" />
              Live Location
            </div>

            <div className="relative h-[116px] overflow-hidden rounded-lg bg-slate-950">

              {mapImage ? (
                <img
                  src={mapImage}
                  alt="Campus location"
                  className="h-full w-full object-cover brightness-[0.72] saturate-[0.8]"
                  style={{
                    transform: `scale(${zoom})`,
                  }}
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full place-items-center text-[9px] text-slate-600">
                  Campus map unavailable
                </div>
              )}

              {/* LOCATION */}
              {live && (
                <div
                  className="absolute"
                  style={{
                    left: `${safeStudent.location?.x ?? 48}%`,
                    top: `${safeStudent.location?.y ?? 47}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="absolute -inset-3 animate-ping rounded-full bg-blue-500/20" />

                  <div className="relative grid h-7 w-7 place-items-center rounded-full border-4 border-blue-400/25 bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,.9)]">
                    <LocateFixed className="h-3.5 w-3.5" />
                  </div>
                </div>
              )}

              {/* ZOOM */}
              <div className="absolute right-2 top-2 flex flex-col overflow-hidden rounded-md border border-slate-500/20 bg-slate-950/80">

                <button
                  type="button"
                  onClick={zoomIn}
                  className="grid h-7 w-7 place-items-center text-slate-200 hover:bg-slate-700"
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <div className="h-px bg-slate-700" />

                <button
                  type="button"
                  onClick={zoomOut}
                  className="grid h-7 w-7 place-items-center text-slate-200 hover:bg-slate-700"
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
