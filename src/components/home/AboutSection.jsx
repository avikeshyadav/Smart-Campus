import React from "react";
import { bgColor } from "../../bgColor/bgColor";

const features = [
  {
    title: "Smart Attendance",
    value: "AI",
    description: "Automated student attendance using facial recognition.",
  },
  {
    title: "Live Monitoring",
    value: "24/7",
    description: "Monitor connected campus cameras and student activity.",
  },
  {
    title: "Real-time Alerts",
    value: "LIVE",
    description: "Get instant notifications for important campus events.",
  },
];

const AboutSection = () => {
  return (
    <section
      id="about"
      className={`relative overflow-hidden px-6 py-20 ${bgColor.sectionAlt}`}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

        {/* LEFT CONTENT */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            About Student Vision
          </p>

          <h2
            className={`mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl ${bgColor.textPrimary}`}
          >
            Smarter Campus.
            <br />
            <span className="text-cyan-400">
              Better Student Management.
            </span>
          </h2>

          <p
            className={`mt-6 max-w-2xl text-lg leading-8 ${bgColor.textSecondary}`}
          >
            Student Vision is a smart campus management platform designed to
            simplify student monitoring, attendance management and campus
            security through facial recognition and real-time technology.
          </p>

          <p
            className={`mt-4 max-w-2xl text-base leading-7 ${bgColor.textSecondary}`}
          >
            The platform provides administrators with a centralized dashboard
            to manage students, monitor cameras, track attendance, receive
            alerts and check the health of connected devices and systems.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#features"
              className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold transition hover:scale-105 ${bgColor.btnPrimary}`}
            >
              Explore Features
            </a>

            <a
              href="#dashboard"
              className="inline-flex rounded-full border border-cyan-500/30 px-6 py-3 text-sm font-semibold text-cyan-400 transition hover:border-cyan-400 hover:bg-cyan-400/10"
            >
              View Dashboard
            </a>
          </div>
        </div>

        {/* RIGHT FEATURE CARD */}
        <div
          className={`
            rounded-3xl
            border
            p-6
            shadow-2xl
            backdrop-blur-xl
            ${bgColor.cardGlass}
          `}
        >
          {/* Card Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400">
                Smart Campus
              </p>

              <h3
                className={`mt-1 text-xl font-bold ${bgColor.textPrimary}`}
              >
                Student Vision
              </h3>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-400">
                System Live
              </span>
            </div>
          </div>

          {/* Feature List */}
          <div className="grid gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`
                  group
                  rounded-2xl
                  border
                  p-4
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-cyan-500/40
                  hover:bg-cyan-500/5
                  ${bgColor.border}
                  ${bgColor.card}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4
                      className={`font-semibold ${bgColor.textPrimary}`}
                    >
                      {feature.title}
                    </h4>

                    <p
                      className={`mt-1 text-sm leading-6 ${bgColor.textSecondary}`}
                    >
                      {feature.description}
                    </p>
                  </div>

                  <span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-sm font-bold text-cyan-400">
                    {feature.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Status */}
          <div className="mt-5 rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${bgColor.textSecondary}`}>
                Monitoring System
              </span>

              <span className="text-sm font-semibold text-green-400">
                ● Healthy
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[92%] rounded-full bg-cyan-400" />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Real-time monitoring and centralized administration
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;