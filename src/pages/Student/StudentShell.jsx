import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import StudentLayout from "./DashboardMenu/StudentLayout";

const StudentShell = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("student");
    sessionStorage.removeItem("Student_access_token");

    navigate("/student/login", {
      replace: true,
    });
  };

  return (
    <StudentLayout
      title="Dashboard"
      onLogout={handleLogout}
    >
      <Outlet />
    </StudentLayout>
  );
};

export default StudentShell;
