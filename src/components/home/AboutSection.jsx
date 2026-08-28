import React from "react";
import { bgColor } from "../../bgColor/bgColor";

const stats = [
  {
    title: "Fast delivery",
    value: "100%",
  },
  {
    title: "Client satisfaction",
    value: "98%",
  },
  {
    title: "Custom solutions",
    value: "24/7",
  },
];

const AboutSection = () => {
  return (
    <section
      id="about"
      className={`px-6 py-20 ${bgColor.sectionAlt}`}
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">

        {/* Left Content */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            About
          </p>

          <h2
            className={`mt-3 text-3xl font-bold sm:text-4xl ${bgColor.textPrimary}`}
          >
            We blend strategy, design, and engineering.
          </h2>

          <p
            className={`mt-5 text-lg leading-8 ${bgColor.textSecondary}`}
          >
            Our work is focused on creating polished digital experiences
            that feel premium, scale smoothly, and support real business
            goals.
          </p>

          {/* Small CTA */}
          <a
            href="#contact"
            className={`
              mt-7
              inline-flex
              rounded-full
              px-6
              py-3
              text-sm
              font-semibold
              transition
              ${bgColor.btnPrimary}
            `}
          >
            Let's Work Together
          </a>
        </div>

        {/* Stats Card */}
        <div
          className={`
            rounded-3xl
            border
            p-8
            shadow-xl
            ${bgColor.cardGlass}
          `}
        >
          <div className="grid gap-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className={`
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  px-4
                  py-4
                  transition
                  hover:border-cyan-500/40
                  ${bgColor.border}
                  ${bgColor.card}
                `}
              >
                <span className={bgColor.textSecondary}>
                  {stat.title}
                </span>

                <span className="font-semibold text-cyan-400">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;