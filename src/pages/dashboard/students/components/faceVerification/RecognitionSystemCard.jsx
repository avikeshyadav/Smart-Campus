import { Activity } from "lucide-react";
import { SystemItem } from "./UIHelpers";

export default function RecognitionSystemCard({ cameraOn }) {
  return (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <div className="mb-4 flex items-center gap-2">

              <Activity
                size={17}
                className="text-cyan-400"
              />

              <h3 className="font-bold">
                Recognition System
              </h3>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <SystemItem
                label="Camera"
                value={cameraOn ? "Connected" : "Offline"}
                active={cameraOn}
              />

              <SystemItem
                label="Face Engine"
                value="Ready"
                active
              />

              <SystemItem
                label="Database"
                value="Connected"
                active
              />

              <SystemItem
                label="API Server"
                value="localhost:5001"
                active
              />

            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Last server response
                </span>

                <span className="flex items-center gap-1 text-xs text-emerald-400">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  Healthy

                </span>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">

                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" />

              </div>

              <div className="mt-2 flex justify-between text-[9px] text-slate-600">

                <span>Recognition Engine</span>

                <span>94% Ready</span>

              </div>

            </div>

          </section>
  );
}
