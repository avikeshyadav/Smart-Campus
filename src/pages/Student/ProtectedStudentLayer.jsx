import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

const ProtectedStudentLayer = () => {
  const location = useLocation();

  // Get access token
  const accessToken = sessionStorage.getItem(
    "Student_access_token"
  );

  // Get student
  const student = sessionStorage.getItem(
    "student"
  );

  // --------------------------------
  // Not logged in
  // --------------------------------

  if (!accessToken || !student) {
    return (
      <Navigate
        to="/student/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // --------------------------------
  // Logged in
  // --------------------------------

  return <Outlet />;
};

export default ProtectedStudentLayer;