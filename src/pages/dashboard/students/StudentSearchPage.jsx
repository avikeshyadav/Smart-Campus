import React, { useEffect, useRef, useState } from "react";
import DashboardShell from "../DashboardShell";
import { toast } from "react-hot-toast";

import FaceVerificationHeader from "./components/faceVerification/FaceVerificationHeader";
import VerificationStats from "./components/faceVerification/VerificationStats";
import ErrorAlert from "./components/faceVerification/ErrorAlert";
import CameraVerificationCard from "./components/faceVerification/CameraVerificationCard";
import StudentResultCard from "./components/faceVerification/StudentResultCard";
import RecentScansCard from "./components/faceVerification/RecentScansCard";
import RecognitionSystemCard from "./components/faceVerification/RecognitionSystemCard";

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
    toast.success("Camera started successfully.");
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
            // backendError = errorData.detail;
          }
        } catch {
          // ignore json parsing error
        }

        setStats((prev) => ({
          ...prev,
          scans: prev.scans + 1,
          failed: prev.failed + 1,
        }));
        toast.error(backendError)

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
        <FaceVerificationHeader
          cameraOn={cameraOn}
          cameraStatus={cameraStatus}
        />

        <VerificationStats
          stats={stats}
          cameraOn={cameraOn}
        />

        <ErrorAlert error={error} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(350px,.8fr)]">
          <CameraVerificationCard
            videoRef={videoRef}
            cameraOn={cameraOn}
            scanning={scanning}
            cameraStatus={cameraStatus}
            startCamera={startCamera}
            stopCamera={stopCamera}
            flipCamera={flipCamera}
            searchFace={searchFace}
            lastScan={lastScan}
          />

          <StudentResultCard
            student={student}
            confidence={confidence}
            lastScan={lastScan}
            resetScan={resetScan}
            formatTime={formatTime}
            cameraOn={cameraOn}
            startCamera={startCamera}
            searchFace={searchFace}
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <RecentScansCard
            scanHistory={scanHistory}
            formatTime={formatTime}
          />

          <RecognitionSystemCard cameraOn={cameraOn} />
        </div>
      </div>

      <style>{`\n        @keyframes scan {\n          0% {\n            top: 0%;\n            opacity: 0;\n          }\n          15% { opacity: 1; }\n          50% { top: 50%; opacity: 1; }\n          85% { opacity: 1; }\n          100% { top: 100%; opacity: 0; }\n        }\n      `}</style>
    </DashboardShell>
  );
};

export default StudentSearchPage;
