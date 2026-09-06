import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

import PageHeader from "./components/AddStudentComponents/PageHeader";
import StatsGrid from "./components/AddStudentComponents/StatsGrid";
import CameraEnrollmentCard from "./components/AddStudentComponents/CameraEnrollmentCard";
import StudentDetailsCard from "./components/AddStudentComponents/StudentDetailsCard";
import StudentRegisterCard from "./components/AddStudentComponents/StudentRegisterCard";
import SystemStatusFooter from "./components/AddStudentComponents/SystemStatusFooter";

const BASE_URI = "/py-api";
const ITEMS_PER_PAGE = 6;

/* =========================================================
   SIMPLE PHOTO CONFIG
========================================================= */

const PHOTO_CONFIG = {
  MIN_WIDTH: 500,
  MIN_HEIGHT: 500,

  MIN_BRIGHTNESS: 55,
  MAX_BRIGHTNESS: 230,

  MIN_QUALITY_SCORE: 80,

  LIVE_CHECK_INTERVAL: 1000,
};

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RegisterStudentPage() {
  const { accessToken } = useAuth();

  /* =========================================================
     REFS
  ========================================================= */

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const liveCanvasRef = useRef(null);
  const streamRef = useRef(null);

  /* =========================================================
     CAMERA
  ========================================================= */

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  /* =========================================================
     PHOTO
  ========================================================= */

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoQuality, setPhotoQuality] = useState(null);
  const [liveQuality, setLiveQuality] = useState(null);

  /* =========================================================
     STUDENT FORM
  ========================================================= */

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");

  /* =========================================================
     STUDENTS
  ========================================================= */

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStudents, setLoadingStudents] = useState(false);

  /* =========================================================
     STATUS
  ========================================================= */

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [cameraQuality, setCameraQuality] = useState("WAITING");

  /* =========================================================
     FETCH STUDENTS
  ========================================================= */

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);

      const response = await fetch(
        `${BASE_URI}/api/students`,
        {
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
  }, [accessToken]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

      stopCamera();

      if (capturedPhoto?.previewUrl) {
        URL.revokeObjectURL(
          capturedPhoto.previewUrl
        );
      }

      setCapturedPhoto(null);
      setPhotoQuality(null);
      setLiveQuality(null);
      setCameraQuality("WAITING");

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

            frameRate: {
              ideal: 24,
              max: 30,
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

  const stopCamera = useCallback(() => {
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
    setLiveQuality(null);
    setCameraQuality("OFFLINE");
  }, []);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      stopCamera();

      if (capturedPhoto?.previewUrl) {
        URL.revokeObjectURL(
          capturedPhoto.previewUrl
        );
      }
    };
  }, [stopCamera]);

  /* =========================================================
     BRIGHTNESS
  ========================================================= */

  const getBrightness = (
    ctx,
    width,
    height
  ) => {
    const sampleWidth = Math.min(width, 250);
    const sampleHeight = Math.min(height, 250);

    const imageData = ctx.getImageData(
      0,
      0,
      sampleWidth,
      sampleHeight
    );

    const pixels = imageData.data;

    let total = 0;
    let count = 0;

    // Skip pixels to reduce CPU usage
    for (let i = 0; i < pixels.length; i += 32) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      total +=
        0.299 * r +
        0.587 * g +
        0.114 * b;

      count++;
    }

    return count
      ? total / count
      : 0;
  };

  /* =========================================================
     SIMPLE SHARPNESS
     
     Lightweight edge detection.
     No large Laplacian calculation.
  ========================================================= */

  const getSharpness = (
    ctx,
    width,
    height
  ) => {
    const sampleSize = 160;

    const imageData = ctx.getImageData(
      0,
      0,
      Math.min(width, sampleSize),
      Math.min(height, sampleSize)
    );

    const data = imageData.data;

    let edges = 0;

    for (
      let i = 0;
      i < data.length - 8;
      i += 16
    ) {
      const current =
        0.299 * data[i] +
        0.587 * data[i + 1] +
        0.114 * data[i + 2];

      const next =
        0.299 * data[i + 4] +
        0.587 * data[i + 5] +
        0.114 * data[i + 6];

      edges += Math.abs(current - next);
    }

    return edges / 100;
  };

  /* =========================================================
     QUALITY CHECK
  ========================================================= */

  const checkQuality = (
    ctx,
    width,
    height
  ) => {
    const brightness = getBrightness(
      ctx,
      width,
      height
    );

    const sharpness = getSharpness(
      ctx,
      width,
      height
    );

    const resolutionOK =
      width >= PHOTO_CONFIG.MIN_WIDTH &&
      height >= PHOTO_CONFIG.MIN_HEIGHT;

    const brightnessOK =
      brightness >= PHOTO_CONFIG.MIN_BRIGHTNESS &&
      brightness <= PHOTO_CONFIG.MAX_BRIGHTNESS;

    /*
      Sharpness is intentionally lightweight.
    */

    const sharpnessOK = sharpness >= 25;

    let score = 0;

    if (resolutionOK) {
      score += 20;
    }

    if (brightnessOK) {
      score += 35;
    }

    if (sharpnessOK) {
      score += 45;
    }

    score = Math.round(
      clamp(score, 0, 100)
    );

    let reason = "Photo quality is good.";

    if (!resolutionOK) {
      reason =
        "Camera resolution is too low.";
    } else if (!brightnessOK) {
      reason =
        brightness < PHOTO_CONFIG.MIN_BRIGHTNESS
          ? "Photo is too dark."
          : "Photo is too bright.";
    } else if (!sharpnessOK) {
      reason =
        "Photo may be blurry. Keep your face still.";
    }

    return {
      passed:
        score >=
        PHOTO_CONFIG.MIN_QUALITY_SCORE,

      score,

      brightness: Number(
        brightness.toFixed(1)
      ),

      sharpness: Number(
        sharpness.toFixed(1)
      ),

      width,
      height,

      reason,
    };
  };

  /* =========================================================
     LIVE QUALITY
  ========================================================= */

  useEffect(() => {
    if (!cameraOn) {
      setLiveQuality(null);
      return;
    }

    let stopped = false;

    const checkLive = () => {
      if (stopped) return;

      const video = videoRef.current;
      const canvas = liveCanvasRef.current;

      if (
        !video ||
        !canvas ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        return;
      }

      const size = 300;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext(
        "2d",
        {
          willReadFrequently: true,
        }
      );

      if (!ctx) return;

      /*
        Center crop.
        Lightweight.
      */

      const cropWidth =
        video.videoWidth * 0.42;

      const cropHeight =
        video.videoHeight * 0.75;

      const sx =
        (video.videoWidth -
          cropWidth) /
        2;

      const sy =
        (video.videoHeight -
          cropHeight) /
        2;

      ctx.drawImage(
        video,
        sx,
        sy,
        cropWidth,
        cropHeight,
        0,
        0,
        size,
        size
      );

      const quality = checkQuality(
        ctx,
        size,
        size
      );

      if (!stopped) {
        setLiveQuality(quality);

        if (quality.score >= 90) {
          setCameraQuality("EXCELLENT");
        } else if (quality.score >= 80) {
          setCameraQuality("GOOD");
        } else {
          setCameraQuality("POOR");
        }
      }
    };

    checkLive();

    const timer = setInterval(
      checkLive,
      PHOTO_CONFIG.LIVE_CHECK_INTERVAL
    );

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [cameraOn]);

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

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      toast.error("Camera is still loading");
      return;
    }

    /*
      Do not allow low-quality live frame.
    */

    if (
      liveQuality &&
      liveQuality.score < 80
    ) {
      toast.error(
        liveQuality.reason ||
          "Photo quality must be at least 80%"
      );

      return;
    }

    const outputSize = 720;

    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      }
    );

    if (!ctx) {
      toast.error("Unable to capture image");
      return;
    }

    /*
      Center crop
    */

    const cropWidth =
      video.videoWidth * 0.42;

    const cropHeight =
      video.videoHeight * 0.75;

    const sx =
      (video.videoWidth -
        cropWidth) /
      2;

    const sy =
      (video.videoHeight -
        cropHeight) /
      2;

    ctx.clearRect(
      0,
      0,
      outputSize,
      outputSize
    );

    /*
      Mirror correction
    */

    ctx.save();

    ctx.translate(outputSize, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
      video,
      sx,
      sy,
      cropWidth,
      cropHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    ctx.restore();

    /*
      Final quality check
    */

    const quality = checkQuality(
      ctx,
      outputSize,
      outputSize
    );

    setPhotoQuality(quality);

    if (
      !quality.passed ||
      quality.score < 80
    ) {
      setCameraQuality("POOR");

      toast.error(
        quality.reason ||
          "Photo quality must be at least 80%"
      );

      return;
    }

    /*
      Convert to JPEG
    */

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error(
            "Photo capture failed"
          );
          return;
        }

        const previewUrl =
          URL.createObjectURL(blob);

        if (capturedPhoto?.previewUrl) {
          URL.revokeObjectURL(
            capturedPhoto.previewUrl
          );
        }

        setCapturedPhoto({
          blob,
          previewUrl,
          quality,
          width: outputSize,
          height: outputSize,
        });

        setCameraQuality(
          quality.score >= 90
            ? "EXCELLENT"
            : "GOOD"
        );

        toast.success(
          `Photo qualified — ${quality.score}%`
        );

        /*
          Stop camera only after
          successful capture.
        */

        stopCamera();
      },
      "image/jpeg",
      0.90
    );
  };

  /* =========================================================
     RETAKE
  ========================================================= */

  const retake = async () => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(
        capturedPhoto.previewUrl
      );
    }

    setCapturedPhoto(null);
    setPhotoQuality(null);
    setLiveQuality(null);
    setCameraQuality("WAITING");

    await startCamera();
  };

  /* =========================================================
     RESET FORM
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
    setPhotoQuality(null);
    setLiveQuality(null);

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

    if (
      capturedPhoto &&
      photoQuality?.passed
    ) {
      progress += 25;
    }

    return progress;
  }, [
    studentId,
    name,
    className,
    capturedPhoto,
    photoQuality,
  ]);

  /* =========================================================
     DUPLICATE
  ========================================================= */

  const duplicateStudent = useMemo(() => {
    if (!studentId.trim()) return false;

    const id = studentId
      .trim()
      .toLowerCase();

    return students.some((student) => {
      const studentIdValue = String(
        student?.student_id ||
          student?.id ||
          ""
      ).toLowerCase();

      return studentIdValue === id;
    });
  }, [students, studentId]);

  /* =========================================================
     FORM READY
  ========================================================= */

  const formReady = Boolean(
    studentId.trim() &&
      name.trim() &&
      className.trim() &&
      capturedPhoto &&
      photoQuality?.passed
  );

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("idle");
    setMessage("");

    if (!studentId.trim()) {
      setStatus("error");
      setMessage(
        "Student ID is required."
      );
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
      setMessage(
        "Student name is required."
      );
      return;
    }

    if (!className.trim()) {
      setStatus("error");
      setMessage(
        "Class is required."
      );
      return;
    }

    if (!capturedPhoto) {
      setStatus("error");
      setMessage(
        "Capture a student photo first."
      );
      return;
    }

    /*
      HARD 80% BLOCK
    */

    if (
      !photoQuality?.passed ||
      Number(photoQuality.score) < 80
    ) {
      setStatus("error");

      setMessage(
        "Photo quality must be at least 80%. Please retake."
      );

      toast.error(
        "Qualified photo required."
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
        "course",
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
            Authorization:
              `Bearer ${accessToken}`,
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
    const query = search
      .trim()
      .toLowerCase();

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
          student?.course ||
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
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
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
     QUALITY COLOR
  ========================================================= */

  const qualityColor =
    cameraQuality === "EXCELLENT"
      ? "text-yellow-300"
      : cameraQuality === "GOOD"
      ? "text-emerald-400"
      : cameraQuality === "POOR"
      ? "text-red-400"
      : cameraQuality === "OFFLINE"
      ? "text-slate-600"
      : "text-slate-500";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-200">

        <PageHeader />

        <StatsGrid
          studentsCount={students.length}
          capturedPhoto={capturedPhoto}
        />

        <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">

          {/* CAMERA */}

          <div className="relative">

            <CameraEnrollmentCard
              videoRef={videoRef}
              cameraOn={cameraOn}
              cameraLoading={cameraLoading}
              capturedPhoto={capturedPhoto}
              cameraQuality={cameraQuality}
              qualityColor={qualityColor}
              liveQuality={liveQuality}
              photoQuality={photoQuality}
              startCamera={startCamera}
              stopCamera={stopCamera}
              retake={retake}
              capturePhoto={capturePhoto}
            />

            {/* QUALITY */}

            {(liveQuality || photoQuality) && (
              <div
                className={`mt-2 rounded-xl border p-3 ${
                  (
                    photoQuality ||
                    liveQuality
                  )?.passed
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-slate-500">
                      {cameraOn
                        ? "Live Photo Quality"
                        : "Captured Photo Quality"}
                    </p>

                    <p
                      className={`mt-1 text-2xl font-bold ${
                        (
                          photoQuality ||
                          liveQuality
                        )?.score >= 90
                          ? "text-yellow-300"
                          : (
                              photoQuality ||
                              liveQuality
                            )?.score >= 80
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {
                        (
                          photoQuality ||
                          liveQuality
                        )?.score
                      }
                      %
                    </p>
                  </div>

                  <div
                    className={`rounded-lg border px-3 py-2 text-[9px] font-bold ${
                      (
                        photoQuality ||
                        liveQuality
                      )?.score >= 80
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                        : "border-red-400/20 bg-red-400/10 text-red-400"
                    }`}
                  >
                    {(
                      photoQuality ||
                      liveQuality
                    )?.score >= 80
                      ? "QUALIFIED"
                      : "RETAKE / ADJUST"}
                  </div>

                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">

                  <QualityMetric
                    label="Sharpness"
                    value={
                      (
                        photoQuality ||
                        liveQuality
                      )?.sharpness
                    }
                  />

                  <QualityMetric
                    label="Brightness"
                    value={
                      (
                        photoQuality ||
                        liveQuality
                      )?.brightness
                    }
                  />

                  <QualityMetric
                    label="Resolution"
                    value={`${
                      (
                        photoQuality ||
                        liveQuality
                      )?.width
                    }×${
                      (
                        photoQuality ||
                        liveQuality
                      )?.height
                    }`}
                  />

                </div>

                <p
                  className={`mt-2 text-[8px] ${
                    (
                      photoQuality ||
                      liveQuality
                    )?.score >= 80
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {
                    (
                      photoQuality ||
                      liveQuality
                    )?.reason
                  }
                </p>

                {cameraOn && (
                  <p className="mt-2 text-[7px] uppercase tracking-wider text-slate-600">
                    ● Live quality monitoring
                  </p>
                )}

              </div>
            )}
          </div>

          {/* STUDENT DETAILS */}

          <StudentDetailsCard
            studentId={studentId}
            setStudentId={setStudentId}
            name={name}
            setName={setName}
            className={className}
            setClassName={setClassName}
            duplicateStudent={duplicateStudent}
            formProgress={formProgress}
            capturedPhoto={capturedPhoto}
            formReady={formReady}
            status={status}
            message={message}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
          />

        </div>

        {/* REGISTER */}

        <StudentRegisterCard
          students={students}
          filteredStudents={filteredStudents}
          paginatedStudents={paginatedStudents}
          search={search}
          setSearch={setSearch}
          loadingStudents={loadingStudents}
          fetchStudents={fetchStudents}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          baseUri={BASE_URI}
        />

        <SystemStatusFooter />

        {/* HIDDEN CANVAS */}

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        <canvas
          ref={liveCanvasRef}
          className="hidden"
        />

      </div>
    </>
  );
}

/* =========================================================
   QUALITY METRIC
========================================================= */

function QualityMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-950/40 p-2">

      <p className="text-[7px] uppercase text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-slate-300">
        {value}
      </p>

    </div>
  );
}