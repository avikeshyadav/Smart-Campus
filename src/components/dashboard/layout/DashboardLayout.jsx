import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Panel } from "./Panel";

const DashboardLayout = ({ title = "Dashboard", children, onLogout }) => {
  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-white">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <Sidebar />

      {/* =====================================================
          RIGHT SIDE CONTENT
          Sidebar width = 260px
          ===================================================== */}
      <div className="h-screen lg:ml-[260px]">

        {/* ===================================================
            TOPBAR
            =================================================== */}
        <Topbar
          title={title}
          onLogout={onLogout}
        />

        {/* ===================================================
            MAIN SCROLL AREA
            =================================================== */}
        <main
          className="
            h-screen
            overflow-y-auto
            overflow-x-hidden
            pt-[72px]
            custom-scrollbar
          "
        >

          {/* =================================================
              PANEL / BREADCRUMB / BACK NAVIGATION
              ================================================= */}
          <div className="px-3 pt-3 sm:px-4 lg:px-6">
            <Panel />
          </div>

          {/* =================================================
              PAGE CONTENT
              ================================================= */}
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

export default DashboardLayout;