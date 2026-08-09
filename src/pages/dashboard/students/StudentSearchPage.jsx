import React, { useEffect, useRef, useState } from "react";
import DashboardShell from "../DashboardShell";

import {
  Camera,
  Search,
  UserRound,
  CheckCircle2,
  ScanFace,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  RotateCcw,
  Activity,
  Clock3,
  UserCheck,
  Users,
  Target,
  Zap,
  Wifi,
  WifiOff,
  CircleDot,
  ScanLine,
  CameraOff,
  History,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import {BASE_URI} from "../../../config/api";
const BASE_URI = "/py-api";

const StudentSearchPage = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [student, setStudent] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("user");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [cameraStatus, setCameraStatus] = useState("Camera Offline");
  const [lastScan, setLastScan] = useState(null);

  const [scanHistory, setScanHistory] = useState([]);

  const [stats, setStats] = useState({
    scans: 0,
    verified: 0,
    failed: 0,
  });

  /* =========================================================
     START CAMERA
  ========================================================= */

const startCamera = async (facing = cameraFacing, deviceId = null) => {
  setError("");
  setMessage("");

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported by this browser.");
    }

    // Stop previous camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const videoConstraints = deviceId
      ? {
          deviceId: {
            exact: deviceId,
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        }
      : {
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
          facingMode: {
            ideal: facing,
          },
        };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      await videoRef.current.play();
    }

    // Get available cameras
    const devices =
      await navigator.mediaDevices.enumerateDevices();

    const cameras = devices.filter(
      (device) => device.kind === "videoinput"
    );

    setCameraDevices(cameras);

    setCameraOn(true);
    setCameraStatus("Camera Live");
    setMessage("Camera started successfully.");
  } catch (err) {
    console.error(err);

    setCameraOn(false);
    setCameraStatus("Camera Offline");

    setError(
      err?.message ||
        "Unable to access camera. Please check camera permissions."
    );
  }
};

  /* =========================================================
     STOP CAMERA
  ========================================================= */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setCameraStatus("Camera Offline");
    setScanning(false);
  };

  /* =========================================================
             FLIP CAMERA
      ====================================================*/ 
      const flipCamera = async () => {
  try {
    setError("");

    // Mobile: front ↔ back
    if (cameraDevices.length <= 1) {
      const nextFacing =
        cameraFacing === "user"
          ? "environment"
          : "user";

      setCameraFacing(nextFacing);

      await startCamera(nextFacing);

      return;
    }

    // Desktop / multiple cameras
    const nextIndex =
      (currentDeviceIndex + 1) %
      cameraDevices.length;

    const nextDevice =
      cameraDevices[nextIndex];

    setCurrentDeviceIndex(nextIndex);

    await startCamera(
      cameraFacing,
      nextDevice.deviceId
    );
  } catch (err) {
    console.error(err);

    toast.error(
      "Unable to switch camera."
    );
  }
};
  /* =========================================================
     CLEAN CAMERA ON UNMOUNT
  ========================================================= */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /* =========================================================
     CAPTURE FRAME
  ========================================================= */

  const captureFrame = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error("Camera frame is not ready.");
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Unable to capture camera frame."));
            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  /* =========================================================
     SEARCH FACE
  ========================================================= */

  const searchFace = async () => {
    setError("");
    setMessage("");

    if (!cameraOn) {
      setError("Please start the camera first.");
      return;
    }

    if (scanning) return;

    try {
      setScanning(true);
      setStudent(null);

      const blob = await captureFrame();

      const formData = new FormData();

      formData.append(
        "frame",
        blob,
        "face-scan.jpg"
      );

      const startedAt = Date.now();

      const res = await fetch(
        `${BASE_URI}/api/students/search`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseTime = Date.now() - startedAt;

      if (!res.ok) {
        let backendError = "No matching student found.";
        toast.error(backendError || "No Maching Student Found");

        try {
          const errorData = await res.json();

          if (errorData?.detail) {
            backendError = errorData.detail;
          }
        } catch {
          // ignore json parsing error
        }

        setStats((prev) => ({
          ...prev,
          scans: prev.scans + 1,
          failed: prev.failed + 1,
        }));

        setError(backendError);

        setLastScan({
          success: false,
          time: new Date(),
          responseTime,
        });

        return;
      }

      const data = await res.json();

      const studentData = {
        ...data,
        image: data.image
          ? `${BASE_URI}${data.image}`
          : null,
      };

      setStudent(studentData);

      setStats((prev) => ({
        ...prev,
        scans: prev.scans + 1,
        verified: prev.verified + 1,
      }));

      const scanRecord = {
        id: Date.now(),
        name: data.name,
        studentId: data.id,
        accuracy: data.accuracy,
        time: new Date(),
      };

      setScanHistory((prev) => [
        scanRecord,
        ...prev,
      ].slice(0, 5));

      setLastScan({
        success: true,
        time: new Date(),
        responseTime,
      });

      toast.success("Face verified successfully.");
    } catch (err) {
      toast.error(err?.message ||  "Unable to connect with face recognition server.");

      toast.error(
        err?.message ||
          "Unable to connect with face recognition server."
      );

      setStats((prev) => ({
        ...prev,
        scans: prev.scans + 1,
        failed: prev.failed + 1,
      }));

      setLastScan({
        success: false,
        time: new Date(),
      });
    } finally {
      setScanning(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetScan = () => {
    setStudent(null);
    setError("");
    setMessage("");
    setLastScan(null);
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getConfidence = () => {
    if (!student?.accuracy) return 0;

    const value = parseFloat(
      String(student.accuracy).replace("%", "")
    );

    return Number.isFinite(value) ? value : 0;
  };

  const confidence = getConfidence();

  const formatTime = (date) => {
    if (!date) return "--:--:--";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <DashboardShell title="Face Verification">

      <div className="min-h-screen w-full bg-slate-950 text-white">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-5 shadow-xl">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10">

                <ScanFace size={30} />

              </div>

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                    Identity Verification
                  </span>

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Face Verification Register
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Live student identification & attendance verification
                </p>

              </div>

            </div>

            {/* SYSTEM STATUS */}

            <div className="flex flex-wrap items-center gap-2">

              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                  cameraOn
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
              >

                {cameraOn ? (
                  <Wifi size={14} />
                ) : (
                  <WifiOff size={14} />
                )}

                {cameraStatus}

              </div>

              <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400">

                <ShieldCheck size={14} />

                Recognition Active

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            QUICK STATS
        ===================================================== */}

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            icon={ScanFace}
            label="Total Scans"
            value={stats.scans}
            color="cyan"
          />

          <StatCard
            icon={UserCheck}
            label="Verified"
            value={stats.verified}
            color="emerald"
          />

          <StatCard
            icon={ShieldAlert}
            label="Failed"
            value={stats.failed}
            color="rose"
          />

          <StatCard
            icon={Activity}
            label="System"
            value={cameraOn ? "ONLINE" : "READY"}
            color="blue"
          />

        </div>

        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">

            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Verification Failed
              </p>

              <p className="mt-1 text-rose-300/70">
                {error}
              </p>
            </div>

          </div>
        )}


        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(350px,.8fr)]">

          {/* ===================================================
              CAMERA PANEL
          =================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            {/* CAMERA HEADER */}

            <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <Camera
                    size={18}
                    className="text-cyan-400"
                  />

                  <h2 className="font-bold text-white">
                    Live Camera
                  </h2>

                  {cameraOn && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">

                      <CircleDot
                        size={9}
                        className="animate-pulse"
                      />

                      LIVE

                    </span>
                  )}

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Position the student's face inside the frame
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-2">

                {!cameraOn ? (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-95"
                  >

                    <Camera size={16} />

                    Start Camera

                  </button>
                  
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"
                  >

                    <CameraOff size={16} />

                    Stop Camera

                  </button>
                  
                )}
                  <button
              onClick={flipCamera}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-400 transition hover:border-violet-400 hover:bg-violet-500/20 active:scale-95"
            >
              <RotateCcw
                size={16}
                className="transition-transform duration-500"
              />
              Flip Camera
            </button>

                <button
                  onClick={searchFace}
                  disabled={!cameraOn || scanning}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {scanning ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Search size={16} />
                  )}

                  {scanning
                    ? "Scanning..."
                    : "Search Face"}

                </button>

              </div>

            </div>

            {/* CAMERA */}

            <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-black shadow-inner">

              <div className="relative aspect-video w-full">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover transition duration-500 ${
                    cameraOn
                      ? "opacity-100"
                      : "opacity-30"
                  }`}
                />

                {/* EMPTY CAMERA */}

                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70">

                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-600">

                      <CameraOff size={34} />

                    </div>

                    <p className="text-sm font-semibold text-slate-400">
                      Camera is currently offline
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Click "Start Camera" to begin
                    </p>

                  </div>
                )}

                {/* SCAN OVERLAY */}

                {cameraOn && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

                    {/* FACE FRAME */}

                    <div className="absolute left-1/2 top-1/2 h-64 w-52 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-cyan-400/50 shadow-[0_0_0_9999px_rgba(2,6,23,.12)]">

                      <span className="absolute -left-px -top-px h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-cyan-400" />

                      <span className="absolute -right-px -top-px h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-cyan-400" />

                      <span className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-cyan-400" />

                      <span className="absolute -bottom-px -right-px h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-cyan-400" />

                      {scanning && (
                        <div className="absolute left-0 right-0 top-0 h-0.5 animate-[scan_1.8s_ease-in-out_infinite] bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
                      )}

                    </div>

                    {/* TOP STATUS */}

                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-[10px] text-slate-300 backdrop-blur">

                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                      FACE DETECTION READY

                    </div>

                    {/* BOTTOM INFO */}

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">
                          Identity Scanner
                        </p>

                        <p className="mt-1 text-xs text-slate-300">
                          Keep face centered
                        </p>

                      </div>

                      {scanning && (
                        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-950/80 px-3 py-2 text-xs text-cyan-300 backdrop-blur">

                          <Loader2
                            size={14}
                            className="animate-spin"
                          />

                          Analyzing...

                        </div>
                      )}

                    </div>

                  </>
                )}

              </div>

            </div>

            {/* CAMERA CONTROLS */}

            <div className="grid grid-cols-3 gap-2 p-4">

              <MiniInfo
                icon={Target}
                label="Face Frame"
                value={cameraOn ? "Ready" : "Waiting"}
              />

              <MiniInfo
                icon={Zap}
                label="Recognition"
                value={scanning ? "Running" : "Idle"}
              />

              <MiniInfo
                icon={Activity}
                label="Response"
                value={
                  lastScan?.responseTime
                    ? `${lastScan.responseTime}ms`
                    : "--"
                }
              />

            </div>

          </section>

          {/* ===================================================
              STUDENT RESULT PANEL
          =================================================== */}

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

                  <div className="absolute right-3 top-3">

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
                        ID: {student.id}
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
                    icon={Activity}
                    title="Attendance"
                    value={student.attendance}
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

                {/* ATTENDANCE LOG */}

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">

                      <Clock3 size={18} />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-cyan-300">
                        Attendance Logged
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Today's register updated successfully
                      </p>

                    </div>

                    <CheckCircle2
                      size={18}
                      className="ml-auto text-emerald-400"
                    />

                  </div>

                </div>

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

        </div>

        {/* =====================================================
            BOTTOM FEATURES
        ===================================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          {/* RECENT SCANS */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <History
                  size={17}
                  className="text-cyan-400"
                />

                <h3 className="font-bold">
                  Recent Scans
                </h3>

              </div>

              <span className="text-[10px] text-slate-600">
                Last 5
              </span>

            </div>

            {scanHistory.length ? (
              <div className="space-y-2">

                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition hover:border-cyan-500/20"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">

                        <UserCheck size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-semibold text-slate-300">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {item.studentId}
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-xs font-bold text-emerald-400">
                        {item.accuracy}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-600">
                        {formatTime(item.time)}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-600">

                No scan history yet

              </div>
            )}

          </section>

          {/* SYSTEM INFORMATION */}

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

        </div>

      </div>

      {/* SCAN ANIMATION */}

      <style>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          50% {
            top: 50%;
            opacity: 1;
          }

          85% {
            opacity: 1;
          }

          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>

    </DashboardShell>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}) => {

  const colors = {
    cyan: {
      icon: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },

    emerald: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },

    rose: {
      icon: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },

    blue: {
      icon: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  };

  const theme = colors[color];

  return (
    <div
      className={`rounded-2xl border ${theme.border} bg-slate-900 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800`}
    >

      <div className="flex items-center justify-between">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.bg} ${theme.icon}`}
        >
          <Icon size={18} />
        </div>

        <span className="text-[9px] uppercase tracking-wider text-slate-600">
          Live
        </span>

      </div>

      <p className="mt-3 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>

    </div>
  );
};

/* =========================================================
   MINI INFO
========================================================= */

const MiniInfo = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">

    <div className="flex items-center gap-2">

      <Icon
        size={13}
        className="text-cyan-400"
      />

      <span className="text-[9px] text-slate-600">
        {label}
      </span>

    </div>

    <p className="mt-1 text-xs font-semibold text-slate-300">
      {value}
    </p>

  </div>
);

/* =========================================================
   DETAIL
========================================================= */

const Detail = ({
  icon: Icon,
  title,
  value,
}) => (
  <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-800/60">

    <div className="flex items-center gap-2">

      <Icon
        size={14}
        className="text-slate-600"
      />

      <span className="text-xs text-slate-500">
        {title}
      </span>

    </div>

    <span className="max-w-[55%] truncate text-xs font-semibold text-slate-300">
      {value || "--"}
    </span>

  </div>
);

/* =========================================================
   SYSTEM ITEM
========================================================= */

const SystemItem = ({
  label,
  value,
  active,
}) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">

    <div className="flex items-center justify-between">

      <span className="text-[10px] text-slate-600">
        {label}
      </span>

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]"
            : "bg-slate-600"
        }`}
      />

    </div>

    <p
      className={`mt-2 text-xs font-semibold ${
        active
          ? "text-emerald-400"
          : "text-slate-500"
      }`}
    >
      {value}
    </p>

  </div>
);

export default StudentSearchPage;