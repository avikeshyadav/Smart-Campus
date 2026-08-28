export default function StatusDot({ active = true }) {
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active
          ? "bg-emerald-400 shadow-[0_0_7px_rgba(74,222,128,.9)]"
          : "bg-slate-600"
      }`}
    />
  );
}
