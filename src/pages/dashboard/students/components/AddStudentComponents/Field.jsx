import { CheckCircle2 } from "lucide-react";

export default function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
  icon: Icon,
}) {
  const valid = value.trim().length > 0;

  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3 text-slate-500" />}

          <span className="text-[8px] uppercase tracking-wider text-slate-500">
            {label}
          </span>
        </div>

        {required && valid && (
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        )}
      </div>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-lg border border-slate-800
          bg-slate-950/50 px-3 py-2.5 text-xs text-slate-200
          outline-none transition placeholder:text-slate-700
          focus:border-emerald-400/40 focus:ring-1
          focus:ring-emerald-400/20
        "
      />
    </label>
  );
}
