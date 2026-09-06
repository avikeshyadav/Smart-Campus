import {
  Activity, CheckCircle2, Clock3, RotateCcw, ScanFace,
  ShieldCheck, UserRound, Users, Camera, Search,
  HomeIcon,
} from "lucide-react";
import { Detail } from "./UIHelpers";

export default function StudentResultCard({
  student, confidence, lastScan, resetScan, formatTime,
  cameraOn, startCamera, searchFace,
}) {
  return (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <UserRound
                    size={18}
                    className="text-cyan-400"
                  />

                  <h2 className="font-bold text-white">
                    Student Result
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Verified identity information
                </p>

              </div>

              {student && (
                <button
                  onClick={resetScan}
                  className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
                  title="Reset"
                >

                  <RotateCcw size={15} />

                </button>
              )}

            </div>

            {student ? (
              <div className="space-y-5">

                {/* VERIFIED */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-slate-950 p-4">
                {student?.status === "active" ?(
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 size={12} />
                      Active
                    </div>
                  </div>) :(
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400">
                      <CheckCircle2 size={12} />
                      {student?.status.toUpperCase()}
                    </div>
                  </div>
                  )}
                  <div className="absolute right-3 top-22">
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 size={12} />
                      VERIFIED
                    </div>
                  </div>
                  <div className="flex items-center gap-4">

                    {student.image ? (
                      <img
                        src={student.image}
                        alt={student.name}
                        className="h-24 w-24 rounded-2xl border-2 border-emerald-400/40 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">

                        <UserRound size={35} />

                      </div>
                    )}

                    <div className="min-w-0">

                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Student
                      </p>

                      <h3 className="mt-1 truncate text-xl font-bold text-white">
                        {student.name}
                      </h3>

                      <p className="mt-1 text-xs font-medium text-cyan-400">
                        ID: {student.student_id}
                      </p>

                    </div>

                  </div>

                </div>

                {/* CONFIDENCE */}

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <ShieldCheck
                        size={15}
                        className="text-emerald-400"
                      />

                      <span className="text-xs font-semibold text-slate-300">
                        Face Match Confidence
                      </span>

                    </div>

                    <span className="text-sm font-bold text-emerald-400">
                      {student.accuracy}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-300 transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          confidence,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between text-[9px] text-slate-600">

                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="space-y-1">
                  <Detail
                    icon={Users}
                    title="Class"
                    value={student.class}
                  />
                  <Detail
                    icon={ShieldCheck}
                    title="Status"
                    value={student.status}
                  />
                  <Detail
                    icon={ScanFace}
                    title="Face Accuracy"
                    value={student.accuracy}
                  />
                </div>

                {/* Hostel Information */}
                    {student.hostel ? (
                      
                <div className="space-y-1">
                  <Detail
                    icon={ShieldCheck}
                    title="Hostel"
                    value={student?.hostel.hostel_name}
                  />
                  <Detail
                    icon={ShieldCheck}
                    title="Status"
                    value={student?.hostel.allocation_status}
                  />
                  <Detail
                    icon={ScanFace}
                    title="Floor"
                    value={student?.hostel.floor_name}
                  />           
                  <Detail
                    icon={ScanFace}
                    title="Room"
                    value={student?.hostel.room_number}
                  />
                </div>

                    ) : (<div></div> )}
                {/* TIME */}

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-[10px]">

                  <span className="text-slate-600">
                    Verified at
                  </span>

                  <span className="font-medium text-slate-400">
                    {formatTime(lastScan?.time)}
                  </span>

                </div>

              </div>
            ) : (
              <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-600">
                  <UserRound size={35} />
                </div>
                <h3 className="font-semibold text-slate-300">
                  No Student Detected
                </h3>
                <p className="mt-2 max-w-xs text-xs leading-5 text-slate-600">
                  Start the camera and position the student's face
                  inside the detection frame.
                </p>
                <button
                  onClick={cameraOn ? searchFace : startCamera}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  {cameraOn ? (
                    <>
                      <Search size={15} />
                      Search Face
                    </>
                  ) : (
                    <>
                      <Camera size={15} />
                      Start Camera
                    </>
                  )}

                </button>

              </div>
            )}

          </section>
  );
}
