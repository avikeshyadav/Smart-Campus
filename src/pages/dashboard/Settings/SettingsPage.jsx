import { useEffect, useState } from "react";
import {
  Shield,
  Fingerprint,
  KeyRound,
  RefreshCw,
  Smartphone,
  LockKeyhole,
  Eye,
  UserRound,
  BellRing,
  ChevronRight,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import UserSection from "./modules/UserSection";

const DEFAULT_SETTINGS = {
  faceLogin: true,
  pinRequired: true,
  captchaEnabled: true,
  rememberMe: true,
  biometricAlerts: true,
  twoFactor: false,
};

const STORAGE_KEY = "dashboard-settings";

const settingsGroups = [
  {
    title: "Authentication",
    description: "Control how users sign in to their accounts.",
    items: [
      {
        key: "faceLogin",
        label: "Face Login",
        description:
          "Allow users to authenticate using face recognition.",
        icon: Fingerprint,
        color: "cyan",
      },
      {
        key: "pinRequired",
        label: "PIN Protection",
        description:
          "Require a PIN for an additional layer of security.",
        icon: KeyRound,
        color: "violet",
      },
      {
        key: "twoFactor",
        label: "Two-Factor Authentication",
        description:
          "Require an additional verification code during login.",
        icon: Shield,
        color: "emerald",
      },
    ],
  },
  {
    title: "Login Protection",
    description: "Configure security and session protection.",
    items: [
      {
        key: "captchaEnabled",
        label: "CAPTCHA Protection",
        description:
          "Protect authentication forms from automated requests.",
        icon: RefreshCw,
        color: "amber",
      },
      {
        key: "rememberMe",
        label: "Remember Me",
        description:
          "Allow users to stay signed in on trusted devices.",
        icon: Smartphone,
        color: "blue",
      },
      {
        key: "biometricAlerts",
        label: "Biometric Alerts",
        description:
          "Receive alerts whenever biometric authentication occurs.",
        icon: BellRing,
        color: "pink",
      },
    ],
  },
];

const getStoredSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState("security");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
    setIsLoaded(true);
  }, []);

  const toggleSetting = (key) => {
    setSettings((previous) => {
      const next = {
        ...previous,
        [key]: !previous[key],
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );

      return next;
    });
  };

  const enabledCount = Object.values(settings).filter(
    Boolean
  ).length;

  const securityScore = Math.round(
    (enabledCount / Object.keys(settings).length) * 100
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <RefreshCw
          size={26}
          className="animate-spin text-cyan-400"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-3 py-5 text-white sm:px-5 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-cyan-400">
                <Settings2 size={16} />
                <span>System Settings</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Manage authentication, security, login protection,
                and user access preferences.
              </p>
            </div>

            {/* SECURITY SCORE */}
            <div className="flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:w-fit">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <Shield
                  size={22}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Security Status
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {securityScore}%
                  </span>

                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={13} />
                    Protected
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ==========================================
            MOBILE NAV
        ========================================== */}
        <div className="mb-5 flex overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-1 lg:hidden">
          <button
            onClick={() => setActiveTab("security")}
            className={`flex min-w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "security"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield size={16} />
            Security
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex min-w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "users"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserRound size={16} />
            Users
          </button>
        </div>

        {/* ==========================================
            MAIN LAYOUT
        ========================================== */}
        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">

          {/* ==========================================
              SIDEBAR
          ========================================== */}
          <aside className="hidden lg:block">
            <div className="sticky top-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-2">

              <div className="px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Settings
                </p>
              </div>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                  activeTab === "security"
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} />
                  <div>
                    <p className="text-sm font-medium">
                      Security
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Authentication
                    </p>
                  </div>
                </div>

                <ChevronRight size={15} />
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                  activeTab === "users"
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserRound size={18} />
                  <div>
                    <p className="text-sm font-medium">
                      Users
                    </p>
                    <p className="text-[11px] text-slate-500">
                      User controls
                    </p>
                  </div>
                </div>

                <ChevronRight size={15} />
              </button>

              {/* INFO BOX */}
              <div className="mt-4 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <LockKeyhole
                    size={15}
                    className="text-cyan-400"
                  />
                  <span className="text-xs font-semibold text-cyan-400">
                    Security Tip
                  </span>
                </div>

                <p className="text-[11px] leading-5 text-slate-500">
                  Keep multiple authentication methods enabled
                  to provide stronger account protection.
                </p>
              </div>
            </div>
          </aside>

          {/* ==========================================
              CONTENT
          ========================================== */}
          <main>

            {/* SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">

                {/* TOP CARD */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                  <div className="border-b border-slate-800 p-5 sm:p-6">
                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                        <LockKeyhole
                          size={21}
                          className="text-cyan-400"
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-white">
                          Authentication & Security
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Configure how users authenticate and
                          protect their accounts.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* SETTINGS GROUPS */}
                  <div className="divide-y divide-slate-800">

                    {settingsGroups.map((group) => (
                      <div
                        key={group.title}
                        className="p-5 sm:p-6"
                      >

                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-white">
                            {group.title}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {group.description}
                          </p>
                        </div>

                        <div className="space-y-2">

                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const enabled =
                              Boolean(settings[item.key]);

                            return (
                              <div
                                key={item.key}
                                className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition ${
                                  enabled
                                    ? "border-slate-700 bg-slate-800/40"
                                    : "border-slate-800 bg-slate-950/30"
                                }`}
                              >

                                <div className="flex min-w-0 items-center gap-3">

                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                      enabled
                                        ? "bg-cyan-500/10"
                                        : "bg-slate-800"
                                    }`}
                                  >
                                    <Icon
                                      size={18}
                                      className={
                                        enabled
                                          ? "text-cyan-400"
                                          : "text-slate-500"
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="text-sm font-medium text-white">
                                      {item.label}
                                    </h4>

                                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                      {item.description}
                                    </p>
                                  </div>

                                </div>

                                {/* TOGGLE */}
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={enabled}
                                  aria-label={`Toggle ${item.label}`}
                                  onClick={() =>
                                    toggleSetting(item.key)
                                  }
                                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${
                                    enabled
                                      ? "bg-cyan-500"
                                      : "bg-slate-700"
                                  }`}
                                >
                                <span
                                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  enabled ? "translate-x-1" : "-translate-x-5"
                                }`}
                              />

                                </button>

                              </div>
                            );
                          })}

                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {/* SECURITY STATUS */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Security Overview
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Current authentication protection level.
                      </p>
                    </div>

                    <Eye
                      size={18}
                      className="text-slate-600"
                    />
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        securityScore >= 70
                          ? "bg-emerald-400"
                          : securityScore >= 40
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                      style={{
                        width: `${securityScore}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {enabledCount} of{" "}
                      {Object.keys(settings).length} features enabled
                    </span>

                    <span
                      className={
                        securityScore >= 70
                          ? "text-emerald-400"
                          : securityScore >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }
                    >
                      {securityScore >= 70
                        ? "Good protection"
                        : securityScore >= 40
                        ? "Moderate protection"
                        : "Needs attention"}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* USERS */}
            {activeTab === "users" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                    <UserRound
                      size={21}
                      className="text-violet-400"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      User Management
                    </h2>

                    <p className="text-xs text-slate-500">
                      Manage user access and account controls.
                    </p>
                  </div>
                </div>

                <UserSection />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
