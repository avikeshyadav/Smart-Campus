import React from "react";
import DashboardShell from "../DashboardShell";
const AlertCenter = () => (
  <DashboardShell title="Alert Center">
  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white">Alert Center</h3>
      <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-400">
        Live
      </span>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-400">View suspicious activity and priority alerts.</p>
  </div>
  </DashboardShell>
);

export default AlertCenter;
