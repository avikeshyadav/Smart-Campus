
import React, { useRef, useState } from "react";

export default function ProfileHeader({ profile, onEditClick, onImageChange }) {
  const {
    avatarUrl,
    fullName,
    username,
    designation,
    adminRole,
    accountStatus,
    lastActive,
  } = profile || {};

  const [preview, setPreview] = useState(avatarUrl || "");
  const fileInputRef = useRef(null);

  const statusStyles = {
    Active:
      "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    Inactive:
      "bg-slate-500/15 text-slate-400 ring-slate-500/30",
    Suspended:
      "bg-red-500/15 text-red-400 ring-red-500/30",
  };

  const statusClass =
    statusStyles[accountStatus] || statusStyles.Inactive;

  // Image select hone par
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Image hi honi chahiye
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // 2 MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64Image = reader.result;

      // Preview
      setPreview(base64Image);

      // Parent ko Base64 bhej do
      if (onImageChange) {
        onImageChange(base64Image);
      }
    };

    reader.onerror = () => {
      alert("Failed to read image.");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div className="relative shrink-0">

          <img
            src={
              preview ||
              "https://placehold.co/96x96/1e293b/94a3b8?text=%20"
            }
            alt={fullName || "Profile avatar"}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-600"
          />

          {/* Online dot */}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-800" />

          {/* Camera button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center border-2 border-slate-800"
            title="Change profile picture"
          >
            📷
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* User information */}
        <div>
          <div className="flex items-center flex-wrap gap-2">

            <h1 className="text-lg font-semibold text-slate-100">
              {fullName || "Unnamed User"}
            </h1>

            {adminRole && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                {adminRole}
              </span>
            )}

          </div>

          <p className="text-sm text-slate-400">
            @{username || "username"}
            {designation ? ` · ${designation}` : ""}
          </p>

          <div className="flex items-center gap-3 mt-1.5">

            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${statusClass}`}
            >
              {accountStatus || "Unknown"}
            </span>

            {lastActive && (
              <span className="text-xs text-slate-500">
                Last active {lastActive}
              </span>
            )}

          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <button
        onClick={onEditClick}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-medium transition-colors border border-slate-600"
      >
        Edit profile
      </button>

    </div>
  );
}