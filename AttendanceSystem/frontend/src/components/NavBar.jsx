import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid #ddd",
        fontFamily: "sans-serif",
      }}
    >
      <Link to="/dashboard/students/new">Add Student</Link>
      <Link to="/dashboard/enrollment">Face Enrollment</Link>
      <Link to="/dashboard/attendance">Live Attendance</Link>
      <span style={{ marginLeft: "auto" }}>{user?.name} ({user?.role})</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
