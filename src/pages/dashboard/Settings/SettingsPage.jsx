import { useEffect, useState } from "react";
import DashboardShell from "../DashboardShell";
import UserSection from "./modules/UserSection";

const defaultSettings = {
  faceLogin: true,
  pinRequired: true,
  captchaEnabled: true,
  rememberMe: true,
  biometricAlerts: true,
  twoFactor: false,
};

const settingsItems = [
  {
    key: "faceLogin",
    label: "Face Login",
    description: "Allow users to authenticate using face recognition.",
  },
  {
    key: "pinRequired",
    label: "PIN Required",
    description: "Require a PIN for additional account security.",
  },
  {
    key: "captchaEnabled",
    label: "Captcha Enabled",
    description: "Enable CAPTCHA protection on authentication forms.",
  },
  {
    key: "rememberMe",
    label: "Remember Me",
    description: "Allow users to stay signed in on trusted devices.",
  },
  {
    key: "biometricAlerts",
    label: "Biometric Alerts",
    description: "Receive alerts for biometric authentication events.",
  },
  {
    key: "twoFactor",
    label: "Two-Factor Mode",
    description: "Require an additional verification step during login.",
  },
];

const getStoredSettings = () => {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const saved = localStorage.getItem("dashboard-settings");

    return saved
      ? {
          ...defaultSettings,
          ...JSON.parse(saved),
        }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const saveSettings = (value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "dashboard-settings",
      JSON.stringify(value)
    );
  }
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const toggleSetting = (key) => {
    const nextSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  return (
    <DashboardShell>
      <div className="min-h-screen w-full bg-slate-950 px-3 py-4 sm:px-4 md:px-6 lg:px-8">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg sm:p-5 md:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                Authentication &amp; Security
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                Manage face login, captcha, PIN, and session controls.
              </p>
            </div>

            <div className="w-fit rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
              <span className="text-xs font-medium text-cyan-400">
                Security Settings
              </span>
            </div>

          </div>
        </div>


        {/* =====================================================
            SETTINGS GRID
        ====================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">

          {settingsItems.map((item) => (
            <div
              key={item.key}
              className={`
                group
                rounded-2xl
                border
                p-4
                shadow-lg
                transition-all
                duration-200
                sm:p-5

                ${
                  settings[item.key]
                    ? "border-cyan-500/30 bg-slate-900"
                    : "border-slate-800 bg-slate-900/70"
                }

                hover:border-cyan-500/40
              `}
            >

              {/* TOP CONTENT */}

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0 flex-1">

                  <h3 className="text-sm font-semibold text-white sm:text-base">
                    {item.label}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                    {item.description}
                  </p>

                </div>


                {/* =================================================
                    CUSTOM TOGGLE
                ================================================== */}

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings[item.key]}
                  aria-label={`Toggle ${item.label}`}
                  onClick={() => toggleSetting(item.key)}
                  className={`
                    relative
                    mt-1
                    h-6
                    w-11
                    shrink-0
                    rounded-full
                    transition-colors
                    duration-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-cyan-500/50

                    ${
                      settings[item.key]
                        ? "bg-cyan-500"
                        : "bg-slate-700"
                    }
                  `}
                >

                  <span
                    className={`
                      absolute
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      rounded-full
                      bg-white
                      shadow-md
                      transition-transform
                      duration-200

                      ${
                        settings[item.key]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }
                    `}
                  />

                </button>

              </div>


              {/* STATUS */}

              <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3">

                <span
                  className={`
                    h-2
                    w-2
                    rounded-full

                    ${
                      settings[item.key]
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        : "bg-slate-600"
                    }
                  `}
                />

                <span
                  className={`
                    text-xs font-medium

                    ${
                      settings[item.key]
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  {settings[item.key] ? "Enabled" : "Disabled"}
                </span>

              </div>

            </div>
          ))}

        </div>


        {/* =====================================================
            USER CONTROL SECTION
        ====================================================== */}

        <div className="mt-5 sm:mt-6">

          <UserSection />

        </div>

      </div>
    </DashboardShell>
  );
};

export default SettingsPage;