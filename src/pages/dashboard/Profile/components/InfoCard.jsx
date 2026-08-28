import React from "react";

/**
 * InfoCard - shared card shell used by every profile section.
 * Props: title, icon (optional node), children, action (optional node, top-right)
 */
export function InfoCard({ title, children, action }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * Row - a single label/value line inside an InfoCard.
 * Props: label, value, valueClassName
 */
export function Row({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`text-slate-100 text-right ${valueClassName}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

/**
 * Pill - small status/badge chip, used for verification/toggle states.
 * tone: "good" | "warn" | "bad" | "neutral"
 */
export function Pill({ label, tone = "neutral" }) {
  const tones = {
    good: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
    bad: "bg-red-500/15 text-red-400 ring-red-500/30",
    neutral: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
