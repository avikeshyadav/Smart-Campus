import React from "react";

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 px-6 py-12 text-slate-300">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-0 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Main Footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">

            <div className="flex items-center gap-3">

              {/* Logo */}
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-cyan-500/20
                  bg-cyan-500/10
                  text-xl
                  font-bold
                  text-cyan-400
                "
              >
                ◉
              </div>

              <div>
                <h3 className="text-lg font-bold tracking-wide text-white">
                  STUDENT VISION
                </h3>

                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                  Smart Campus System
                </p>
              </div>

            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              An AI-powered smart campus platform designed for student
              management, facial recognition, automated attendance,
              real-time monitoring and campus security.
            </p>

            {/* Technology Tags */}
            <div className="mt-5 flex flex-wrap gap-2">

              {[
                "AI",
                "Computer Vision",
                "Facial Recognition",
                "Smart Monitoring",
              ].map((item) => (
                <span
                  key={item}
                  className="
                    rounded-full
                    border
                    border-slate-800
                    bg-slate-900
                    px-3
                    py-1.5
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  {item}
                </span>
              ))}

            </div>
          </div>


          {/* Quick Links */}
          <div>

            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-sm">

              <a
                href="#home"
                className="transition hover:translate-x-1 hover:text-cyan-400"
              >
                Home
              </a>

              <a
                href="#about"
                className="transition hover:translate-x-1 hover:text-cyan-400"
              >
                About
              </a>

              <a
                href="#products"
                className="transition hover:translate-x-1 hover:text-cyan-400"
              >
                Modules
              </a>

              <a
                href="#services"
                className="transition hover:translate-x-1 hover:text-cyan-400"
              >
                Services
              </a>

              <a
                href="#contact"
                className="transition hover:translate-x-1 hover:text-cyan-400"
              >
                Contact
              </a>

            </div>
          </div>


          {/* System Modules */}
          <div>

            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              System Modules
            </h4>

            <div className="mt-5 space-y-3 text-sm text-slate-400">

              <p className="transition hover:text-cyan-400">
                ◉ Facial Recognition
              </p>

              <p className="transition hover:text-cyan-400">
                ✓ Smart Attendance
              </p>

              <p className="transition hover:text-cyan-400">
                ▣ Camera Monitoring
              </p>

              <p className="transition hover:text-cyan-400">
                ! Security Alerts
              </p>

              <p className="transition hover:text-cyan-400">
                ⌁ System Health
              </p>

            </div>
          </div>

        </div>


        {/* System Status */}
        <div
          className="
            mt-10
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/50
            p-4
          "
        >

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

            <div className="flex items-center gap-3">

              <span className="relative flex h-2.5 w-2.5">

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

                <span className="relative h-2.5 w-2.5 rounded-full bg-green-400" />

              </span>

              <div>
                <p className="text-xs font-semibold text-slate-300">
                  Student Vision System
                </p>

                <p className="text-[10px] text-slate-500">
                  AI monitoring platform
                </p>
              </div>

            </div>


            <div className="flex items-center gap-5 text-[10px]">

              <span className="text-green-400">
                ● SYSTEM HEALTHY
              </span>

              <span className="hidden text-slate-700 sm:block">
                |
              </span>

              <span className="text-slate-500">
                SMART CAMPUS
              </span>

            </div>

          </div>

        </div>


        {/* Bottom Footer */}
        <div
          className="
            mt-8
            flex
            flex-col
            gap-4
            border-t
            border-slate-800
            pt-6
            text-center
            text-xs
            text-slate-500
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:text-left
          "
        >

          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-400">
              Student Vision
            </span>
            . All rights reserved.
          </p>

          <p>
            AI • Computer Vision • Smart Campus
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;