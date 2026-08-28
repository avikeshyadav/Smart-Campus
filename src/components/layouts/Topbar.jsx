import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { bgColor } from "../../bgColor/bgColor";
import {} from "../../context/AuthContext";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Products", href: "#products" },
  { name: "Contact", href: "#contact" },
];

const Topbar = ({ isLoggedIn ,onLogout}) => {
  const navigate = useNavigate(); 
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // =========================
  // Active Section Detection
  // =========================
  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter(Boolean);
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      let currentSection = "home";
      sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================
  // Close Mobile Menu
  // =========================
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  // =========================
  // Navigation
  // =========================
  const handleNavClick = (href) => {
    setIsMenuOpen(false);

    if (location.pathname !== "/") {
      navigate(`/${href}`);
    }
  };

  return (
    <>
      {/* =========================
          Header
      ========================= */}
      <header
        className={`
          fixed
          left-0
          top-0
          z-50
          w-full
          border-b
          border-white/10
          ${bgColor.header}
          shadow-lg
        `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* =========================
              Logo
          ========================= */}
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-2"
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-cyan-500
                font-bold
                text-slate-950
                shadow-lg
                shadow-cyan-500/20
                transition
                group-hover:scale-105
              "
            >
              P
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">
                Smart Campus
              </h1>

              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">
                Digital Solutions
              </p>
            </div>
          </Link>

          {/* =========================
              Desktop Navigation
          ========================= */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-2">
              {navItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;

                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`
                        relative
                        rounded-full
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-slate-300 hover:bg-white/5 hover:text-cyan-400"
                        }
                      `}
                    >
                      {item.name}

                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-cyan-400" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* =========================
              Desktop Auth
          ========================= */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="
                    rounded-full
                    border
                    border-cyan-500/50
                    px-5
                    py-2
                    text-sm
                    font-medium
                    text-cyan-400
                    transition
                    hover:bg-cyan-500/10
                    hover:border-cyan-400
                  "
                >
                  Dashboard
                </Link>

                <button
                  onClick={onLogout}
                  className="
                    rounded-full
                    bg-rose-500
                    px-5
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-rose-600
                    hover:shadow-lg
                    hover:shadow-rose-500/20
                  "
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`
                  rounded-full
                  px-6
                  py-2.5
                  text-sm
                  font-semibold
                  ${bgColor.btnPrimary}
                `}
              >
                Login Now →
              </Link>
            )}
          </div>

          {/* =========================
              Mobile Menu Button
          ========================= */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-700
              bg-slate-800/70
              text-xl
              text-white
              transition
              hover:border-cyan-500
              hover:text-cyan-400
              md:hidden
            "
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* =========================
            Mobile Menu
        ========================= */}
        {isMenuOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur-xl md:hidden">
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const sectionId = item.href.replace("#", "");
                  const isActive = activeSection === sectionId;

                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`
                          block
                          rounded-xl
                          px-4
                          py-3
                          text-sm
                          font-medium
                          transition
                          ${
                            isActive
                              ? "bg-cyan-500/10 text-cyan-400"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }
                        `}
                      >
                        {item.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile Auth */}
            <div className="mt-5 grid gap-3 border-t border-slate-800 pt-5">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="
                      rounded-xl
                      border
                      border-cyan-500/50
                      px-4
                      py-3
                      text-center
                      text-sm
                      font-semibold
                      text-cyan-400
                      transition
                      hover:bg-cyan-500/10
                    "
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="
                      rounded-xl
                      bg-rose-500
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-rose-600
                    "
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={`
                    rounded-xl
                    px-4
                    py-3
                    text-center
                    text-sm
                    font-semibold
                    ${bgColor.btnPrimary}
                  `}
                >
                  Login Now →
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Header Spacer */}
      <div className="h-[73px]" />
    </>
  );
};

export default Topbar;