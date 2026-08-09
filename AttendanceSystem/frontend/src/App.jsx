import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Attendance from "./pages/Attendance.jsx";
import Enrollment from "./pages/Enrollment.jsx";
import AddStudent from "./pages/AddStudent.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/attendance"
          element={
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/enrollment"
          element={
            <DashboardLayout>
              <Enrollment />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/students/new"
          element={
            <DashboardLayout>
              <AddStudent />
            </DashboardLayout>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
