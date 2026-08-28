import React from "react";
import { bgColor } from "../../bgColor/bgColor";

const services = [
  {
    title: "Web Development",
    description: "Modern responsive websites and React-based apps.",
  },
  {
    title: "UI/UX Design",
    description: "Elegant interfaces crafted for user delight.",
  },
  {
    title: "AI Dashboards",
    description:
      "Smart management systems for students, staff, and operations.",
  },
  {
    title: "Growth Strategy",
    description:
      "Brand presence, product positioning, and digital marketing support.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className={`px-6 py-20 ${bgColor.section}`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Services
          </p>

          <h2
            className={`mt-3 text-3xl font-bold sm:text-4xl ${bgColor.textPrimary}`}
          >
            Everything you need to launch faster
          </h2>

          <p
            className={`mx-auto mt-4 max-w-2xl ${bgColor.textMuted}`}
          >
            Powerful digital solutions designed to help your business
            grow, manage and scale efficiently.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className={`
                rounded-2xl
                border
                ${bgColor.border}
                ${bgColor.card}
                p-6
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-cyan-500/50
                hover:shadow-lg
                hover:shadow-cyan-950/20
              `}
            >
              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-xl text-cyan-400">
                ✦
              </div>

              <h3
                className={`text-xl font-semibold ${bgColor.textPrimary}`}
              >
                {service.title}
              </h3>

              <p
                className={`mt-3 text-sm leading-6 ${bgColor.textMuted}`}
              >
                {service.description}
              </p>

              {/* Learn More */}
              <button
                className={`mt-5 text-sm font-semibold ${bgColor.link}`}
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;