import React from "react";

const HeroSection = ({ bgColor }) => {
  return (
    <section
      id="home"
      className={`relative overflow-hidden px-6 py-24 sm:py-32 ${bgColor.section}`}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-14 lg:flex-row lg:justify-between">

        {/* =====================================================
            LEFT CONTENT
        ===================================================== */}
        <div className="max-w-2xl text-center lg:text-left">

          {/* Badge */}
          <div
            className={`
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-cyan-500/30
              bg-cyan-500/5
              px-4
              py-2
              text-sm
              font-medium
              ${bgColor.badgeBlue}
            `}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>

            AI-Powered Smart Campus Platform
          </div>

          {/* Main Heading */}
          <h1
            className={`
              text-4xl
              font-bold
              leading-tight
              tracking-tight
              sm:text-5xl
              lg:text-6xl
              ${bgColor.textPrimary}
            `}
          >
            Smarter Campus.
            <br />

            <span className="text-cyan-400">
              Safer Students.
            </span>
          </h1>

          {/* Description */}
          <p
            className={`
              mt-6
              max-w-xl
              text-lg
              leading-8
              ${bgColor.textSecondary}
            `}
          >
            Student Vision is an intelligent campus management system that
            combines facial recognition, attendance monitoring, student
            management, live camera tracking, and real-time alerts in one
            powerful dashboard.
          </p>

          {/* Small Highlights */}
          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">

            {[
              "Facial Recognition",
              "Smart Attendance",
              "Live Monitoring",
            ].map((item) => (
              <span
                key={item}
                className="
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-900/50
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-slate-300
                  backdrop-blur
                "
              >
                ✓ {item}
              </span>
            ))}

          </div>

          {/* Buttons */}
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:items-start">

            <a
              href="#dashboard"
              className={`
                inline-flex
                items-center
                justify-center
                rounded-full
                px-7
                py-3.5
                font-semibold
                transition
                duration-300
                hover:scale-105
                ${bgColor.btnPrimary}
              `}
            >
              Explore Dashboard
              <span className="ml-2">→</span>
            </a>

            <a
              href="#products"
              className={`
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                px-7
                py-3.5
                font-semibold
                transition
                duration-300
                hover:border-cyan-400
                hover:bg-cyan-400/10
                ${bgColor.btnOutline}
              `}
            >
              View Modules
            </a>

          </div>

          {/* Trust Line */}
          <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">

            <div className="flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-cyan-500 text-xs font-bold text-slate-950">
                AI
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-purple-500 text-xs font-bold text-white">
                CV
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-teal-400 text-xs font-bold text-slate-950">
                IoT
              </span>
            </div>

            <p className={`text-xs ${bgColor.textMuted}`}>
              AI • Computer Vision • Smart Monitoring
            </p>

          </div>
        </div>


        {/* =====================================================
            RIGHT DASHBOARD PREVIEW
        ===================================================== */}
        <div className="relative w-full max-w-xl">

          {/* Glow */}
          <div className="absolute inset-10 rounded-full bg-cyan-500/10 blur-3xl" />

          <div
            className={`
              relative
              overflow-hidden
              rounded-[2rem]
              border
              p-3
              shadow-2xl
              backdrop-blur-xl
              ${bgColor.cardGlass}
            `}
          >

            {/* Fake Browser / Dashboard Header */}
            <div
              className={`
                overflow-hidden
                rounded-[1.5rem]
                border
                ${bgColor.cardBorder}
                ${bgColor.card}
              `}
            >

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    ◉
                  </div>

                  <div>
                    <p className="text-xs font-bold tracking-wider text-cyan-400">
                      STUDENT VISION
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Facial Recognition Console
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

                  <span className="text-[10px] font-semibold text-green-400">
                    LIVE
                  </span>

                </div>

              </div>


              {/* Dashboard Stats */}
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">

                {[
                  ["Students", "128", "cyan"],
                  ["Tracked", "24", "purple"],
                  ["Matches", "21", "teal"],
                  ["Alerts", "03", "orange"],
                ].map(([title, value]) => (
                  <div
                    key={title}
                    className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"
                  >
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">
                      {title}
                    </p>

                    <p className="mt-1 text-xl font-bold text-white">
                      {value}
                    </p>
                  </div>
                ))}

              </div>


              {/* Main Monitoring Area */}
              <div className="grid gap-4 px-5 pb-5 sm:grid-cols-[1.25fr_0.75fr]">

                {/* Camera */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">

                  <div className="mb-3 flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Connected Cameras
                      </p>

                      <p className="text-[9px] text-slate-500">
                        LIVE CAMERA MONITORING
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-[9px] text-green-400">
                      ● LIVE
                    </span>

                  </div>

                  {/* Camera Preview */}
                  <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">

                    {/* Face Scanner */}
                    <div className="relative h-24 w-20 rounded-2xl border border-cyan-400/60">

                      <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-cyan-400" />
                      <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-cyan-400" />
                      <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-cyan-400" />

                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

                    </div>

                    <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-[8px] text-cyan-400 backdrop-blur">
                      FACE DETECTED
                    </div>

                  </div>

                </div>


                {/* Alerts */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-semibold text-white">
                      Alerts
                    </p>

                    <span className="text-[9px] text-red-400">
                      03 NEW
                    </span>

                  </div>

                  <div className="mt-4 space-y-3">

                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                      <p className="text-[10px] font-semibold text-red-400">
                        Unauthorized Access
                      </p>

                      <p className="mt-1 text-[8px] text-slate-500">
                        Main Gate • Just now
                      </p>
                    </div>

                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                      <p className="text-[10px] font-semibold text-yellow-400">
                        Attendance Alert
                      </p>

                      <p className="mt-1 text-[8px] text-slate-500">
                        Classroom 102
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                      <p className="text-[10px] font-semibold text-cyan-400">
                        System Update
                      </p>

                      <p className="mt-1 text-[8px] text-slate-500">
                        All systems operational
                      </p>
                    </div>

                  </div>

                </div>

              </div>


              {/* Bottom System Status */}
              <div className="border-t border-slate-800 px-5 py-3">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-green-400" />

                    <span className="text-[9px] text-slate-400">
                      Monitoring System
                    </span>

                  </div>

                  <span className="text-[9px] font-semibold text-green-400">
                    HEALTHY
                  </span>

                </div>

              </div>

            </div>
          </div>

          {/* Floating Recognition Card */}
          <div
            className="
              absolute
              -bottom-5
              -left-5
              hidden
              rounded-2xl
              border
              border-cyan-500/20
              bg-slate-950/90
              px-4
              py-3
              shadow-2xl
              backdrop-blur-xl
              sm:block
            "
          >

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                ✓
              </div>

              <div>
                <p className="text-[10px] text-slate-500">
                  Recognition Status
                </p>

                <p className="text-xs font-semibold text-green-400">
                  Student Verified
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;