import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AddStudent() {
  const { authFetch, BASE_URI } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("");
  const [createdId, setCreatedId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Creating student...");
    setCreatedId(null);

    const res = await authFetch(`${BASE_URI}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: email || undefined,
        rollNumber,
        classId: classId || undefined,
      }),
    });
    const data = await res.json();

    if (data.success) {
      setCreatedId(data.studentId);
      setStatus("Student created.");
      setName("");
      setEmail("");
      setRollNumber("");
      setClassId("");
    } else {
      setStatus(`Failed: ${data.message}`);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Add Student</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Roll Number</label>
          <input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Class ID (optional)</label>
          <input
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Create Student
        </button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      {createdId && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #4a4", background: "#eafeea" }}>
          <p>
            Created student ID: <strong>{createdId}</strong>
          </p>
          <p>
            Use this ID on the{" "}
            <Link to="/dashboard/enrollment">Face Enrollment</Link> page to capture 5–10 samples.
          </p>
        </div>
      )}
    </div>
  );
}
