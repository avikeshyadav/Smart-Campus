import { Activity, ScanFace, ShieldAlert, UserCheck } from "lucide-react";
import { StatCard } from "./UIHelpers";

export default function VerificationStats({ stats, cameraOn }) {
  return (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            icon={ScanFace}
            label="Total Scans"
            value={stats.scans}
            color="cyan"
          />

          <StatCard
            icon={UserCheck}
            label="Verified"
            value={stats.verified}
            color="emerald"
          />

          <StatCard
            icon={ShieldAlert}
            label="Failed"
            value={stats.failed}
            color="rose"
          />

          <StatCard
            icon={Activity}
            label="System"
            value={cameraOn ? "ONLINE" : "READY"}
            color="blue"
          />

        </div>
  );
}
