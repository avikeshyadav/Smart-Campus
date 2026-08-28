import React from "react";
import { bgColor } from "../../bgColor/bgColor";

const products = [
  {
    title: "Portfolio Platform",
    text: "A modern personal brand experience with strong storytelling and conversion focused sections.",
  },
  {
    title: "Student Management",
    text: "Clean records, smart dashboards, and automation for educational institutions.",
  },
  {
    title: "Facial Recognition Console",
    text: "Advanced recognition monitoring, student access management, and audit-ready workflow.",
  },
];

const ProductsSection = () => {
  return (
    <section
      id="products"
      className={`px-6 py-20 ${bgColor.section}`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10 flex flex-col gap-3 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Products
          </p>

          <h2
            className={`text-3xl font-bold sm:text-4xl ${bgColor.textPrimary}`}
          >
            Built for modern growth and operational clarity
          </h2>

          <p
            className={`max-w-2xl text-sm leading-6 ${bgColor.textMuted}`}
          >
            Powerful products designed to simplify operations, improve
            productivity and create better digital experiences.
          </p>
        </div>

        {/* Products */}
        <div className="grid gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.title}
              className={`
                group
                rounded-3xl
                border
                ${bgColor.border}
                ${bgColor.cardGlass}
                p-6
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-cyan-500/40
                hover:shadow-cyan-950/30
              `}
            >
              {/* Icon */}
              <div
                className="
                  mb-6
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-500/10
                  text-2xl
                  text-cyan-400
                  transition
                  group-hover:bg-cyan-500
                  group-hover:text-white
                "
              >
                ✦
              </div>

              {/* Title */}
              <h3
                className={`text-xl font-semibold ${bgColor.textPrimary}`}
              >
                {product.title}
              </h3>

              {/* Description */}
              <p
                className={`mt-4 text-sm leading-6 ${bgColor.textMuted}`}
              >
                {product.text}
              </p>

              {/* Link */}
              <a
                href="#contact"
                className={`mt-6 inline-flex text-sm font-semibold transition ${bgColor.link}`}
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;