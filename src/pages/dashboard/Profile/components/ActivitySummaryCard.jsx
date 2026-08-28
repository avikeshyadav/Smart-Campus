import React from "react";
import { InfoCard } from "./InfoCard";

/**
 * ActivitySummaryCard
 * Extra "premium" widgets: profile completion %, security score,
 * and a short list of recent admin actions.
 *
 * Props:
 *  - profileCompletion: number (0-100)
 *  - securityScore: number (0-100)
 *  - recentActions: { label: string, timestamp: string }[]
 */
export default function ActivitySummaryCard({
  profileCompletion = 0,
  securityScore = 0,
  recentActions = [],
}) {
  const scoreColor = (val) =>
    val >= 80 ? "bg-emerald-500" : val >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <InfoCard title="Account health">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Profile completion</span>
            <span>{profileCompletion}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full ${scoreColor(profileCompletion)}`}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Security score</span>
            <span>{securityScore}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full ${scoreColor(securityScore)}`}
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </div>
      </div>

      {recentActions.length > 0 && (
        <div className="pt-3">
          <p className="text-sm text-slate-400 mb-2">Recent admin actions</p>
          <ul className="space-y-1.5">
            {recentActions.slice(0, 5).map((action, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-200">{action.label}</span>
                <span className="text-slate-500 text-xs">
                  {action.timestamp}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </InfoCard>
  );
}
