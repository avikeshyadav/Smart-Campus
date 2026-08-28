import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Panel = () => {
  const { pathname } = useLocation();

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => ({
      label: segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      path: "/" + array.slice(0, index + 1).join("/"),
    }));

  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-3">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={item.path}>
              {index > 0 && <span>/</span>}

              {isLast ? (
                <span className="font-medium text-cyan-400">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-cyan-400 transition"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <div className="text-sm font-semibold text-white">
        
        {breadcrumbs.at(-1)?.label}
      </div>
    </div>
  );
};