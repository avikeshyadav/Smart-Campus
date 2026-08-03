import { useEffect, useState } from "react";
// import * as modules from "./index5";
import DashboardShell from "./DashboardShell";

const DashboardPage = () => {
  const [summary, setSummary] = useState({ totalStudents: 0, activeToday: 0, verifiedMatches: 0, alerts: 0 });
  const [students, setStudents] = useState([]);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students");
      const studentData = await res.json();

      setStudents(studentData);

      setSummary({
        totalStudents: studentData.length,
        activeToday: studentData.filter((student) => {
          const lastActive = new Date(student.lastActive);
          const today = new Date();
          return lastActive.toDateString() === today.toDateString();
        }).length ,
        verifiedMatches: 0,
        alerts: 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  loadDashboard();
}, []);

  // const componentEntries = Object.entries(modules);

  return (
    <DashboardShell title="Student Recognition Management">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <p className="text-sm text-slate-400">Total Students</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.totalStudents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <p className="text-sm text-slate-400">Active Today</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.activeToday}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <p className="text-sm text-slate-400">Verified Matches</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.verifiedMatches}%</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <p className="text-sm text-slate-400">Alerts</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.alerts}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Face Login Preview</h2>
            <button
              onClick={() => setCameraOn((prev) => !prev)}
              className="rounded-full border border-cyan-500/40 px-3 py-2 text-sm text-cyan-400"
            >
              {cameraOn ? "Camera On" : "Camera Off"}
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                <p className="font-semibold text-white">Secure Login Panel</p>
                <p className="mt-2">Email and password are hidden while face verification is active.</p>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
                  <p className="mt-2 font-mono text-sm text-slate-300">••••••••@example.com</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Password</p>
                  <p className="mt-2 font-mono text-sm text-slate-300">••••••••</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-slate-900 text-center text-slate-300">
                {cameraOn ? "Camera preview active\nFace scan ready" : "Camera paused\nEnable to resume"}
              </div>
            </div>
          </div>
        </section> 
{/*}
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {componentEntries.slice(0, 20).map(([key, Component]) => (
            <Component key={key} />
          ))}
        </section> */}
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
