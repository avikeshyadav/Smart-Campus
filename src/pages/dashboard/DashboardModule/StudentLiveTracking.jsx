import React, { useEffect, useState } from "react";
import {
  LocateFixed,
  Plus,
  Minus,
  Target,
  Video,
  Clock3,
  MapPin,
} from "lucide-react";

const defaultStudent = {
  name: "Avikesh Kumar",
  rollNo: "250110874",
  course: "BCA",
  year: "2nd Year",
  status: "Inside Campus",
  image: "../../../../backend/LiveTracker/avikesh.jpg",
  cameraImage: "../../../../media/students/livecam.jpg",
};

const defaultTimeline = [
  {
    time: "09:15 AM",
    title: "Entry - Main Gate",
    dot: "bg-orange-500",
    ring: "shadow-orange-500/50",
  },
  {
    time: "10:30 AM",
    title: "Library Visit",
    dot: "bg-sky-400",
    ring: "shadow-sky-400/50",
  },
  {
    time: "11:16 AM",
    title: "Canteen Visit",
    dot: "bg-lime-400",
    ring: "shadow-lime-400/50",
  },
  {
    time: "01:30 PM",
    title: "Classroom 201",
    dot: "bg-purple-500",
    ring: "shadow-purple-500/50",
  },
  {
    time: "04:15 PM",
    title: "Exit - Main Gate",
    dot: "bg-red-500",
    ring: "shadow-red-500/50",
  },
];

export default function StudentLiveTracking({
  student = defaultStudent,
  timeline = defaultTimeline,
  mapImage = "../../../media/collegePic/banner.jpeg",
  live = true,
}) {
  const [zoom, setZoom] = useState(1);
  const [currentTime, setCurrentTime] = useState("11:02:35 AM");

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date())
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  const zoomIn = () => setZoom((v) => Math.min(v + 0.15, 1.6));
  const zoomOut = () => setZoom((v) => Math.max(v - 0.15, 0.8));

  return (
    <section className="w-full max-w-[760px] overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-[#07101e] via-[#0a1727] to-[#07101c] p-3 text-slate-100 shadow-2xl shadow-black/30 sm:p-3.5">

      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,.5)]" />
        <h2 className="text-sm font-bold tracking-tight text-slate-100">
          Student Live Tracking
        </h2>
      </div>

      {/* Main top section */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[120px_minmax(0,1fr)_120px]">

        {/* Student profile */}
        <aside className="rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5 sm:p-3">
          <div className="mx-auto mb-2.5 h-[78px] w-[68px] overflow-hidden rounded-md bg-slate-700">
            {student.image ? (
              <img
                src={student.image}
                alt={student.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-500 to-slate-800 text-2xl font-bold text-white">
                {student.name?.charAt(0)}
              </div>
            )}
          </div>

          <h3 className="mb-2 text-[13px] font-bold text-white">
            {student.name}
          </h3>

          <div className="space-y-1.5 text-[9px] leading-tight text-slate-400">
            <p>{student.rollNo}</p>
            <p>{student.course}</p>

            <p>
              <span className="text-slate-500">Year:</span>{" "}
              {student.year}
            </p>

            <p>
              <span className="text-slate-500">Status:</span>{" "}
              <span className="font-semibold text-emerald-400">
                {student.status}
              </span>
            </p>
          </div>
        </aside>

        {/* Live camera */}
        <div className="min-w-0 rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
            <Video className="h-3 w-3 text-slate-400" />
            Live Camera Capture
          </div>

          <div className="relative h-[197px] overflow-hidden rounded-lg bg-slate-800">
            {student.cameraImage ? (
              <img
                src={student.cameraImage}
                alt="Live student camera"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-xs text-slate-500">
                Camera unavailable
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />

            {live && (
              <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-red-500 px-2 py-1 text-[9px] font-extrabold text-white shadow-lg">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </div>
            )}

            <div className="absolute right-2 top-2 flex items-center gap-1 rounded text-[8px] font-semibold text-white drop-shadow-[0_1px_4px_black]">
              <Clock3 className="h-2.5 w-2.5" />
              {currentTime}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <aside className="rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5 lg:min-h-[246px]">
          <div className="mb-2 text-[10px] font-semibold text-slate-300">
            Today's Timeline
          </div>

          <div className="space-y-0">
            {timeline.map((event, index) => (
              <div
                key={`${event.time}-${index}`}
                className="relative flex min-h-[42px] gap-2 pl-0.5"
              >
                <div className="relative flex w-2 shrink-0 justify-center">
                  <span
                    className={`mt-0.5 h-2 w-2 rounded-full ${event.dot} shadow-[0_0_6px] ${event.ring}`}
                  />
                  {index !== timeline.length - 1 && (
                    <span className="absolute left-1/2 top-2.5 h-full w-px -translate-x-1/2 bg-slate-600/30" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-semibold leading-none text-slate-300">
                    {event.time}
                  </span>
                  <span className="text-[8px] leading-tight text-slate-500">
                    {event.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Campus map */}
      <div className="mt-2 rounded-xl border border-slate-700/25 bg-slate-900/60 p-2.5">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
          <MapPin className="h-3 w-3 text-slate-400" />
          Live Location on Campus
        </div>

        <div className="relative h-[116px] overflow-hidden rounded-lg bg-slate-800">
          {mapImage ? (
            <img
              src={mapImage}
              alt="Live location on campus"
              className="h-full w-full object-cover brightness-[0.72] saturate-[0.8] transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-slate-800 to-slate-950 text-xs text-slate-500">
              Campus Map
            </div>
          )}

          {/* Map overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />

          {/* Live location marker */}
          <div className="absolute left-[48%] top-[47%] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute -inset-3 animate-ping rounded-full bg-blue-500/20" />
            <div className="relative grid h-7 w-7 place-items-center rounded-full border-4 border-blue-400/25 bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,.9)]">
              <LocateFixed className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute right-2 top-2 flex flex-col overflow-hidden rounded-md border border-slate-500/20 bg-slate-950/70 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={zoomIn}
              className="grid h-7 w-7 place-items-center text-slate-200 transition hover:bg-slate-700/60"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>

            <div className="h-px bg-slate-600/30" />

            <button
              type="button"
              onClick={zoomOut}
              className="grid h-7 w-7 place-items-center text-slate-200 transition hover:bg-slate-700/60"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}