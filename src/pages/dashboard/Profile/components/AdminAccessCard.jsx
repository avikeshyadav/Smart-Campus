import React from "react";
import { InfoCard, Row, Pill } from "./InfoCard";

/**
 * AdminAccessCard
 * Shows role, permission level, and which modules the admin can reach.
 *
 * Props:
 *  - data: {
 *      adminRole, permissionLevel,
 *      assignedModules: string[],
 *      userManagementAccess: bool,
 *      reportsAccess: bool,
 *      settingsAccess: bool,
 *      apiAccess: bool,
 *      lastRoleChange
 *    }
 */
export default function AdminAccessCard({ data = {} }) {
  const {
    adminRole,
    permissionLevel,
    assignedModules = [],
    userManagementAccess,
    reportsAccess,
    settingsAccess,
    apiAccess,
    lastRoleChange,
  } = data;

  const accessFlags = [
    ["User management", userManagementAccess],
    ["Reports", reportsAccess],
    ["Settings", settingsAccess],
    ["API access", apiAccess],
  ];

  return (
    <InfoCard title="Admin & access">
      <Row label="Admin role" value={adminRole} />
      <Row label="Permission level" value={permissionLevel} />

      {assignedModules.length > 0 && (
        <div>
          <p className="text-sm text-slate-400 mb-1.5">Assigned modules</p>
          <div className="flex flex-wrap gap-1.5">
            {assignedModules.map((m) => (
              <Pill key={m} label={m} tone="neutral" />
            ))}
          </div>
        </div>
      )}

      <div className="pt-1 grid grid-cols-2 gap-y-2">
        {accessFlags.map(([label, granted]) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                granted ? "bg-emerald-400" : "bg-slate-600"
              }`}
            />
            <span className={granted ? "text-slate-200" : "text-slate-500"}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <Row label="Last role change" value={lastRoleChange} />
    </InfoCard>
  );
}
