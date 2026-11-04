import React from "react";
import { Check, X } from "lucide-react";

const LIMIT_LABELS = {
  maxPitches: "Pitches",
  maxStaff: "Staff",
  maxAdmins: "Admins",
};

const FEATURE_LABELS = {
  bookingPWA: "Booking PWA",
  onlinePayments: "Online payments",
  manualBookings: "Manual bookings",
  calendarManagement: "Calendar management",
  basicAnalytics: "Basic analytics",
  coupons: "Coupons",
  advancedAnalytics: "Advanced analytics",
  leaderboards: "Leaderboards",
  pitchWiseReports: "Pitch-wise reports",
  staffManagement: "Staff management",
  roleBasedAccess: "Role-based access",
  financialExports: "Financial exports",
};

const humanize = (key) =>
  FEATURE_LABELS[key] ||
  LIMIT_LABELS[key] ||
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export function PlanEntitlements({ plan }) {
  if (!plan) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(plan.limits || {}).map(([key, value]) => (
          <div
            key={key}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center"
          >
            <span className="block text-base font-bold text-slate-900">{value}</span>
            <span className="block text-[11px] text-slate-500">{humanize(key)}</span>
          </div>
        ))}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
        {Object.entries(plan.features || {}).map(([key, enabled]) => (
          <li
            key={key}
            className={`flex items-center gap-1.5 text-xs ${
              enabled ? "text-slate-700" : "text-slate-400 line-through"
            }`}
          >
            {enabled ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            {humanize(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlanEntitlements;
