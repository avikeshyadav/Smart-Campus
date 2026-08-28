import React, { useEffect, useState } from "react";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import PersonalInfoCard from "./components/PersonalInfoCard";
import AdminAccessCard from "./components/AdminAccessCard";
import SecurityCard from "./components/SecurityCard";
import PreferencesCard from "./components/PreferencesCard";
import ActivitySummaryCard from "./components/ActivitySummaryCard";
import DashboardShell from "../DashboardShell";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";
import { toast } from "react-hot-toast";

const TABS = [
  "Overview",
  "Security",
  "Access & Roles",
  "Preferences",
  "Activity Log",
];

export default function AdminProfilePage({ userId }) {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);

  const { accessToken } = useAuth();

  async function loadProfile() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URI}/api/admin/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load profile (${res.status})`);
      }

      const json = await res.json();
      setProfile(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!accessToken) return;

    loadProfile();
  }, [accessToken, userId]);

  // ==========================================
  // EDIT PROFILE
  // ==========================================
  function handleEditProfile() {
    setActiveTab("Overview");
    setIsEditingPersonalInfo(true);
  }

  // ==========================================
  // SAVE PERSONAL INFO
  // ==========================================
  async function handleSavePersonalInfo(formData) {
    try {
      setSavingPersonalInfo(true);

      const response = await fetch(
        `${BASE_URI}/api/admin/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`, 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof result === "object"
            ? result?.message
            : result;

        throw new Error(
          message || `Profile update failed (${response.status})`
        );
      }

      toast.success(
        result?.message || "Profile updated successfully"
      );

      // Option 1: server se latest profile dobara fetch karo
      await loadProfile();

      setIsEditingPersonalInfo(false);
    } catch (error) {
      console.error("Update personal info error:", error);

      toast.error(
        error.message || "Failed to update profile"
      );
    } finally {
      setSavingPersonalInfo(false);
    }
  }

  async function handleChangePassword() {
    const newPassword = window.prompt("Enter new password:");

    if (!newPassword) return;

    try {
      const response = await fetch(
        `${BASE_URI}/api/admin/profile/change_password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof result === "object"
            ? result?.message
            : result;

        throw new Error(
          message || `Password change failed (${response.status})`
        );
      }

      toast.success(
        result?.message || "Password updated successfully"
      );
    } catch (error) {
      console.error("Change password error:", error);

      toast.error(
        error.message || "Something went wrong."
      );
    }
  }

async function handleToggle2FA() {
  try {
    const currentValue =
      profile?.security?.twoFactorEnabled;

    const currentEnabled =
      currentValue === true ||
      currentValue === 1 ||
      currentValue === "1";

    // =========================
    // DISABLE
    // =========================

    if (currentEnabled) {
      const confirmed = window.confirm(
        "Are you sure you want to disable Two-Factor Authentication?"
      );

      if (!confirmed) return;

      setTwoFactorLoading(true);

      const res = await fetch(
        `${BASE_URI}/api/admin/profile/2fa`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled: false,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result?.message || "Failed to disable 2FA"
        );
      }

      setProfile((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          twoFactorEnabled: false,
        },
      }));

      toast.success(
        "Two-factor authentication disabled"
      );

      return;
    }

    // =========================
    // START ENABLE SETUP
    // =========================

    setTwoFactorLoading(true);

    const res = await fetch(
      `${BASE_URI}/api/admin/profile/2fa`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: true,
        }),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.message || "Failed to setup 2FA"
      );
    }

    // QR received
    setTwoFactorSetup(result.data);

    setTwoFactorCode("");

    setShow2FAModal(true);

  } catch (error) {
    console.error("2FA setup error:", error);

    toast.error(
      error.message || "2FA setup failed"
    );
  } finally {
    setTwoFactorLoading(false);
  }
}
  async function handleLogoutAllDevices() {
    if (
      !window.confirm(
        "Log out of all devices? This ends every active session."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URI}/api/admin/profile/logout-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to logout all devices");
      }

      toast.success("Logged out from all other devices");

      setProfile((p) => ({
        ...p,
        security: {
          ...p.security,
          activeSessionsCount: 1,
        },
      }));
    } catch (error) {
      toast.error(error.message);
    }
  }
  
  async function verifyProfile2FA() {
  if (!twoFactorCode.trim()) {
    toast.error("Enter authentication code");
    return;
  }

  if (!/^\d{6}$/.test(twoFactorCode.trim())) {
    toast.error("Authentication code must contain 6 digits");
    return;
  }

  try {
    setTwoFactorLoading(true);

    const res = await fetch(
      `${BASE_URI}/api/admin/profile/2fa/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: twoFactorCode.trim(),
        }),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result?.message || "Invalid authentication code"
      );
    }

    setProfile((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        twoFactorEnabled: true,
      },
    }));

    setShow2FAModal(false);
    setTwoFactorSetup(null);
    setTwoFactorCode("");

    toast.success(
      "Two-factor authentication enabled successfully"
    );

  } catch (error) {
    console.error("2FA verification error:", error);

    toast.error(
      error.message || "Invalid authentication code"
    );
  } finally {
    setTwoFactorLoading(false);
  }
}
// =================== HandlePreferenceTroggle ===============

  async function handlePreferenceToggle(key, nextValue) {
    setProfile((p) => ({
      ...p,
      preferences: {
        ...p.preferences,
        [key]: nextValue,
      },
    }));

    try {
      await fetch(
        `${BASE_URI}/api/admin/profile/preferences`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [key]: nextValue,
          }),
        }
      );
    } catch (error) {
      toast.error("Failed to update preference");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-sm">
          Loading profile…
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-red-400 text-sm">
          {error || "Profile not found."}
        </p>
      </div>
    );
  }

  //==============HANDLE IMAGE UPDATION ============================
  async function handleImageChange(base64Image) {
  try {
    const response = await fetch(
      `${BASE_URI}/api/admin/profile`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_url: base64Image,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Image update failed");
    }

    toast.success("Profile picture updated successfully");

    await loadProfile();
  } catch (error) {
    console.error("Image update error:", error);
    toast.error(error.message || "Failed to update image");
  }
}

  return (
    <DashboardShell title="Profile Page">
      <div className="min-h-screen bg-slate-900 px-4 py-8 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-6">

<ProfileHeader
  profile={profile.header}
  onEditClick={handleEditProfile}
  onImageChange={handleImageChange}
/>

          <ProfileTabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);

              // Agar user manually doosra tab select kare
              if (tab !== "Overview") {
                setIsEditingPersonalInfo(false);
              }
            }}
          />

          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <PersonalInfoCard
                data={profile.personalInfo}
                isEditing={isEditingPersonalInfo}
                saving={savingPersonalInfo}
                onSave={handleSavePersonalInfo}
                onCancel={() =>
                  setIsEditingPersonalInfo(false)
                }
              />

              <ActivitySummaryCard
                profileCompletion={profile.profileCompletion}
                securityScore={profile.securityScore}
                recentActions={profile.recentActions}
              />

            </div>
          )}

          {activeTab === "Security" && (
            <SecurityCard
              data={profile.security}
              onChangePassword={handleChangePassword}
              onToggle2FA={handleToggle2FA}
              onLogoutAllDevices={handleLogoutAllDevices}
            />
          )}

          {activeTab === "Access & Roles" && (
            <AdminAccessCard data={profile.access} />
          )}

          {activeTab === "Preferences" && (
            <PreferencesCard
              data={profile.preferences}
              onToggle={handlePreferenceToggle}
            />
          )}

          {activeTab === "Activity Log" && (
            <ActivitySummaryCard
              profileCompletion={profile.profileCompletion}
              securityScore={profile.securityScore}
              recentActions={profile.recentActions}
            />
          )}

        </div>
      </div>
      {show2FAModal && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

    <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

      {/* HEADER */}

      <div className="mb-6 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          🔐
        </div>

        <h2 className="text-2xl font-black text-white">
          Enable Two-Factor Authentication
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Scan this QR code using Google Authenticator,
          Microsoft Authenticator or another TOTP app.
        </p>

      </div>

      {/* QR */}

      {twoFactorSetup?.qrCode && (
        <div className="mb-5 flex justify-center">

          <div className="rounded-2xl bg-white p-4">

            <img
              src={twoFactorSetup.qrCode}
              alt="2FA QR Code"
              className="h-52 w-52"
            />

          </div>

        </div>
      )}

      {/* SECRET */}

      {twoFactorSetup?.secret && (
        <div className="mb-5">

          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Manual Setup Key
          </p>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">

            <p className="break-all text-center font-mono text-xs text-cyan-400">
              {twoFactorSetup.secret}
            </p>

          </div>

        </div>
      )}

      {/* OTP */}

      <div className="mb-5">

        <label className="mb-2 block text-sm font-bold text-slate-300">
          Enter 6-digit authentication code
        </label>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={twoFactorCode}
          onChange={(e) =>
            setTwoFactorCode(
              e.target.value.replace(/\D/g, "")
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              twoFactorCode.length === 6
            ) {
              verifyProfile2FA();
            }
          }}
          placeholder="000000"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
        />

      </div>

      {/* BUTTONS */}

      <div className="grid grid-cols-2 gap-3">

        <button
          type="button"
          disabled={twoFactorLoading}
          onClick={() => {
            setShow2FAModal(false);
            setTwoFactorSetup(null);
            setTwoFactorCode("");
          }}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 hover:border-slate-500"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            twoFactorLoading ||
            twoFactorCode.length !== 6
          }
          onClick={verifyProfile2FA}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {twoFactorLoading
            ? "Verifying..."
            : "Verify & Enable"}
        </button>

      </div>

    </div>

  </div>
)}
    </DashboardShell>
  );
}