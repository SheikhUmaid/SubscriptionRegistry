import React from "react";

export function Badge({ status, variant, children, className = "" }) {
  const getVariantStyles = () => {
    const s = (variant || status || "").toLowerCase();

    switch (s) {
      case "active":
      case "confirmed":
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
      case "expired":
      case "failed":
      case "inactive":
      case "danger":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
      case "suspended":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
      case "pending":
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
      case "shared-vps":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
      case "dedicated-vps":
        return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20";
      case "managed-platform":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20";
      case "expiring-soon":
        return "bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {children || status}
    </span>
  );
}

export default Badge;

