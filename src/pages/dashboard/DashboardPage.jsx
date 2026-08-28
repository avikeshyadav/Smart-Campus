import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { BASE_URI } from "../../config/api";
import DashboardShell from "./DashboardShell";
import { useAuth } from "../../context/AuthContext";

import MainCameraComponent from "../dashboard/DashboardModule/MainCameraComponent";
import StudentLiveTracking from "../dashboard/DashboardModule/StudentLiveTracking";

const DashboardPage = () => {
  const { accessToken } = useAuth();

  const [summary, setSummary] = useState({
    totalStudents: 0,
    activeToday: 0,
    verifiedMatches: 0,
    alerts: 0,
  });

  // Same data goes to both components
  const [trackedStudent, setTrackedStudent] =
    useState(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const response = await fetch(
          `${BASE_URI}/api/students/count`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) return;

        setSummary((prev) => ({
          ...prev,
          totalStudents: Number(data?.total || 0),
        }));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error("Unable to load students");
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  /*
   * Camera se jab student milega,
   * sirf yahi state update hogi.
   *
   * NO ATTENDANCE.
   */
  const handleStudentTracked = (student) => {
    if (!student?.student_id) return;

    setTrackedStudent(student);

    setSummary((prev) => ({
      ...prev,
      activeToday: 1,
      verifiedMatches: prev.verifiedMatches + 1,
    }));
  };

  return (
    <DashboardShell title="Student Recognition Management">

      <div className="space-y-2">

        {/* SUMMARY */}

        <section className="grid grid-cols-2 gap-2 md:grid-cols-4">

          <Stat
            label="Total Students"
            value={summary.totalStudents}
          />

          <Stat
            label="Currently Tracked"
            value={
              trackedStudent ? 1 : 0
            }
          />

          <Stat
            label="Recognition Matches"
            value={summary.verifiedMatches}
          />

          <Stat
            label="Alerts"
            value={summary.alerts}
          />

        </section>

        {/* TRACKING */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3">

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

            <MainCameraComponent
              accessToken={accessToken}
              baseUri={BASE_URI}
              trackedStudent={trackedStudent}
              onStudentTracked={
                handleStudentTracked
              }
            />

            <StudentLiveTracking
              student={trackedStudent}
            />

          </div>

        </section>

      </div>

    </DashboardShell>
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
