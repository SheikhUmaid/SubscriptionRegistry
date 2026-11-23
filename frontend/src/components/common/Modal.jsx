import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-3 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl bg-white text-left shadow-lift ring-1 ring-slate-900/5 animate-pop-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold leading-tight text-slate-900">{title}</h3>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
