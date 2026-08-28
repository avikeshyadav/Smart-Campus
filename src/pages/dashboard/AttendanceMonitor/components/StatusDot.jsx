export default function StatusDot({
  active = false,
  color = "bg-emerald-400",
}) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      {active && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-50`}
        />
      )}

      <span
        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
          active
            ? color
            : "bg-slate-700"
        }`}
      />
    </span>
  );
}
