import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BASE_URI } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import PolarAreaChart from "./DashboardModule/Charts/PolarAreaChart";
import HostelOverview from "./DashboardModule/Charts/HostelOverview";
import DepartmentStudentsChart from "./DashboardModule/Charts/DepartmentStudentsChart";
import MainCameraComponent from "./DashboardModule/MainCameraComponent";
import Alert_Notifications from "./DashboardModule/Alert_Notifications";
import SystemOverview from "./DeviceHealthPanel/SystemOverview";

const DashboardPage = () => {
  const { accessToken ,user} = useAuth();
  const [summary, setSummary] = useState({
    totalStudents: 0,availableBeds: 0,maintenanceRooms: 0,occupiedBeds: 0,
    openMaintenance:0, totalBeds:0, totalFloors:0, totalHostels:0, totalRooms:0
  });

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false; 
    const loadDashboard = async () => {
      try {
        const response = await fetch(
          `${BASE_URI}/api/dashboard/dashboardData`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {throw new Error(`Server error: ${response.status}`);}
        const data = await response.json();
        if (cancelled) return;
        setSummary((prev) => ({
          ...prev,
          totalStudents: Number(data?.overview?.totalStudents || 0),
          availableBeds: Number(data?.overview?.availableBeds || 0),
          maintenanceRooms: Number(data?.overview?.maintenanceRooms || 0),
          occupiedBeds: Number(data?.overview?.occupiedBeds || 0),
          openMaintenance: Number(data?.overview?.openMaintenance || 0),
          totalBeds: Number(data?.overview?.totalBeds || 0),
          totalFloors: Number(data?.overview?.totalFloors || 0),
          totalHostels: Number(data?.overview?.totalHostels || 0),
          totalRooms: Number(data?.overview?.totalRooms || 0),
        }));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error("Unable to load dashboard data");
        }
      }
    };
    loadDashboard();
    return () => {cancelled = true;};}, [accessToken]);
    console.log(summary)

  return (
    <div className="space-y-2">
      {/* TRACKING */}
           {user?.roles?.some((role) => ["super_admin", "ragistar"].includes(role.slug)) ?(
         <section className="grid grid-cols-1 gap-3 lg:grid-cols-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
              <PolarAreaChart
                title="Overall Details"
                totalStudents={summary.totalStudents}
              />
              <HostelOverview summary ={summary}
              />
         </section>):(
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <MainCameraComponent
            accessToken={accessToken}
            baseUri={BASE_URI}
          />
          <Alert_Notifications />
        </div>
      </section>
      )}
       {user?.isSuperAdmin ? (<SystemOverview />):(<div></div>)}
    </div>
  );
};

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

export default DashboardPage;