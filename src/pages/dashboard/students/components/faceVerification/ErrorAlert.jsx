import { XCircle } from "lucide-react";

export default function ErrorAlert({ error }) {
  if (!error) return null;

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
      <XCircle size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Verification Failed</p>
        <p className="mt-1 text-rose-300/70">{error}</p>
      </div>
    </div>
  );
}
