import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Camera,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserCheck,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

const defaultPeople = [
  { name: "Student 01", time: "11:02:35 AM" },
  { name: "Student 02", time: "11:02:33 AM" },
  { name: "Student 03", time: "11:02:31 AM" },
  { name: "Student 04", time: "11:02:29 AM" },
  { name: "Student 05", time: "11:02:27 AM" },
];

const defaultStats = [
  { label: "Today's Entry", value: "1,246", tone: "green" },
  { label: "Today's Exit", value: "1,182", tone: "red" },
  { label: "Inside Campus", value: "2,156", tone: "blue" },
  { label: "Total Visitors", value: "189", tone: "purple" },
];

const statTone = {
  green: "text-emerald-400",
  red: "text-red-400",
  blue: "text-sky-400",
  purple: "text-purple-400",
};

function GateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current stroke-[1.7]"
    >
      <path d="M4 20V5.5h16V20" />
      <path d="M8 20V8h3v12M13 8h3v12" />
      <path d="M2.5 20h19" />
    </svg>
  );
}

function Chevron({ direction = "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 fill-none stroke-current stroke-2 ${
        direction === "left" ? "rotate-180" : ""
      }`}
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function MainCameraComponent({
  gateImage = "",
  people = defaultPeople,
  stats = defaultStats,
  title = "Live Gate Entry - Main Gate",
  autoSlide = true,
  slideInterval = 3500,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [recognition, setRecognition] = useState(true);

  const safePeople = useMemo(
    () => (people?.length ? people : defaultPeople),
    [people]
  );

  useEffect(() => {
    if (!autoSlide || safePeople.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safePeople.length);
    }, slideInterval);

    return () => window.clearInterval(timer);
  }, [autoSlide, safePeople.length, slideInterval]);

  const move = (direction) => {
    setActiveIndex((current) => {
      const next =
        direction === "next" ? current + 1 : current - 1;

      return (next + safePeople.length) % safePeople.length;
    });
  };

  const activePerson = safePeople[activeIndex];

  return (
    <section
      className="
        h-[500px] w-full max-w-[420px]
        overflow-hidden rounded-2xl
        border border-slate-700/50
        bg-[radial-gradient(circle_at_50%_0%,rgba(31,64,99,0.18),transparent_48%),linear-gradient(145deg,#07101e_0%,#0a1627_48%,#07101c_100%)]
        p-3.5 text-white
        shadow-[0_20px_50px_rgba(0,0,0,0.38)]
        font-sans
      "
    >
      {/* ================= HEADER ================= */}

      <div className="mb-2 flex h-[30px] items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-slate-300">
            <GateIcon />
          </span>

          <span className="truncate text-[14px] font-bold tracking-tight">
            {title}
          </span>

          <span
            className="
              inline-flex items-center gap-1.5
              rounded-full border border-emerald-400/20
              bg-emerald-400/10
              px-2 py-1
              text-[8px] font-extrabold
              text-emerald-300
            "
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#37e989]" />
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-400">
          <Wifi className="h-3 w-3" />
          ONLINE
        </div>
      </div>

      {/* ================= CAMERA ================= */}

      <div
        className="
          relative h-[185px]
          overflow-hidden rounded-xl
          border border-white/10
          bg-[#111b29]
        "
      >
        {gateImage ? (
          <img
            src={gateImage}
            alt="Live view of college main gate"
            className="
              block h-full w-full
              object-cover
              brightness-[0.92]
              contrast-[1.04]
              saturate-[0.9]
            "
          />
        ) : (
          <div
            className="
              absolute inset-0
              grid place-content-center
              justify-items-center gap-2
              bg-gradient-to-br
              from-slate-800 to-slate-950
              text-slate-400
            "
          >
            <Camera className="h-8 w-8" />

            <span className="text-xs font-bold">
              Add your campus gate image
            </span>

            <small className="text-[9px] text-slate-600">
              Pass gateImage="/assets/campus-gate.jpg"
            </small>
          </div>
        )}

        {/* CAMERA OVERLAY */}

        <div
          className="
            pointer-events-none absolute inset-0 z-[1]
            bg-gradient-to-b
            from-transparent
            via-transparent
            to-black/65
          "
        />

        {/* CAMERA STATUS */}

        <div
          className="
            absolute left-2 top-2 z-10
            flex items-center gap-1.5
            rounded-md
            border border-white/10
            bg-black/45
            px-2 py-1
            backdrop-blur-md
          "
        >
          <Activity className="h-3 w-3 text-emerald-400" />

          <span className="text-[8px] font-bold text-white">
            CAMERA 01
          </span>

          <span className="text-[7px] text-emerald-400">
            1080p
          </span>
        </div>

        {/* PREVIOUS */}

        <button
          type="button"
          onClick={() => move("prev")}
          className="
            absolute left-1.5 top-1/2 z-[4]
            grid h-[38px] w-7
            -translate-y-1/2 place-items-center
            rounded-lg
            bg-black/55
            text-slate-300
            backdrop-blur-md
            transition
            hover:scale-105
            hover:bg-slate-900/90
            hover:text-white
          "
        >
          <Chevron direction="left" />
        </button>

        {/* NEXT */}

        <button
          type="button"
          onClick={() => move("next")}
          className="
            absolute right-1.5 top-1/2 z-[4]
            grid h-[38px] w-7
            -translate-y-1/2 place-items-center
            rounded-lg
            bg-black/55
            text-slate-300
            backdrop-blur-md
            transition
            hover:scale-105
            hover:bg-slate-900/90
            hover:text-white
          "
        >
          <Chevron direction="right" />
        </button>

        {/* ACTIVE PERSON */}

        <div
          className="
            absolute bottom-8 left-1/2 z-[3]
            -translate-x-1/2
            rounded-lg
            border border-white/10
            bg-black/50
            px-3 py-1.5
            text-center
            backdrop-blur-md
          "
        >
          <p className="text-[9px] font-bold text-white">
            {activePerson?.name}
          </p>

          <p className="mt-0.5 flex items-center justify-center gap-1 text-[7px] text-emerald-300">
            <UserCheck className="h-2.5 w-2.5" />
            Face Matched
          </p>
        </div>

        {/* PEOPLE */}

        <div
          className="
            absolute bottom-[7px]
            left-[38px] right-[38px]
            z-[5]
            flex items-end
            justify-between gap-[5px]
          "
        >
          {safePeople.map((person, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                type="button"
                key={`${person.name}-${index}`}
                onClick={() => setActiveIndex(index)}
                className="grid w-[54px] justify-items-center gap-[3px]"
              >
                <span
                  className={`
                    grid h-[31px] w-[31px]
                    place-items-center rounded-full
                    border p-0.5
                    bg-slate-950
                    shadow-lg
                    transition
                    ${
                      isActive
                        ? "border-emerald-400 shadow-[0_0_0_2px_rgba(78,220,147,.18)] -translate-y-0.5"
                        : "border-white/30"
                    }
                  `}
                >
                  {person.image ? (
                    <img
                      src={person.image}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="
                        grid h-full w-full
                        place-items-center rounded-full
                        bg-gradient-to-br
                        from-slate-500 to-slate-800
                        text-[8px] font-extrabold
                      "
                    >
                      {getInitials(person.name)}
                    </span>
                  )}
                </span>

                <span className="text-[7px] font-medium text-slate-200">
                  {person.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STATISTICS ================= */}

      <div
        className="
          mt-2 grid min-h-[53px]
          grid-cols-4 overflow-hidden
          rounded-lg
          border border-slate-700/50
          bg-slate-900/70
        "
      >
        {stats.slice(0, 4).map((stat, index) => (
          <div
            key={`${stat.label}-${index}`}
            className="relative flex flex-col items-center justify-center gap-1 px-1 py-2"
          >
            {index > 0 && (
              <span className="absolute bottom-[17%] left-0 top-[17%] w-px bg-slate-700/50" />
            )}

            <span className="whitespace-nowrap text-[7px] font-semibold text-slate-400">
              {stat.label}
            </span>

            <strong
              className={`
                text-[15px]
                font-black
                leading-none
                tracking-wide
                ${statTone[stat.tone] || "text-white"}
              `}
            >
              {stat.value}
            </strong>
          </div>
        ))}
      </div>

      {/* ================= EXTRA FEATURES ================= */}

      <div className="mt-2 grid grid-cols-2 gap-2">

        {/* FACE RECOGNITION */}

        <div
          className="
            rounded-lg
            border border-slate-800
            bg-slate-900/60
            px-2.5 py-2
            transition
            hover:border-emerald-500/30
            hover:bg-slate-900
          "
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />

              <span className="text-[8px] font-bold text-slate-300">
                Face Recognition
              </span>
            </div>

            <button
              type="button"
              onClick={() => setRecognition(!recognition)}
              className={`
                relative h-3.5 w-6 rounded-full transition
                ${recognition ? "bg-emerald-500" : "bg-slate-700"}
              `}
            >
              <span
                className={`
                  absolute top-0.5 h-2.5 w-2.5
                  rounded-full bg-white
                  transition-all
                  ${
                    recognition
                      ? "left-[13px]"
                      : "left-0.5"
                  }
                `}
              />
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-[7px] text-slate-500">
              Recognition Engine
            </span>

            <span className="text-[7px] font-bold text-emerald-400">
              {recognition ? "ACTIVE" : "OFF"}
            </span>
          </div>
        </div>

        {/* GATE STATUS */}

        <div
          className="
            rounded-lg
            border border-slate-800
            bg-slate-900/60
            px-2.5 py-2
            transition
            hover:border-cyan-500/30
            hover:bg-slate-900
          "
        >
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />

            <span className="text-[8px] font-bold text-slate-300">
              Gate Status
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-[7px] text-slate-500">
              Main Gate
            </span>

            <span className="flex items-center gap-1 text-[7px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              OPEN
            </span>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM INFORMATION ================= */}

      <div
        className="
          mt-2 flex items-center
          justify-between
          border-t border-slate-800
          pt-2
        "
      >
        <div className="flex items-center gap-1.5">
          <Clock3 className="h-3 w-3 text-slate-500" />

          <div>
            <p className="text-[7px] font-semibold text-slate-400">
              Last Scan
            </p>

            <p className="text-[8px] font-bold text-white">
              {activePerson?.time || "--:--"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-slate-500" />

          <div>
            <p className="text-[7px] font-semibold text-slate-400">
              Active Queue
            </p>

            <p className="text-right text-[8px] font-bold text-cyan-400">
              {safePeople.length} Students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />

          <div>
            <p className="text-[7px] font-semibold text-slate-400">
              System
            </p>

            <p className="text-[8px] font-bold text-emerald-400">
              Healthy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}