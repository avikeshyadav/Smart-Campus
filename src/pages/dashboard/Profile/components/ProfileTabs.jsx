import React from "react";

/**
 * ProfileTabs
 * Simple tab bar. Recommended tabs: Overview, Security, Access & Roles,
 * Preferences, Activity Log.
 *
 * Props:
 *  - tabs: string[]
 *  - activeTab: string
 *  - onChange: (tab: string) => void
 */
export default function ProfileTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 border-b border-slate-700 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "border-indigo-500 text-slate-100"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
