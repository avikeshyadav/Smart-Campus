import React from "react";
import { InfoCard, Row, Pill } from "./InfoCard";

/**
 * SecurityCard
 * Password / 2FA / verification / sessions overview, plus quick actions.
 *
 * Props:
 *  - data: {
 *      passwordLastChanged, twoFactorEnabled,
 *      emailVerified, phoneVerified,
 *      activeSessionsCount, lastLogin,
 *      lastLoginLocation, lastLoginDevice
 *    }
 *  - onChangePassword, onToggle2FA, onLogoutAllDevices: () => void
 */
export default function SecurityCard({
  data = {},
  onChangePassword,
  onToggle2FA,
  onLogoutAllDevices,
}) {
  const {
    passwordLastChanged,
    twoFactorEnabled,
    emailVerified,
    phoneVerified,
    activeSessionsCount,
    lastLogin,
    lastLoginLocation,
    lastLoginDevice,
  } = data;

  return (

    
    <InfoCard title="Security">
      <Row
        label="Password"
        value={
          passwordLastChanged
            ? `Last Changed at :  ${passwordLastChanged}`
            : "Not set"
        }
      />
      <Row
        label="Two-factor authentication"
        value={
          <Pill
            label={twoFactorEnabled ? "Enabled" : "Disabled"}
            tone={twoFactorEnabled ? "good" : "warn"}
          />
        }
      />
      <Row
        label="Email verification"
        value={
          <Pill
            label={emailVerified ? "Verified" : "Unverified"}
            tone={emailVerified ? "good" : "bad"}
          />
        }
      />
      <Row
        label="Phone verification"
        value={
          <Pill
            label={phoneVerified ? "Verified" : "Unverified"}
            tone={phoneVerified ? "good" : "bad"}
          />
        }
      />
      <Row label="Active sessions" value={activeSessionsCount} />
      <Row label="Last login" value={lastLogin} />
      <Row
        label="Login location / device"
        value={
          [lastLoginLocation, lastLoginDevice].filter(Boolean).join(" · ") ||
          undefined
        }
      />

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={onChangePassword}
          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium border border-slate-600"
        >
          Change password
        </button>
        <button
          onClick={onToggle2FA}
          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium border border-slate-600"
        >
          {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
        <button
          onClick={onLogoutAllDevices}
          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30"
        >
          Log out all devices
        </button>
      </div>
    </InfoCard>
  );
}
