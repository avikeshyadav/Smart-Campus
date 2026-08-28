import React from "react";
import { InfoCard, Row } from "./InfoCard";

/**
 * PreferencesCard
 * Language / timezone / theme / notification toggles.
 *
 * Props:
 *  - data: {
 *      language, timeZone, theme, dateFormat, timeFormat,
 *      emailNotifications, pushNotifications, securityAlerts
 *    }
 *  - onToggle: (key: string, nextValue: bool) => void
 */
export default function PreferencesCard({ data = {}, onToggle }) {
  const {
    language,
    timeZone,
    theme,
    dateFormat,
    timeFormat,
    emailNotifications,
    pushNotifications,
    securityAlerts,
  } = data;

  const toggles = [
    ["emailNotifications", "Email notifications", emailNotifications],
    ["pushNotifications", "Push notifications", pushNotifications],
    ["securityAlerts", "Security alerts", securityAlerts],
  ];

  return (
    <InfoCard title="Preferences">
      <Row label="Language" value={language} />
      <Row label="Time zone" value={timeZone} />
      <Row label="Theme" value={theme} />
      <Row label="Date format" value={dateFormat} />
      <Row label="Time format" value={timeFormat} />

      <div className="pt-2 space-y-2.5">
        {toggles.map(([key, label, enabled]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{label}</span>
            <button
              role="switch"
              aria-checked={!!enabled}
              onClick={() => onToggle && onToggle(key, !enabled)}
              className={`relative w-10 h-[22px] rounded-full transition-colors ${
                enabled ? "bg-indigo-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-[18px]" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </InfoCard>
  );
}
