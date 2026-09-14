import React from "react";
import Sidebar from "./SideBar";
import Topbar from "./TopBar";

const StudentLayout = ({
  title = "Dashboard",
  children,
  onLogout,
}) => {

  // -----------------------------
  // Get logged-in student
  // -----------------------------

  const getStudent = () => {
    try {
      const studentData =
        sessionStorage.getItem("student");

      if (!studentData) {
        return null;
      }

      return JSON.parse(studentData);

    } catch (error) {
      console.error(
        "Student data parse error:",
        error
      );

      return null;
    }
  };

  const student = getStudent();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          SIDEBAR
      ========================== */}

      <Sidebar
        student={student}
        onLogout={onLogout}
      />

      {/* =========================
          RIGHT CONTENT
      ========================== */}

      <div className="lg:ml-[260px]">

        {/* =========================
            TOPBAR
        ========================== */}

        <Topbar
          title={title}
          student={student}
          onLogout={onLogout}
        />

        {/* =========================
            MAIN
        ========================== */}

        <main className="min-h-screen pt-[72px]">

          <div className="w-full p-3 sm:p-4 lg:p-6">

            <div className="w-full min-w-0">
              {children}
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default StudentLayout;
