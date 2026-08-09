import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import {BASE_URI} from '../../../../config/api';
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "../../DashboardShell";

import { toast } from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";
const BASE_URI = "/py-api";
import {
  Activity,
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  CircleCheck,
  Cloud,
  Eye,
  FileCheck2,
  Fingerprint,
  Gauge,
  HardDrive,
  IdCard,
  LockKeyhole,
  MemoryStick,
  RefreshCw,
  RotateCcw,
  ScanFace,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */


const ITEMS_PER_PAGE = 6;

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatusDot({ active = true }) {
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

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  subText,
  color = "text-emerald-400",
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="
        rounded-xl
        border
        border-slate-800/90
        bg-slate-900/55
        p-3
        transition
        hover:border-slate-700
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="
              grid
              h-7
              w-7
              place-items-center
              rounded-lg
              border
              border-slate-800
              bg-slate-950/50
            "
          >
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>

          <span className="text-[8px] uppercase tracking-wider text-slate-500">
            {label}
          </span>
        </div>

        <StatusDot />
      </div>

      <div className="mt-2 flex items-end justify-between">
        <span className={`text-xl font-bold ${color}`}>
          {value}
        </span>

        {subText && (
          <span className="text-[7px] text-slate-600">
            {subText}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
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
          {Icon && (
            <Icon className="h-3 w-3 text-slate-500" />
          )}

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
          w-full
          rounded-lg
          border
          border-slate-800
          bg-slate-950/50
          px-3
          py-2.5
          text-xs
          text-slate-200
          outline-none
          transition
          placeholder:text-slate-700
          focus:border-emerald-400/40
          focus:ring-1
          focus:ring-emerald-400/20
        "
      />
    </label>
  );
}

/* =========================================================
   PROGRESS BAR
========================================================= */

function ProgressBar({ value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[7px] uppercase tracking-wider text-slate-600">
          Registration Progress
        </span>

        <span className="text-[8px] font-bold text-emerald-400">
          {value}%
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RegisterStudentPage() {
  const { accessToken } = useAuth();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");

  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const [cameraQuality, setCameraQuality] =
    useState("WAITING");

  /* =========================================================
     FETCH STUDENTS
  ========================================================= */

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);

      const response = await fetch(
        `${BASE_URI}/api/students`,
        {
          method: "GET",
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch students");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setStudents(list);
    } catch (error) {
      toast.error(
        error?.message || "Student fetch failed"
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [accessToken]);

  /* =========================================================
     START CAMERA
  ========================================================= */

  const startCamera = async () => {
    try {
      setCameraLoading(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current
          .play()
          .catch(() => {});
      }

      setCameraOn(true);
      setCameraQuality("GOOD");

      toast.success("Camera connected");
    } catch (error) {
      setCameraOn(false);
      setCameraQuality("OFFLINE");

      toast.error(
        error?.message ||
          "Unable to access camera"
      );
    } finally {
      setCameraLoading(false);
    }
  };

  /* =========================================================
     STOP CAMERA
  ========================================================= */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setCameraQuality("OFFLINE");
  };

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (capturedPhoto?.previewUrl) {
        URL.revokeObjectURL(
          capturedPhoto.previewUrl
        );
      }
    };
  }, []);

  /* =========================================================
     CAPTURE PHOTO
  ========================================================= */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      toast.error("Camera is not ready");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      toast.error(
        "Camera video is still loading"
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Unable to capture image");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Photo capture failed");
          return;
        }

        const previewUrl =
          URL.createObjectURL(blob);

        setCapturedPhoto({
          blob,
          previewUrl,
        });

        setCameraQuality("EXCELLENT");

        toast.success("Face photo captured");

        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  /* =========================================================
     RETAKE
  ========================================================= */

  const retake = () => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(
        capturedPhoto.previewUrl
      );
    }

    setCapturedPhoto(null);
    setCameraQuality("WAITING");
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetForm = () => {
    stopCamera();

    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(
        capturedPhoto.previewUrl
      );
    }

    setStudentId("");
    setName("");
    setClassName("");

    setCapturedPhoto(null);

    setStatus("idle");
    setMessage("");
    setCameraQuality("WAITING");
  };

  /* =========================================================
     FORM PROGRESS
  ========================================================= */

  const formProgress = useMemo(() => {
    let progress = 0;

    if (studentId.trim()) progress += 25;
    if (name.trim()) progress += 25;
    if (className.trim()) progress += 25;
    if (capturedPhoto) progress += 25;

    return progress;
  }, [
    studentId,
    name,
    className,
    capturedPhoto,
  ]);

  const formReady =
    studentId.trim() &&
    name.trim() &&
    className.trim() &&
    capturedPhoto;

  /* =========================================================
     DUPLICATE CHECK
  ========================================================= */

  const duplicateStudent = useMemo(() => {
    if (!studentId.trim()) return false;

    return students.some((student) => {
      const id = String(
        student?.student_id ||
          student?.id ||
          ""
      ).toLowerCase();

      return ( 
        id === studentId.trim().toLowerCase()
      );
    });
  }, [students, studentId]);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("idle");
    setMessage("");

    if (!studentId.trim()) {
      setStatus("error");
      setMessage("Student ID is required.");
      return;
    }

    if (duplicateStudent) {
      setStatus("error");
      setMessage(
        "This Student ID is already registered."
      );
      return;
    }

    if (!name.trim()) {
      setStatus("error");
      setMessage("Student name is required.");
      return;
    }

    if (!className.trim()) {
      setStatus("error");
      setMessage("Class is required.");
      return;
    }

    if (!capturedPhoto) {
      setStatus("error");
      setMessage(
        "Capture a student photo before submitting."
      );
      return;
    }

    if (!accessToken) {
      setStatus("error");
      setMessage(
        "Authentication token is missing."
      );
      return;
    }

    try {
      setStatus("submitting");

      const formData = new FormData();

      formData.append(
        "student_id",
        studentId.trim()
      );

      formData.append(
        "name",
        name.trim()
      );

      formData.append(
        "class_name",
        className.trim()
      );

      formData.append(
        "photo",
        capturedPhoto.blob,
        `${studentId.trim()}.jpg`
      );

      const response = await fetch(
        `${BASE_URI}/api/students/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Enrollment failed."
        );
      }

      setStatus("success");

      setMessage(
        `${name.trim()} successfully added to register.`
      );

      toast.success(
        "Student enrolled successfully"
      );

      await fetchStudents();

      setTimeout(() => {
        resetForm();
      }, 800);
    } catch (error) {
      setStatus("error");

      setMessage(
        error?.message ||
          "Could not reach the server."
      );

      toast.error(
        error?.message ||
          "Enrollment failed"
      );
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      const studentName = String(
        student?.name || ""
      ).toLowerCase();

      const id = String(
        student?.student_id ||
          student?.id ||
          ""
      ).toLowerCase();

      const studentClass = String(
        student?.class_name ||
          student?.class ||
          ""
      ).toLowerCase();

      return (
        studentName.includes(query) ||
        id.includes(query) ||
        studentClass.includes(query)
      );
    });
  }, [students, search]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStudents.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedStudents =
    filteredStudents.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================================================
     CAMERA QUALITY
  ========================================================= */

  const qualityColor =
    cameraQuality === "EXCELLENT"
      ? "text-yellow-300"
      : cameraQuality === "GOOD"
      ? "text-emerald-400"
      : cameraQuality === "OFFLINE"
      ? "text-slate-600"
      : "text-slate-500";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DashboardShell>

      <div className="min-h-screen bg-slate-950 text-slate-200">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-3 rounded-xl border border-slate-800/90 bg-slate-900/55 p-4">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div className="flex items-center gap-3">

              <div className="
                grid
                h-10
                w-10
                place-items-center
                rounded-xl
                border
                border-emerald-400/20
                bg-emerald-400/5
              ">
                <UserPlus className="h-5 w-5 text-emerald-400" />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h1 className="text-lg font-semibold text-white">
                    Register Student
                  </h1>

                  <span className="
                    rounded-md
                    border
                    border-emerald-400/20
                    bg-emerald-400/5
                    px-2
                    py-0.5
                    text-[7px]
                    uppercase
                    tracking-wider
                    text-emerald-400
                  ">
                    Enrollment
                  </span>

                </div>

                <p className="mt-0.5 text-[8px] text-slate-500">
                  Create student profile with
                  facial enrollment
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <span className="flex items-center gap-1.5 text-[8px] text-slate-500">

                <StatusDot active />

                System Online

              </span>

              <span className="
                rounded-md
                border
                border-slate-800
                bg-slate-950/50
                px-2
                py-1
                text-[7px]
                text-slate-600
              ">
                SECURE MODE
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">

          <StatCard
            icon={Users}
            label="Registered"
            value={students.length}
            subText="TOTAL"
            color="text-emerald-400"
          />

          <StatCard
            icon={UserCheck}
            label="Active"
            value={students.length}
            subText="ACTIVE"
            color="text-cyan-300"
          />

          <StatCard
            icon={ScanFace}
            label="Face Ready"
            value={
              capturedPhoto
                ? "READY"
                : "WAIT"
            }
            subText="ENROLLMENT"
            color={
              capturedPhoto
                ? "text-yellow-300"
                : "text-slate-500"
            }
          />

          <StatCard
            icon={ShieldCheck}
            label="Security"
            value="AES"
            subText="PROTECTED"
            color="text-purple-400"
          />

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">

          {/* =================================================
              CAMERA SECTION
          ================================================= */}

          <section className="
            overflow-hidden
            rounded-xl
            border
            border-slate-800/90
            bg-slate-900/55
          ">

            {/* CAMERA HEADER */}

            <div className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              border-b
              border-slate-800/80
              px-3
              py-2.5
            ">

              <div className="flex items-center gap-2">

                <div className="
                  grid
                  h-8
                  w-8
                  place-items-center
                  rounded-lg
                  border
                  border-cyan-400/20
                  bg-cyan-400/5
                ">
                  <Camera className="h-4 w-4 text-cyan-300" />
                </div>

                <div>

                  <h2 className="text-sm font-semibold text-white">
                    Facial Enrollment
                  </h2>

                  <p className="text-[7px] uppercase tracking-wider text-slate-600">
                    Student Identity Capture
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <span className="flex items-center gap-1.5 text-[7px] text-slate-500">

                  <StatusDot active={cameraOn} />

                  {cameraOn
                    ? "LIVE"
                    : "OFFLINE"}

                </span>

                {!capturedPhoto ? (
                  <button
                    type="button"
                    onClick={
                      cameraOn
                        ? stopCamera
                        : startCamera
                    }
                    disabled={cameraLoading}
                    className={`
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      px-2.5
                      py-1.5
                      text-[8px]
                      font-semibold
                      transition
                      disabled:opacity-50
                      ${
                        cameraOn
                          ? "border-red-400/20 bg-red-400/5 text-red-300 hover:bg-red-400/10"
                          : "border-emerald-400/20 bg-emerald-400/5 text-emerald-400 hover:bg-emerald-400/10"
                      }
                    `}
                  >
                    {cameraLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : cameraOn ? (
                      <CameraOff className="h-3 w-3" />
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}

                    {cameraLoading
                      ? "Starting"
                      : cameraOn
                      ? "Stop"
                      : "Start Camera"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={retake}
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-slate-800
                      bg-slate-950/50
                      px-2.5
                      py-1.5
                      text-[8px]
                      text-slate-400
                      transition
                      hover:text-white
                    "
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retake
                  </button>
                )}

              </div>

            </div>

            {/* CAMERA VIEW */}

            <div className="
              relative
              aspect-video
              min-h-[300px]
              overflow-hidden
              bg-black
            ">

              {capturedPhoto ? (
                <motion.img
                  initial={{
                    opacity: 0,
                    scale: 1.04,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  src={
                    capturedPhoto.previewUrl
                  }
                  alt="Captured student"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                    style={{
                      opacity: cameraOn
                        ? 1
                        : 0.2,
                    }}
                  />

                  {!cameraOn && (
                    <div className="
                      absolute
                      inset-0
                      flex
                      flex-col
                      items-center
                      justify-center
                      bg-slate-950/70
                    ">

                      <Camera
                        className="mb-2 h-9 w-9 text-slate-700"
                        strokeWidth={1}
                      />

                      <p className="text-xs text-slate-500">
                        Camera Standby
                      </p>

                      <p className="mt-1 text-[7px] text-slate-700">
                        Start camera to begin
                        enrollment
                      </p>

                    </div>
                  )}

                  {/* FACE FRAME */}

                  <div className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-[65%]
                    w-[30%]
                    min-w-[150px]
                    max-w-[220px]
                    -translate-x-1/2
                    -translate-y-1/2
                  ">

                    <div className="
                      absolute
                      left-0
                      top-0
                      h-8
                      w-8
                      border-l-2
                      border-t-2
                      border-emerald-400
                    " />

                    <div className="
                      absolute
                      right-0
                      top-0
                      h-8
                      w-8
                      border-r-2
                      border-t-2
                      border-emerald-400
                    " />

                    <div className="
                      absolute
                      bottom-0
                      left-0
                      h-8
                      w-8
                      border-b-2
                      border-l-2
                      border-emerald-400
                    " />

                    <div className="
                      absolute
                      bottom-0
                      right-0
                      h-8
                      w-8
                      border-b-2
                      border-r-2
                      border-emerald-400
                    " />

                    {cameraOn && (
                      <motion.div
                        className="
                          absolute
                          left-0
                          right-0
                          h-px
                          bg-emerald-400
                          shadow-[0_0_10px_rgba(74,222,128,.9)]
                        "
                        animate={{
                          top: [
                            "0%",
                            "100%",
                            "0%",
                          ],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}

                  </div>

                  {/* TOP STATUS */}

                  <div className="
                    absolute
                    left-3
                    top-3
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-800
                    bg-slate-950/75
                    px-2.5
                    py-1.5
                    backdrop-blur
                  ">

                    <StatusDot active={cameraOn} />

                    <span className="
                      text-[7px]
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      {cameraOn
                        ? "Camera Live"
                        : "Offline"}
                    </span>

                  </div>

                  {/* FACE INSTRUCTION */}

                  {cameraOn && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="
                        absolute
                        bottom-3
                        left-1/2
                        -translate-x-1/2
                        rounded-lg
                        border
                        border-emerald-400/20
                        bg-slate-950/80
                        px-3
                        py-1.5
                        backdrop-blur
                      "
                    >
                      <div className="flex items-center gap-2">

                        <ScanFace className="h-3 w-3 text-emerald-400" />

                        <span className="text-[7px] uppercase tracking-wider text-emerald-400">
                          Align face inside frame
                        </span>

                      </div>
                    </motion.div>
                  )}

                </>
              )}

              {/* CAPTURED */}

              {capturedPhoto && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="
                    absolute
                    left-3
                    top-3
                    flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-emerald-400/30
                    bg-slate-950/80
                    px-2.5
                    py-1.5
                  "
                >

                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />

                  <span className="text-[7px] uppercase text-emerald-400">
                    Photo Captured
                  </span>

                </motion.div>
              )}

              {/* CAPTURE BUTTON */}

              {cameraOn &&
                !capturedPhoto && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="
                      absolute
                      bottom-4
                      left-1/2
                      grid
                      h-12
                      w-12
                      -translate-x-1/2
                      place-items-center
                      rounded-full
                      border-4
                      border-white/20
                      bg-emerald-400
                      text-slate-950
                      shadow-[0_0_25px_rgba(74,222,128,.25)]
                      transition
                      hover:scale-105
                    "
                  >
                    <CircleCheck className="h-5 w-5" />
                  </button>
                )}

            </div>

            {/* CAMERA METRICS */}

            <div className="grid grid-cols-4 border-t border-slate-800/80">

              <div className="border-r border-slate-800/70 p-2.5">
                <p className="text-[7px] uppercase text-slate-600">
                  Camera
                </p>

                <p className={`
                  mt-1
                  text-[9px]
                  font-semibold
                  ${
                    cameraOn
                      ? "text-emerald-400"
                      : "text-slate-600"
                  }
                `}>
                  {cameraOn
                    ? "ONLINE"
                    : "OFFLINE"}
                </p>
              </div>

              <div className="border-r border-slate-800/70 p-2.5">
                <p className="text-[7px] uppercase text-slate-600">
                  Face
                </p>

                <p className={`
                  mt-1
                  text-[9px]
                  font-semibold
                  ${
                    capturedPhoto
                      ? "text-yellow-300"
                      : "text-slate-600"
                  }
                `}>
                  {capturedPhoto
                    ? "DETECTED"
                    : "WAITING"}
                </p>
              </div>

              <div className="border-r border-slate-800/70 p-2.5">
                <p className="text-[7px] uppercase text-slate-600">
                  Quality
                </p>

                <p className={`mt-1 text-[9px] font-semibold ${qualityColor}`}>
                  {cameraQuality}
                </p>
              </div>

              <div className="p-2.5">
                <p className="text-[7px] uppercase text-slate-600">
                  Security
                </p>

                <p className="mt-1 text-[9px] font-semibold text-purple-400">
                  PROTECTED
                </p>
              </div>

            </div>

            {/* CAMERA SYSTEM INFO */}

            <div className="
              grid
              grid-cols-3
              gap-1.5
              border-t
              border-slate-800/80
              p-2
            ">

              <div className="
                rounded-lg
                border
                border-slate-800/70
                bg-slate-950/30
                px-2
                py-1.5
              ">
                <div className="flex items-center gap-1.5">

                  <Cloud className="h-3 w-3 text-blue-400" />

                  <span className="text-[7px] text-slate-500">
                    Cloud Backup
                  </span>

                </div>

                <p className="mt-1 text-[8px] font-semibold text-emerald-400">
                  Synced
                </p>
              </div>

              <div className="
                rounded-lg
                border
                border-slate-800/70
                bg-slate-950/30
                px-2
                py-1.5
              ">
                <div className="flex items-center gap-1.5">

                  <Fingerprint className="h-3 w-3 text-purple-400" />

                  <span className="text-[7px] text-slate-500">
                    Face Engine
                  </span>

                </div>

                <p className="mt-1 text-[8px] font-semibold text-emerald-400">
                  Ready
                </p>
              </div>

              <div className="
                rounded-lg
                border
                border-slate-800/70
                bg-slate-950/30
                px-2
                py-1.5
              ">
                <div className="flex items-center gap-1.5">

                  <Wifi className="h-3 w-3 text-cyan-400" />

                  <span className="text-[7px] text-slate-500">
                    Network
                  </span>

                </div>

                <p className="mt-1 text-[8px] font-semibold text-yellow-300">
                  Excellent
                </p>
              </div>

            </div>

          </section>

          {/* =================================================
              FORM
          ================================================= */}

          <section className="
            rounded-xl
            border
            border-slate-800/90
            bg-slate-900/55
            p-3
          ">

            <div className="mb-3 flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <IdCard className="h-4 w-4 text-purple-400" />

                  <h2 className="text-sm font-semibold text-white">
                    Student Details
                  </h2>

                </div>

                <p className="mt-1 text-[7px] uppercase tracking-wider text-slate-600">
                  Enrollment Information
                </p>

              </div>

              <LockKeyhole className="h-4 w-4 text-slate-600" />

            </div>

            {/* PROGRESS */}

            <div className="mb-4">
              <ProgressBar
                value={formProgress}
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >

              <Field
                label="Student ID"
                value={studentId}
                onChange={setStudentId}
                placeholder="STU-10245"
                icon={IdCard}
              />

              {duplicateStudent && (
                <div className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-red-400/20
                  bg-red-400/5
                  px-2.5
                  py-2
                  text-[8px]
                  text-red-300
                ">
                  <AlertTriangle className="h-3 w-3" />
                  Student ID already exists
                </div>
              )}

              <Field
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Rahul Sharma"
                icon={UserCheck}
              />

              <Field
                label="Class / Section"
                value={className}
                onChange={setClassName}
                placeholder="BCA - 2A"
                icon={FileCheck2}
              />

              {/* CHECKLIST */}

              <div className="
                rounded-xl
                border
                border-slate-800/80
                bg-slate-950/30
                p-3
              ">

                <div className="mb-2 flex items-center justify-between">

                  <span className="
                    text-[7px]
                    uppercase
                    tracking-wider
                    text-slate-600
                  ">
                    Enrollment Checklist
                  </span>

                  <Gauge className="h-3 w-3 text-slate-600" />

                </div>

                {[
                  [
                    "Student ID",
                    Boolean(studentId.trim()),
                  ],
                  [
                    "Student Name",
                    Boolean(name.trim()),
                  ],
                  [
                    "Class / Section",
                    Boolean(className.trim()),
                  ],
                  [
                    "Face Photo",
                    Boolean(capturedPhoto),
                  ],
                ].map(
                  ([item, complete]) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-800/50
                        py-1.5
                        last:border-0
                      "
                    >

                      <span className={`
                        text-[8px]
                        ${
                          complete
                            ? "text-slate-300"
                            : "text-slate-600"
                        }
                      `}>
                        {item}
                      </span>

                      {complete ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3 w-3 text-slate-700" />
                      )}

                    </div>
                  )
                )}

              </div>

              {/* SUBMIT */}

              <motion.button
                whileHover={{
                  y: formReady ? -1 : 0,
                }}
                whileTap={{
                  scale: formReady ? 0.98 : 1,
                }}
                type="submit"
                disabled={
                  status === "submitting" ||
                  !formReady ||
                  duplicateStudent
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-emerald-400/20
                  bg-emerald-400/10
                  py-2.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-emerald-400
                  transition
                  hover:bg-emerald-400/15
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >

                {status === "submitting" ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Add to Register
                  </>
                )}

              </motion.button>

              {/* RESET */}

              <button
                type="button"
                onClick={resetForm}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-950/40
                  py-2
                  text-[8px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  transition
                  hover:text-slate-300
                "
              >
                <RotateCcw className="h-3 w-3" />
                Clear Form
              </button>

              {/* ERROR */}

              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="
                      flex
                      items-start
                      gap-2
                      rounded-lg
                      border
                      border-red-400/20
                      bg-red-400/5
                      p-2.5
                      text-[8px]
                      text-red-300
                    "
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                    <span>
                      {message}
                    </span>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* SUCCESS */}

              <AnimatePresence>
                {status === "success" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="
                      rounded-lg
                      border
                      border-emerald-400/20
                      bg-emerald-400/5
                      p-3
                    "
                  >

                    <div className="flex items-center gap-2">

                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                      <div>

                        <p className="text-[9px] font-semibold text-emerald-400">
                          Enrollment Successful
                        </p>

                        <p className="mt-0.5 text-[7px] text-slate-500">
                          {message}
                        </p>

                      </div>

                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </form>

          </section>

        </div>

        {/* =================================================
            REGISTER DATABASE
        ================================================= */}

        <section className="
          mt-3
          rounded-xl
          border
          border-slate-800/90
          bg-slate-900/55
          p-3
        ">

          {/* HEADER */}

          <div className="
            mb-3
            flex
            flex-col
            gap-3
            md:flex-row
            md:items-center
            md:justify-between
          ">

            <div className="flex items-center gap-2">

              <div className="
                grid
                h-8
                w-8
                place-items-center
                rounded-lg
                border
                border-purple-400/20
                bg-purple-400/5
              ">
                <Users className="h-4 w-4 text-purple-400" />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-sm font-semibold text-white">
                    Student Register
                  </h2>

                  <span className="
                    rounded-md
                    bg-slate-950
                    px-1.5
                    py-0.5
                    text-[7px]
                    text-cyan-300
                  ">
                    {filteredStudents.length}
                  </span>

                </div>

                <p className="text-[7px] uppercase tracking-wider text-slate-600">
                  Enrolled Students Database
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              {/* SEARCH */}

              <div className="relative w-full md:w-64">

                <Search className="
                  absolute
                  left-2.5
                  top-1/2
                  h-3
                  w-3
                  -translate-y-1/2
                  text-slate-600
                " />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search students..."
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-800
                    bg-slate-950/50
                    py-2
                    pl-8
                    pr-2
                    text-[8px]
                    text-slate-300
                    outline-none
                    placeholder:text-slate-700
                    focus:border-cyan-400/30
                  "
                />

              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={fetchStudents}
                disabled={loadingStudents}
                className="
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-950/50
                  text-slate-500
                  transition
                  hover:text-white
                "
              >
                <RefreshCw
                  className={`
                    h-3.5
                    w-3.5
                    ${
                      loadingStudents
                        ? "animate-spin"
                        : ""
                    }
                  `}
                />
              </button>

            </div>

          </div>

          {/* TABLE HEADER */}

          {filteredStudents.length > 0 && (
            <div className="
              hidden
              grid-cols-[auto_1fr_120px_150px_100px]
              gap-3
              border-b
              border-slate-800/60
              px-2
              py-2
              md:grid
            ">

              <span />

              <span className="text-[7px] uppercase text-slate-600">
                Student
              </span>

              <span className="text-[7px] uppercase text-slate-600">
                Class
              </span>

              <span className="text-[7px] uppercase text-slate-600">
                Student ID
              </span>

              <span className="text-[7px] uppercase text-slate-600">
                Status
              </span>

            </div>
          )}

          {/* LOADING */}

          {loadingStudents ? (
            <div className="
              flex
              min-h-[180px]
              items-center
              justify-center
            ">

              <div className="flex items-center gap-2">

                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />

                <span className="text-[8px] text-slate-500">
                  Loading student database...
                </span>

              </div>

            </div>
          ) : paginatedStudents.length === 0 ? (
            <div className="
              flex
              min-h-[180px]
              flex-col
              items-center
              justify-center
            ">

              <Users className="h-8 w-8 text-slate-800" />

              <p className="mt-2 text-[9px] text-slate-600">
                {students.length === 0
                  ? "No students enrolled yet."
                  : "No matching students found."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    mt-2
                    text-[7px]
                    uppercase
                    text-cyan-300
                  "
                >
                  Clear Search
                </button>
              )}

            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">

              {paginatedStudents.map(
                (student, index) => {
                  const id =
                    student?.student_id ||
                    student?.id ||
                    "—";

                  const studentClass =
                    student?.class_name ||
                    student?.class ||
                    "—";

                  const image =
                    student?.image
                      ? `${BASE_URI}${student.image}`
                      : null;

                  const initials =
                    String(
                      student?.name ||
                        "Student"
                    )
                      .split(" ")
                      .slice(0, 2)
                      .map(
                        (word) =>
                          word[0]
                      )
                      .join("")
                      .toUpperCase();

                  return (
                    <motion.div
                      key={
                        student?.id ||
                        student?.student_id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.03,
                      }}
                      className="
                        grid
                        gap-2
                        px-2
                        py-2.5
                        transition
                        hover:bg-slate-950/30
                        md:grid-cols-[auto_1fr_120px_150px_100px]
                        md:items-center
                        md:gap-3
                      "
                    >

                      {/* AVATAR */}

                      <div className="flex items-center">

                        {image ? (
                          <img
                            src={image}
                            alt={
                              student?.name ||
                              "Student"
                            }
                            className="
                              h-9
                              w-9
                              rounded-lg
                              border
                              border-slate-800
                              object-cover
                            "
                          />
                        ) : (
                          <div className="
                            grid
                            h-9
                            w-9
                            place-items-center
                            rounded-lg
                            border
                            border-slate-800
                            bg-slate-950
                            text-[9px]
                            font-bold
                            text-cyan-300
                          ">
                            {initials}
                          </div>
                        )}

                      </div>

                      {/* NAME */}

                      <div>

                        <p className="
                          text-[10px]
                          font-medium
                          text-slate-200
                        ">
                          {student?.name ||
                            "Unknown Student"}
                        </p>

                        <div className="
                          mt-1
                          flex
                          items-center
                          gap-1
                        ">

                          <StatusDot />

                          <span className="text-[7px] text-slate-600">
                            Face enrolled
                          </span>

                        </div>

                      </div>

                      {/* CLASS */}

                      <div>

                        <span className="
                          inline-flex
                          rounded-md
                          border
                          border-cyan-400/10
                          bg-cyan-400/5
                          px-2
                          py-1
                          text-[7px]
                          text-cyan-300
                        ">
                          {studentClass}
                        </span>

                      </div>

                      {/* ID */}

                      <div>

                        <span className="
                          font-mono
                          text-[8px]
                          text-slate-500
                        ">
                          {id}
                        </span>

                      </div>

                      {/* STATUS */}

                      <div>

                        <span className="
                          inline-flex
                          items-center
                          gap-1
                          text-[7px]
                          text-emerald-400
                        ">

                          <CheckCircle2 className="h-2.5 w-2.5" />

                          Registered

                        </span>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {filteredStudents.length > 0 && (
            <div className="
              mt-3
              flex
              flex-col
              items-center
              justify-between
              gap-2
              border-t
              border-slate-800/60
              pt-3
              sm:flex-row
            ">

              <span className="text-[7px] text-slate-600">
                Showing{" "}
                <span className="text-slate-400">
                  {Math.min(
                    (currentPage - 1) *
                      ITEMS_PER_PAGE +
                      1,
                    filteredStudents.length
                  )}
                </span>{" "}
                -
                {" "}
                <span className="text-slate-400">
                  {Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    filteredStudents.length
                  )}
                </span>{" "}
                of{" "}
                <span className="text-slate-400">
                  {filteredStudents.length}
                </span>
              </span>

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="
                    rounded-md
                    border
                    border-slate-800
                    bg-slate-950/50
                    px-2.5
                    py-1.5
                    text-[7px]
                    text-slate-500
                    transition
                    hover:text-white
                    disabled:opacity-30
                  "
                >
                  Prev
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`
                      grid
                      h-6
                      min-w-6
                      place-items-center
                      rounded-md
                      border
                      text-[7px]
                      transition
                      ${
                        currentPage === page
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          : "border-slate-800 bg-slate-950/50 text-slate-600 hover:text-white"
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="
                    rounded-md
                    border
                    border-slate-800
                    bg-slate-950/50
                    px-2.5
                    py-1.5
                    text-[7px]
                    text-slate-500
                    transition
                    hover:text-white
                    disabled:opacity-30
                  "
                >
                  Next
                </button>

              </div>

            </div>
          )}

        </section>

        {/* =================================================
            FOOTER SYSTEM STATUS
        ================================================= */}

        <div className="
          mt-3
          grid
          grid-cols-2
          gap-1.5
          md:grid-cols-4
        ">

          <div className="
            rounded-lg
            border
            border-slate-800/70
            bg-slate-900/35
            px-2.5
            py-2
          ">
            <div className="flex items-center gap-1.5">

              <Activity className="h-3 w-3 text-purple-400" />

              <span className="text-[7px] text-slate-500">
                API Status
              </span>

            </div>

            <p className="mt-1 text-[8px] font-semibold text-emerald-400">
              Operational
            </p>
          </div>

          <div className="
            rounded-lg
            border
            border-slate-800/70
            bg-slate-900/35
            px-2.5
            py-2
          ">
            <div className="flex items-center gap-1.5">

              <Cloud className="h-3 w-3 text-blue-400" />

              <span className="text-[7px] text-slate-500">
                Database
              </span>

            </div>

            <p className="mt-1 text-[8px] font-semibold text-emerald-400">
              Connected
            </p>
          </div>

          <div className="
            rounded-lg
            border
            border-slate-800/70
            bg-slate-900/35
            px-2.5
            py-2
          ">
            <div className="flex items-center gap-1.5">

              <Fingerprint className="h-3 w-3 text-purple-400" />

              <span className="text-[7px] text-slate-500">
                Face Engine
              </span>

            </div>

            <p className="mt-1 text-[8px] font-semibold text-emerald-400">
              Ready
            </p>
          </div>

          <div className="
            rounded-lg
            border
            border-slate-800/70
            bg-slate-900/35
            px-2.5
            py-2
          ">
            <div className="flex items-center gap-1.5">

              <Zap className="h-3 w-3 text-yellow-300" />

              <span className="text-[7px] text-slate-500">
                Security
              </span>

            </div>

            <p className="mt-1 text-[8px] font-semibold text-yellow-300">
              Protected
            </p>
          </div>

        </div>

        <canvas
          ref={canvasRef}
          className="hidden"
        />

      </div>

    </DashboardShell>
  );
}