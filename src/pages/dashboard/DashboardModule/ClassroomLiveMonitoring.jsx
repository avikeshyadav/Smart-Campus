import React, { useState } from "react";
import { Video, Users, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const defaultClassrooms = [
  {
    id: 1,
    name: "Classroom 101",
    course: "B.Tech CSE - 2nd Year",
    students: 36,
    image: "/assets/classroom-101.jpg",
  },
  {
    id: 2,
    name: "Classroom 102",
    course: "B.Tech CCE - 2nd Year",
    students: 28,
    image: "/assets/classroom-102.jpg",
  },
  {
    id: 3,
    name: "Classroom 201",
    course: "B.Tech ME - 3rd Year",
    students: 42,
    image: "/assets/classroom-201.jpg",
  },
  {
    id: 4,
    name: "Lab - 1",
    course: "Computer Lab",
    students: 18,
    image: "/assets/computer-lab.jpg",
  },
];

export default function ClassroomLiveMonitoring({
  classrooms = defaultClassrooms,
  title = "Classroom Live Monitoring",
  onViewAll,
  onClassClick,
}) {
  const [active, setActive] = useState(0);

  const safeRooms = classrooms?.length ? classrooms : defaultClassrooms;

  const next = () =>
    setActive((v) => Math.min(v + 1, Math.max(0, safeRooms.length - 4)));

  const prev = () => setActive((v) => Math.max(0, v - 1));

  const visibleRooms = safeRooms.slice(active, active + 4);

  return (
    <section className="w-full max-w-[700px] overflow-hidden rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_20%_0%,rgba(31,70,105,.18),transparent_45%),linear-gradient(145deg,#071321,#091827_55%,#07111e)] p-2.5 text-white shadow-[0_20px_55px_rgba(0,0,0,.35)]">
      <div className="mb-2 flex h-7 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center text-blue-400">
            <Video className="h-4 w-4" />
          </span>
          <h2 className="text-[12px] font-semibold tracking-tight">{title}</h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-1.5 text-[8px] text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {visibleRooms.map((room, index) => (
          <button
            type="button"
            key={room.id ?? `${room.name}-${index}`}
            onClick={() => onClassClick?.(room)}
            className="group relative h-[215px] overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-[0_12px_30px_rgba(0,0,0,.35)]"
          >
            {room.image ? (
              <img
                src={room.image}
                alt={room.name}
                className="absolute inset-0 h-full w-full object-cover brightness-[.72] saturate-[.85] transition duration-500 group-hover:scale-105 group-hover:brightness-[.85]"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e3349,#0a1524)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(71,132,190,.25),transparent_45%)]" />
              </div>
            )}

            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,8,15,.62),transparent_28%,transparent_50%,rgba(2,8,15,.82))]" />

            <div className="absolute left-2.5 right-2.5 top-2.5 flex items-start justify-between">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-white">
                  {room.name}
                </p>
                <p className="mt-0.5 truncate text-[8px] text-slate-300">
                  {room.course}
                </p>
              </div>

              <span className="ml-2 flex shrink-0 items-center gap-1 rounded-md bg-red-500/90 px-1.5 py-1 text-[7px] font-bold text-white shadow-[0_0_12px_rgba(239,68,68,.25)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            </div>

            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-slate-950/65 px-1.5 py-1 text-[8px] text-white backdrop-blur-md">
              <Users className="h-2.5 w-2.5 text-slate-300" />
              {room.students}
            </div>

            <div className="absolute bottom-2.5 left-2.5 rounded-md bg-blue-500/0 px-1.5 py-1 text-[7px] text-white opacity-0 backdrop-blur-md transition group-hover:bg-blue-500/80 group-hover:opacity-100">
              <Eye className="mr-1 inline h-2.5 w-2.5" />
              Open camera
            </div>
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          className="text-slate-600 transition hover:text-slate-300 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.max(1, safeRooms.length - 3) }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show classroom group ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? "w-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,.7)]"
                  : "w-1.5 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={active >= safeRooms.length - 4}
          className="text-slate-600 transition hover:text-slate-300 disabled:opacity-40"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}