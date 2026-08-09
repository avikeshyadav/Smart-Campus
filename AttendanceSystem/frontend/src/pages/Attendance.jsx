import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCamera } from "../components/useCamera.js";

// Controlled recognition interval — NOT one request per rendered frame.
// Camera can run at 30fps in the <video> element while we only send a
// recognition request every RECOGNITION_INTERVAL_MS (~5-10 FPS max,
// deliberately much less to keep server load sane).
const RECOGNITION_INTERVAL_MS = 1200;

export default function Attendance() {
  const { authFetch, BASE_URI } = useAuth();
  const { videoRef, captureFrame } = useCamera();

  const [classId, setClassId] = useState("");
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  async function recognizeOnce() {
    const blob = await captureFrame();
    if (!blob) return;

    const formData = new FormData();
    formData.append("image", blob, "frame.jpg");
    if (classId) formData.append("classId", classId);

    const res = await authFetch(`${BASE_URI}/api/attendance/recognize`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(recognizeOnce, RECOGNITION_INTERVAL_MS);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, classId]);

  function statusLabel() {
    if (!result) return "Waiting...";
    if (!result.matched) return result.message || "No match";
    if (result.alreadyMarked) return "Already marked today";
    return (result.status || "present").toUpperCase();
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Live Attendance</h2>

      <input
        placeholder="Class ID (optional)"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", background: "#000" }} />

      <button
        onClick={() => setRunning((r) => !r)}
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      >
        {running ? "Stop Recognition" : "Start Recognition"}
      </button>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc" }}>
        <p>Face: {result?.name || (result?.studentId ? `Student #${result.studentId}` : "—")}</p>
        <p>Confidence: {result?.confidence != null ? result.confidence.toFixed(2) : "—"}</p>
        <p>Status: {statusLabel()}</p>
      </div>
    </div>
  );
}
