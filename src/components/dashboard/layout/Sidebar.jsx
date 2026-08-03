import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { dashboardNavItems } from "../../Data/dashboardNavItems";
// import logo from "../../assets/logo.png"; // Agar logo image hai to uncomment kare

const Sidebar = () => {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState("");

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === path
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    const matchedItem = dashboardNavItems.find((item) =>
      item.subItems?.some((subItem) => subItem.path === location.pathname)
    );

    if (matchedItem) {
      setOpenGroup(matchedItem.label);
    }
  }, [location.pathname]);

  const toggleGroup = (label) => {
    setOpenGroup((prev) => (prev === label ? "" : label));
  };

  return (    
    <aside className="hidden h-screen w-72 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">

      {/* ================= HEADER ================= */}

      <div className="border-b border-slate-800 px-5 py-5">

        <div className="flex items-center gap-3">

          {/* Agar image use karni ho */}

          {/* <img
            src={logo}
            alt="Logo"
            className="h-12 w-12 rounded-xl object-cover"
          /> */}

          {/* Dummy Logo */}

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg">
            SV
          </div>

          <div>

            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
              Dashboard
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Student Vision
            </h2>

          </div>

        </div>

      </div>

      {/* ================= NAVIGATION ================= */}

      <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">

        <nav className="space-y-2">

          {dashboardNavItems.map((item) => {
            const active = isActive(item.path);

            const showSubItems =
              item.subItems?.length &&
              openGroup === item.label;

            return (
              <div key={item.label}>

                {item.subItems?.length ? (
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-transparent text-slate-300 hover:border-cyan-500 hover:bg-slate-900 hover:text-cyan-400"
                    }`}
                  >
                    <span>{item.label}</span>

                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${
                        showSubItems ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>

                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-transparent text-slate-300 hover:border-cyan-500 hover:bg-slate-900 hover:text-cyan-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    showSubItems
                      ? "mt-2 max-h-96"
                      : "max-h-0"
                  }`}
                >
                  <div className="ml-4 border-l border-slate-700 pl-4">

                    {item.subItems?.map((subItem) => {

                      const subActive =
                        location.pathname ===
                        subItem.path;

                      return (
                        <Link
                          key={subItem.label}
                          to={subItem.path}
                          className={`group mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
                            subActive
                              ? "bg-cyan-500/15 font-medium text-cyan-400"
                              : "text-slate-400 hover:bg-slate-900 hover:pl-5 hover:text-cyan-400"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              subActive
                                ? "bg-cyan-400"
                                : "bg-slate-600 group-hover:bg-cyan-400"
                            }`}
                          />

                          {subItem.label}

                        </Link>
                      );
                    })}

                  </div>
                </div>

              </div>
            );
          })}

        </nav>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="border-t border-slate-800 p-4">

        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-5">

          <p className="text-sm font-semibold text-cyan-400">
            Live Status
          </p>

          <div className="mt-4 space-y-3">

            <div className="flex justify-between text-sm text-slate-300">
              <span>Students</span>
              <span className="font-semibold text-white">
                128
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-300">
              <span>Accuracy</span>
              <span className="font-semibold text-cyan-400">
                93%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div className="h-full w-[93%] rounded-full bg-cyan-400 transition-all duration-500"></div>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;