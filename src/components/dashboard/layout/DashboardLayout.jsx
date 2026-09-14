import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Panel } from "./Panel";

const DashboardLayout = ({ children, onLogout }) => {
  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar />
      <div className="h-screen lg:ml-[260px]">
        <Topbar
          
          onLogout={onLogout}
        />
        <main
          className="
            h-screen
            overflow-y-auto
            overflow-x-hidden
            pt-[90px]
            custom-scrollbar
          "
        >

          {/* =================================================
              PANEL / BREADCRUMB / BACK NAVIGATION
              ================================================= */}
          <div className="px-1 pt-3 sm:px-4 lg:px-6">
            <Panel />
          </div>
          <div className="w-full p-1 sm:p-2 lg:p-6">
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