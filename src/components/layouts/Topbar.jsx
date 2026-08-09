import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Topbar = ({ isLoggedIn, onLogin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    document.cookie = "auth_user=; path=/; max-age=0";
    onLogin(false);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-md shadow-lg z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-cyan-400">
          Portfolio
        </Link>

        <nav>
          <ul className="hidden items-center gap-8 font-medium text-white md:flex">
            <li>
              <a href="#home" className="transition hover:text-cyan-400">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="transition hover:text-cyan-400">
                About
              </a>
            </li>

            <li>
              <a href="#skills" className="transition hover:text-cyan-400">
                Skills
              </a>
            </li>

            <li>
              <a href="#projects" className="transition hover:text-cyan-400">
                Projects
              </a>
            </li>

            <li>
              <a href="#contact" className="transition hover:text-cyan-400">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {isLoggedIn ? (
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/dashboard"
              className="rounded-full border border-cyan-500 px-4 py-2 text-sm text-cyan-400 transition hover:bg-cyan-500/10"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden rounded-full bg-cyan-500 px-5 py-2 text-white transition hover:bg-cyan-600 md:block"
          >
            Login Now
          </Link>
        )}

        <button className="text-3xl text-white md:hidden">☰</button>
      </div>
    </header>
  );
};

export default Topbar;