import React, { useState } from "react";
import { InfoCard, Row, Pill } from "./InfoCard";

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

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleChangePasswordClick = async () => {
    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    if (!newPassword.trim()) {
      return;
    }

    await onChangePassword(newPassword);

    setNewPassword("");
    setShowPasswordInput(false);
  };

  return (
    <InfoCard title="Security">
      <Row
        label="Last Changed at :"
        value={
          passwordLastChanged
            ? `Last Changed at : ${passwordLastChanged}`
            : "Default Password Found Please Change Password"
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
          [lastLoginLocation, lastLoginDevice]
            .filter(Boolean)
            .join(" · ") || undefined
        }
      />

      {/* CHANGE PASSWORD INPUT */}
      {showPasswordInput && (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoFocus
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleChangePasswordClick();
              }
            }}
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPasswordInput(false);
                setNewPassword("");
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!newPassword.trim()}
              onClick={handleChangePasswordClick}
              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Password
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-4">
        {!showPasswordInput && (
          <button
            onClick={handleChangePasswordClick}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-600"
          >
            Change password
          </button>
        )}

        <button
          onClick={onToggle2FA}
          className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-600"
        >
          {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>

        <button
          onClick={onLogoutAllDevices}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
        >
          Log out all devices
        </button>
      </div>
    </InfoCard>
  );
}
