import React from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";
import NavBar from "./NavBar.jsx";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <NavBar />
      {children}
    </ProtectedRoute>
  );
}
