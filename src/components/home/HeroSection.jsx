import React from "react";

const HeroSection = ({ bgColor }) => {
  return (
    <section
      id="home"
      className={`relative overflow-hidden px-6 py-24 sm:py-32 ${bgColor.section}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:justify-between">
        
        {/* Left Content */}
        <div className="max-w-2xl text-center lg:text-left">

          <p
            className={`mb-4 inline-flex rounded-full border border-cyan-500/30 px-4 py-2 text-sm font-medium ${bgColor.badgeBlue}`}
          >
            Smart AI-powered solutions for modern brands
          </p>

          <h1
            className={`text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${bgColor.textPrimary}`}
          >
            Build beautiful digital experiences with confidence.
          </h1>

          <p
            className={`mt-6 text-lg leading-8 ${bgColor.textSecondary}`}
          >
            We create high-performance web products, modern portfolios,
            and intelligent management platforms for businesses that want
            to grow faster.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            
            <a
              href="#products"
              className={`rounded-full px-6 py-3 font-semibold transition ${bgColor.btnPrimary}`}
            >
              Explore Products
            </a>

            <a
              href="#services"
              className={`rounded-full px-6 py-3 font-semibold transition ${bgColor.btnOutline}`}
            >
              View Services
            </a>

          </div>
        </div>

        {/* Right Card */}
        <div
          className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${bgColor.cardGlass}`}
        >
          <div
            className={`rounded-2xl p-5 ${bgColor.cardBorder}`}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              Live Preview
            </p>

            <h2
              className={`mt-3 text-2xl font-semibold ${bgColor.textPrimary}`}
            >
              Facial Recognition Suite
            </h2>

            <p
              className={`mt-3 text-sm leading-6 ${bgColor.textMuted}`}
            >
              Secure identity management, smart monitoring, and efficient
              access control in one elegant dashboard.
            </p>

            {/* Stats */}
            <div className="mt-6 grid gap-3 text-sm">
              
              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${bgColor.card}`}
              >
                <span className={bgColor.textSecondary}>
                  Student Records
                </span>

                <span className="font-semibold text-cyan-400">
                  24/7
                </span>
              </div>

              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${bgColor.card}`}
              >
                <span className={bgColor.textSecondary}>
                  Face Verification
                </span>

                <span className="font-semibold text-cyan-400">
                  98.6%
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;