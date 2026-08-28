import React, { useState } from "react";
import { bgColor } from "../../bgColor/bgColor";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact Form:", formData);

    // Yahan baad mein API call laga sakte ho
    // Example:
    // await axios.post("/api/contact", formData);

    alert("Thank you! We will contact you soon.");
  };

  return (
    <section
      id="contact"
      className={`px-6 py-20 ${bgColor.section}`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Contact
          </p>

          <h2
            className={`mt-3 text-3xl font-bold sm:text-4xl ${bgColor.textPrimary}`}
          >
            Ready to launch your next big idea?
          </h2>

          <p
            className={`mx-auto mt-4 max-w-2xl text-lg ${bgColor.textSecondary}`}
          >
            Let’s build a product that feels premium, performs fast,
            and supports your long-term growth.
          </p>
        </div>

        {/* Main Contact Area */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Contact Information */}
          <div
            className={`
              rounded-3xl
              border
              p-8
              ${bgColor.border}
              ${bgColor.cardGlass}
            `}
          >
            <h3
              className={`text-2xl font-semibold ${bgColor.textPrimary}`}
            >
              Let's talk
            </h3>

            <p
              className={`mt-3 text-sm leading-6 ${bgColor.textMuted}`}
            >
              Have a project, idea, or question? Send us a message
              and our team will get back to you.
            </p>

            <div className="mt-8 space-y-6">

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  ✉
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Email
                  </p>

                  <a
                    href="mailto:hello@yourportfolio.com"
                    className="mt-1 block text-sm font-medium text-white hover:text-cyan-400"
                  >
                    hello@yourportfolio.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  ☎
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Phone
                  </p>

                  <a
                    href="tel:+919999999999"
                    className="mt-1 block text-sm font-medium text-white hover:text-cyan-400"
                  >
                    +91 99999 99999
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  📍
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    India
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  ⏰
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Working Hours
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    Mon - Sat, 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

            </div>

            {/* Social Links */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <p className="mb-4 text-sm text-slate-400">
                Follow us
              </p>

              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-300 transition hover:bg-cyan-500 hover:text-white"
                >
                  in
                </a>

                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-300 transition hover:bg-cyan-500 hover:text-white"
                >
                  X
                </a>

                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-300 transition hover:bg-cyan-500 hover:text-white"
                >
                  Git
                </a>

                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-300 transition hover:bg-cyan-500 hover:text-white"
                >
                  IG
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className={`
              rounded-3xl
              border
              p-8
              lg:col-span-2
              ${bgColor.border}
              ${bgColor.cardGlass}
            `}
          >
            <h3
              className={`text-2xl font-semibold ${bgColor.textPrimary}`}
            >
              Send us a message
            </h3>

            <p className={`mt-2 text-sm ${bgColor.textMuted}`}>
              Fill out the form and we will get back to you as soon
              as possible.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              {/* Name + Email */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="name"
                    className={`mb-2 block text-sm font-medium ${bgColor.textSecondary}`}
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className={`w-full rounded-xl px-4 py-3 ${bgColor.input}`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className={`mb-2 block text-sm font-medium ${bgColor.textSecondary}`}
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className={`w-full rounded-xl px-4 py-3 ${bgColor.input}`}
                  />
                </div>

              </div>

              {/* Phone + Service */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="phone"
                    className={`mb-2 block text-sm font-medium ${bgColor.textSecondary}`}
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 99999 99999"
                    className={`w-full rounded-xl px-4 py-3 ${bgColor.input}`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className={`mb-2 block text-sm font-medium ${bgColor.textSecondary}`}
                  >
                    Interested In
                  </label>

                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-xl px-4 py-3 ${bgColor.input}`}
                  >
                    <option value="">
                      Select a service
                    </option>

                    <option value="web-development">
                      Web Development
                    </option>

                    <option value="ui-ux">
                      UI/UX Design
                    </option>

                    <option value="ai-dashboard">
                      AI Dashboard
                    </option>

                    <option value="student-management">
                      Student Management
                    </option>

                    <option value="facial-recognition">
                      Facial Recognition
                    </option>
                  </select>
                </div>

              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className={`mb-2 block text-sm font-medium ${bgColor.textSecondary}`}
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  required
                  className={`w-full resize-none rounded-xl px-4 py-3 ${bgColor.input}`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  px-7
                  py-3
                  font-semibold
                  transition
                  ${bgColor.btnPrimary}
                `}
              >
                Send Message →
              </button>

            </form>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={`
            mt-10
            rounded-3xl
            border
            p-8
            text-center
            ${bgColor.border}
            bg-gradient-to-br from-cyan-500/10 to-slate-900
          `}
        >
          <h3
            className={`text-2xl font-bold ${bgColor.textPrimary}`}
          >
            Prefer a quick conversation?
          </h3>

          <p className={`mt-2 ${bgColor.textMuted}`}>
            You can reach us directly through email or phone.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="mailto:hello@yourportfolio.com"
              className={`rounded-full px-6 py-3 font-semibold ${bgColor.btnPrimary}`}
            >
              Send Email
            </a>

            <a
              href="tel:+919999999999"
              className={`rounded-full px-6 py-3 font-semibold ${bgColor.btnOutline}`}
            >
              Call Us
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;