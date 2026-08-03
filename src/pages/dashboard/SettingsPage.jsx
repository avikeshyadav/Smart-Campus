import { useEffect, useState } from "react";
import DashboardShell from "./DashboardShell";

const defaultSettings = { faceLogin: true, pinRequired: true, captchaEnabled: true, rememberMe: true, biometricAlerts: true, twoFactor: false };

const getStoredSettings = () => {
  if (typeof window === "undefined") return defaultSettings;
  try { 
    const saved = localStorage.getItem("dashboard-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const saveSettings = (value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dashboard-settings", JSON.stringify(value));
  }
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const toggleSetting = (key) => {
    const nextSettings = { ...settings, [key]: !settings[key] };
    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  return (
    <DashboardShell title="Settings">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-2xl font-semibold text-white">Authentication & Security</h2>
          <p className="mt-2 text-sm text-slate-400">Manage face login, captcha, PIN, and session controls.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { key: "faceLogin", label: "Face Login" },
              { key: "pinRequired", label: "PIN Required" },
              { key: "captchaEnabled", label: "Captcha Enabled" },
              { key: "rememberMe", label: "Remember Me" },
              { key: "biometricAlerts", label: "Biometric Alerts" },
              { key: "twoFactor", label: "Two-Factor Mode" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={() => toggleSetting(item.key)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-2xl font-semibold text-white">Profile Details</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Name</p>
              <p className="mt-2 font-semibold text-white">Admin User</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-2 font-semibold text-white">admin@portfolio.com</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-2 font-semibold text-white">Security Admin</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2 font-semibold text-cyan-400">Active</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default SettingsPage;
