import React from "react";
import { bgColor } from "../../bgColor/bgColor";

const products = [
  {
    title: "Student Management",
    short: "STUDENTS",
    icon: "👨‍🎓",
    text: "Manage student profiles, academic information, records, and registered facial data from one centralized platform.",
    features: ["Student Profiles", "Records", "Search & Management"],
  },
  {
    title: "Facial Recognition",
    short: "AI / CV",
    icon: "◉",
    text: "Identify registered students through facial recognition and support automated attendance and monitoring.",
    features: ["Face Detection", "Face Matching", "Recognition"],
  },
  {
    title: "Attendance Monitor",
    short: "LIVE",
    icon: "✓",
    text: "Track student attendance in real time and maintain accurate attendance records with less manual effort.",
    features: ["Live Attendance", "Class Tracking", "Attendance Records"],
  },
  {
    title: "Camera Monitoring",
    short: "CAMERAS",
    icon: "▣",
    text: "Monitor connected campus cameras and check their availability and operational status from the dashboard.",
    features: ["Live Cameras", "Camera Status", "Monitoring"],
  },
  {
    title: "Alerts & Notifications",
    short: "ALERTS",
    icon: "!",
    text: "Receive important notifications such as unauthorized access, attendance issues, and device-related alerts.",
    features: ["Priority Alerts", "Notifications", "Event Monitoring"],
  },
  {
    title: "System Health",
    short: "SYSTEM",
    icon: "⌁",
    text: "Monitor CPU, memory, storage, network and connected devices to maintain a reliable smart-campus system.",
    features: ["CPU Usage", "Memory", "Network & Storage"],
  },
];

const ProductsSection = () => {
  return (
    <section
      id="products"
      className={`relative overflow-hidden px-6 py-20 ${bgColor.section}`}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Smart Campus Modules
          </p>

          <h2
            className={`mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl ${bgColor.textPrimary}`}
          >
            Everything you need to manage a
            <span className="text-cyan-400"> smarter campus.</span>
          </h2>

          <p
            className={`mt-5 text-base leading-7 ${bgColor.textMuted}`}
          >
            Student Vision brings student management, facial recognition,
            attendance, monitoring, alerts and system health together in one
            intelligent platform.
          </p>
        </div>

        {/* System Flow */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">

          {[
            "Students",
            "Recognition",
            "Attendance",
            "Alerts",
            "Analytics",
          ].map((item, index) => (
            <React.Fragment key={item}>

              <div
                className={`rounded-full border px-4 py-2 text-xs font-semibold ${bgColor.border} ${bgColor.card}`}
              >
                <span className="text-cyan-400">
                  {String(index + 1).padStart(2, "0")}
                </span>{" "}
                <span className={bgColor.textSecondary}>
                  {item}
                </span>
              </div>

              {index < 4 && (
                <span className="hidden text-cyan-500/50 sm:block">
                  →
                </span>
              )}

            </React.Fragment>
          ))}

        </div>

        {/* Product Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {products.map((product, index) => (
            <div
              key={product.title}
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

              {/* Top Glow */}
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-400/20" />

              {/* Card Top */}
              <div className="relative flex items-center justify-between">

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
                    transition
                    duration-300
                    group-hover:bg-cyan-500
                    group-hover:text-white
                  "
                >
                  {product.icon}
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-cyan-500/20
                    bg-cyan-500/5
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    tracking-wider
                    text-cyan-400
                  "
                >
                  {product.short}
                </span>

              </div>

              {/* Number */}
              <p className="mt-6 text-xs font-bold tracking-widest text-slate-600">
                MODULE {String(index + 1).padStart(2, "0")}
              </p>

              {/* Title */}
              <h3
                className={`mt-2 text-xl font-semibold ${bgColor.textPrimary}`}
              >
                {product.title}
              </h3>

              {/* Description */}
              <p
                className={`mt-3 text-sm leading-6 ${bgColor.textMuted}`}
              >
                {product.text}
              </p>

              {/* Features */}
              <div className="mt-5 space-y-2">

                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-cyan-400">✓</span>

                    <span className={bgColor.textSecondary}>
                      {feature}
                    </span>
                  </div>
                ))}

              </div>

              {/* Bottom Link */}
              <a
                href="#dashboard"
                className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold transition group-hover:gap-3 ${bgColor.link}`}
              >
                Explore Module
                <span>→</span>
              </a>

            </div>
          ))}

        </div>

        {/* Bottom Status */}
        <div
          className={`
            mx-auto
            mt-10
            max-w-4xl
            rounded-2xl
            border
            p-4
            ${bgColor.border}
            ${bgColor.card}
          `}
        >
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">

            <div className="flex items-center gap-3">

              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
              </span>

              <span
                className={`text-sm font-medium ${bgColor.textSecondary}`}
              >
                Student Vision Monitoring System
              </span>

            </div>

            <span className="text-xs font-semibold text-green-400">
              SYSTEM HEALTHY • READY
            </span>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductsSection;