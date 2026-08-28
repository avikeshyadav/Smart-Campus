export function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    cyan: { icon: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    rose: { icon: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    blue: { icon: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  };
  const theme = colors[color] || colors.cyan;

  return (
    <div className={`rounded-2xl border ${theme.border} bg-slate-900 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.bg} ${theme.icon}`}>
          <Icon size={18} />
        </div>
        <span className="text-[9px] uppercase tracking-wider text-slate-600">Live</span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

export function MiniInfo({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-cyan-400" />
        <span className="text-[9px] text-slate-600">{label}</span>
      </div>
      <p className="mt-1 text-xs font-semibold text-slate-300">{value}</p>
    </div>
  );
}

export function Detail({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-800/60">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-slate-600" />
        <span className="text-xs text-slate-500">{title}</span>
      </div>
      <span className="max-w-[55%] truncate text-xs font-semibold text-slate-300">{value || "--"}</span>
    </div>
  );
}

export function SystemItem({ label, value, active }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" : "bg-slate-600"}`} />
      </div>
      <p className={`mt-2 text-xs font-semibold ${active ? "text-emerald-400" : "text-slate-500"}`}>{value}</p>
    </div>
  );
}
