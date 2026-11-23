import React from "react";

const colorStyles = {
  orange: { icon: "text-zinth-600 bg-zinth-50 ring-zinth-100", bar: "from-zinth-400 to-zinth-600" },
  blue: { icon: "text-blue-600 bg-blue-50 ring-blue-100", bar: "from-blue-400 to-blue-600" },
  emerald: { icon: "text-emerald-600 bg-emerald-50 ring-emerald-100", bar: "from-emerald-400 to-emerald-600" },
  rose: { icon: "text-rose-600 bg-rose-50 ring-rose-100", bar: "from-rose-400 to-rose-600" },
  slate: { icon: "text-slate-600 bg-slate-100 ring-slate-200", bar: "from-slate-400 to-slate-600" },
};

export function StatCard({ title, value, icon: Icon, description, trend, color = "orange" }) {
  const styles = colorStyles[color] || colorStyles.orange;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.bar} opacity-80`} />

      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl ring-1 ${styles.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 tabular">
          {value !== undefined && value !== null ? value : "—"}
        </span>
        {trend && <span className="text-xs font-semibold text-emerald-600">{trend}</span>}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">{description}</p>
      )}
    </div>
  );
}

export default StatCard;
