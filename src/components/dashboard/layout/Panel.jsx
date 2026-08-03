import React from "react";
import { Link, useLocation } from "react-router-dom";

const breadcrumbMap = {
  "/dashboard": [{ label: "Dashboard", path: "/dashboard" }],
  "/dashboard/students": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/dashboard/students" },
  ],
  "/dashboard/students/view": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/dashboard/students" },
    { label: "View", path: "/dashboard/students/view" },
  ],
  "/dashboard/students/edit": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/dashboard/students" },
    { label: "Edit", path: "/dashboard/students/edit" },
  ],
  "/dashboard/students/search": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/dashboard/students" },
    { label: "Search", path: "/dashboard/students/search" },
  ],
  "/dashboard/students/more": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/dashboard/students" },
    { label: "More", path: "/dashboard/students/more" },
  ],
  "/dashboard/resume": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Resume Builder", path: "/dashboard/resume" },
  ],
  "/dashboard/settings": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Settings", path: "/dashboard/settings" },
  ],
    "/dashboard/accesscontrolboard": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Access Control", path: "/dashboard/accesscontrolboard" },
  ],
};

export const Panel = () => {
  const location = useLocation();
  const breadcrumbs = breadcrumbMap[location.pathname] || [
    { label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-3">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={item.path}>
              {index > 0 ? <span className="text-slate-600">/</span> : null}
              {isLast ? (
                <span className="font-medium text-cyan-400">{item.label}</span>
              ) : (
                <Link to={item.path} className="transition hover:text-cyan-400">
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <div className="ml-4 text-sm font-semibold text-white">
        {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
      </div>
    </div>
  );
};

