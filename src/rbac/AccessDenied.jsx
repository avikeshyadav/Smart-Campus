import { ArrowLeft, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <ShieldX size={32} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Your current role does not have permission to open this page.
          Contact the Super Admin if you need access.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
