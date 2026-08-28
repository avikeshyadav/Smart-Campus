import { ScanFace, ShieldCheck, UserCheck, Users } from "lucide-react";
import StatCard from "./StatCard";

export default function StatsGrid({ studentsCount, capturedPhoto }) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Registered"
        value={studentsCount}
        subText="TOTAL"
        color="text-emerald-400"
      />

      <StatCard
        icon={UserCheck}
        label="Active"
        value={studentsCount}
        subText="ACTIVE"
        color="text-cyan-300"
      />

      <StatCard
        icon={ScanFace}
        label="Face Ready"
        value={capturedPhoto ? "READY" : "WAIT"}
        subText="ENROLLMENT"
        color={capturedPhoto ? "text-yellow-300" : "text-slate-500"}
      />

      <StatCard
        icon={ShieldCheck}
        label="Security"
        value="AES"
        subText="PROTECTED"
        color="text-purple-400"
      />
    </div>
  );
}
