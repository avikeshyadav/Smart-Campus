import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCamera } from "../components/useCamera.js";

const SAMPLE_POSES = [
  "front",
  "slight_left",
  "slight_right",
  "looking_up",
  "looking_down",
  "with_glasses_or_variation",
];

export default function Enrollment() {
  const { authFetch, BASE_URI } = useAuth();
  const { videoRef, captureFrame } = useCamera();

  const [studentId, setStudentId] = useState("");
  const [poseIndex, setPoseIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [samplesTaken, setSamplesTaken] = useState(0);

  async function captureSample() {
    if (!studentId) {
      setStatus("Enter a student ID first.");
      return;
    }

    const blob = await captureFrame();
    if (!blob) {
      setStatus("Camera not ready yet.");
      return;
    }

    const formData = new FormData();
    formData.append("image", blob, "sample.jpg");
    formData.append("sampleLabel", SAMPLE_POSES[poseIndex] || "extra");

    setStatus("Uploading sample...");

    const res = await authFetch(`${BASE_URI}/api/students/${studentId}/enroll-face`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      setSamplesTaken(data.totalSamples);
      setStatus(`Saved sample: ${SAMPLE_POSES[poseIndex] || "extra"}`);
      setPoseIndex((i) => Math.min(i + 1, SAMPLE_POSES.length - 1));
    } else {
      setStatus(`Failed: ${data.message}`);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Face Enrollment</h2>

      <input
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", background: "#000" }} />

      <p>
        Next pose to capture: <strong>{SAMPLE_POSES[poseIndex] || "extra sample"}</strong>
      </p>
      <p>Samples saved for this student: {samplesTaken} (aim for 5–10)</p>

      <button onClick={captureSample} style={{ width: "100%", padding: 10 }}>
        Capture Sample
      </button>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
