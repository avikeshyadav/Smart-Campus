import { useEffect, useState } from "react";
import {toast} from "react-hot-toast"
import {BASE_URI} from '../../config/api';
// import * as modules from "./index5";
import DashboardShell from "./DashboardShell";
import { useAuth } from "../../context/AuthContext";
import MainCameraComponent from "../dashboard/DashboardModule/MainCameraComponent";
import StudentLiveTracking from "../dashboard/DashboardModule/StudentLiveTracking";
import RealTimeAnalytics from "../dashboard/DashboardModule/RealTimeAnalysis";
import ClassroomLiveMonitoring from "../dashboard/DashboardModule/ClassroomLiveMonitoring";
import AlertsNotifications from "../dashboard/DashboardModule/Alert_Notifications";
import QuickAction from "../dashboard/DashboardModule/QuickAction";
import ReportsAnalytics from "../dashboard/DashboardModule/ReportAndAnalysis";
import SystemOverview from "../dashboard/DashboardModule/SystemOverview";
const DashboardPage = () => {
 const {accessToken} = useAuth();
  const [summary, setSummary] = useState({ totalStudents: 0, activeToday: 0, verifiedMatches: 0, alerts: 0 });

  useEffect(() => {
  const loadDashboard = async () => {

    try {
      const res = await fetch(`${BASE_URI}/api/students/count`,
        {
            method:"GET",
            headers:{
              authorization: `Bearer ${accessToken}`
            }
          }
      );
      const studentData = await res.json();
      toast.success("Students Loaded");
      setSummary({
        totalStudents: studentData.total,
        // activeToday: studentData.filter((student) => {
        //   const lastActive = new Date(student.lastActive);
        //   const today = new Date();
        //   return lastActive.toDateString() === today.toDateString();
        // }).length ,
        activeToday:0,
        verifiedMatches: 0,
        alerts: 0,
      });
    } catch (err) {
      toast.error(err);
    }
  };

 
    if(accessToken){
      loadDashboard();
    }


  }, [accessToken]);

  // const componentEntries = Object.entries(modules);
  return (
    <DashboardShell title="Student Recognition Management">
      <div className="space-y-2">
        <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2">
            <p className="text-xs text-slate-400">Total Students</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {summary.totalStudents}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2">
            <p className="text-xs text-slate-400">Active Today</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {summary.activeToday}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2">
            <p className="text-xs text-slate-400">Verified Matches</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {summary.verifiedMatches}%
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2">
            <p className="text-xs text-slate-400">Alerts</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {summary.alerts}
            </p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="mb-4 flex items-center justify-between">
        <MainCameraComponent />
        <StudentLiveTracking />
          </div>
        </section> 
         <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="mb-4 flex items-center justify-between">
            <RealTimeAnalytics />
            <ClassroomLiveMonitoring />
          </div>
        </section> 
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="mb-4 flex items-center justify-between">
              <ReportsAnalytics />
              <SystemOverview />
          </div>
        </section> 
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="mb-4 flex items-center justify-between">
              <AlertsNotifications />
              <QuickAction />
          </div>
        </section> 
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
