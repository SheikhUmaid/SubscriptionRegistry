import React from "react";
import { FolderOpen, Plus } from "lucide-react";

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "Get started by creating a new entry or clearing your search filters.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-zinth-500/10 blur-xl" />
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 text-slate-400 shadow-card">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-xl shadow-glow transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
