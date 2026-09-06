import React from "react";
import { bgColor } from "../../bgColor/bgColor";

const services = [
  {
    number: "01",
    icon: "◉",
    title: "Facial Recognition",
    description:
      "AI-powered facial recognition helps identify registered students quickly and supports automated campus monitoring.",
    points: ["Face Detection", "Face Matching", "Student Verification"],
  },
  {
    number: "02",
    icon: "✓",
    title: "Smart Attendance",
    description:
      "Automate attendance tracking and maintain accurate student attendance records with minimum manual effort.",
    points: ["Auto Attendance", "Real-time Tracking", "Attendance Records"],
  },
  {
    number: "03",
    icon: "▣",
    title: "Live Camera Monitoring",
    description:
      "Monitor connected campus cameras and view their availability and operational status from a centralized dashboard.",
    points: ["Camera Status", "Live Monitoring", "Device Tracking"],
  },
  {
    number: "04",
    icon: "!",
    title: "Alerts & Security",
    description:
      "Receive real-time alerts for unauthorized access, attendance issues, unusual activity and system events.",
    points: ["Instant Alerts", "Security Events", "Notifications"],
  },
  {
    number: "05",
    icon: "👨‍🎓",
    title: "Student Management",
    description:
      "Manage student profiles, academic information, recognition data and other records from one platform.",
    points: ["Student Profiles", "Search", "Record Management"],
  },
  {
    number: "06",
    icon: "⌁",
    title: "System Health",
    description:
      "Monitor infrastructure health including CPU, memory, storage, network and connected devices.",
    points: ["CPU & Memory", "Storage", "Network Status"],
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className={`relative overflow-hidden px-6 py-20 ${bgColor.section}`}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* =====================================================
            SECTION HEADING
        ===================================================== */}

        <div className="mx-auto mb-12 max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Smart Campus Services
          </p>

          <h2
            className={`mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl ${bgColor.textPrimary}`}
          >
            Intelligent services for a
            <span className="text-cyan-400"> smarter campus.</span>
          </h2>

          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-7 ${bgColor.textMuted}`}
          >
            Student Vision combines AI, computer vision and centralized
            management tools to make campus operations smarter, safer and
            more efficient.
          </p>

        </div>


        {/* =====================================================
            SERVICE FLOW
        ===================================================== */}

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">

          {[
            "Recognize",
            "Monitor",
            "Track",
            "Alert",
            "Analyze",
          ].map((item, index) => (
            <React.Fragment key={item}>

              <div
                className={`
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  ${bgColor.border}
                  ${bgColor.card}
                `}
              >
                <span className="text-cyan-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className={`ml-2 ${bgColor.textSecondary}`}>
                  {item}
                </span>
              </div>

              {index < 4 && (
                <span className="hidden text-cyan-500/40 sm:block">
                  →
                </span>
              )}

            </React.Fragment>
          ))}

        </div>


        {/* =====================================================
            SERVICE CARDS
        ===================================================== */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {services.map((service) => (
            <div
              key={service.title}
              className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                p-6
                shadow-xl
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-cyan-500/40
                hover:shadow-cyan-950/30
                ${bgColor.border}
                ${bgColor.cardGlass}
              `}
            >

              {/* Card Glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-12
                  -top-12
                  h-32
                  w-32
                  rounded-full
                  bg-cyan-500/10
                  blur-3xl
                  transition
                  group-hover:bg-cyan-400/20
                "
              />


              {/* Top Row */}
              <div className="relative flex items-center justify-between">

                {/* Icon */}
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-cyan-500/20
                    bg-cyan-500/10
                    text-xl
                    font-bold
                    text-cyan-400
                    transition-all
                    duration-300
                    group-hover:bg-cyan-500
                    group-hover:text-white
                  "
                >
                  {service.icon}
                </div>


                {/* Number */}
                <span className="text-xs font-bold tracking-widest text-slate-600">
                  {service.number}
                </span>

              </div>


              {/* Title */}
              <h3
                className={`
                  relative
                  mt-6
                  text-xl
                  font-semibold
                  ${bgColor.textPrimary}
                `}
              >
                {service.title}
              </h3>


              {/* Description */}
              <p
                className={`
                  relative
                  mt-3
                  text-sm
                  leading-6
                  ${bgColor.textMuted}
                `}
              >
                {service.description}
              </p>


              {/* Feature Points */}
              <div className="relative mt-5 space-y-2">

                {service.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-cyan-400">
                      ✓
                    </span>

                    <span className={bgColor.textSecondary}>
                      {point}
                    </span>
                  </div>
                ))}

              </div>


              {/* Bottom Link */}
              <button
                type="button"
                className={`
                  relative
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                  group-hover:gap-3
                  ${bgColor.link}
                `}
              >
                Explore Service
                <span>→</span>
              </button>

            </div>
          ))}

        </div>


        {/* =====================================================
            BOTTOM STATUS
        ===================================================== */}

        <div
          className={`
            mx-auto
            mt-12
            max-w-4xl
            rounded-2xl
            border
            p-5
            ${bgColor.border}
            ${bgColor.card}
          `}
        >

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

            <div className="flex items-center gap-3">

              <span className="relative flex h-3 w-3">

                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-green-400
                    opacity-75
                  "
                />

                <span className="relative h-3 w-3 rounded-full bg-green-400" />

              </span>

              <div>

                <p
                  className={`text-sm font-semibold ${bgColor.textPrimary}`}
                >
                  Student Vision Platform
                </p>

                <p className="text-xs text-slate-500">
                  Integrated smart-campus services
                </p>

              </div>

            </div>


            <div className="flex items-center gap-4 text-xs">

              <span className="text-cyan-400">
                AI Powered
              </span>

              <span className="text-slate-700">
                •
              </span>

              <span className="text-green-400">
                System Ready
              </span>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ServicesSection;