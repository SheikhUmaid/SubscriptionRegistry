import React from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import { formatDate, formatCurrency, getDaysRemaining } from "../../utils/formatters";
import { CreditCard, Calendar, Clock, AlertTriangle, ShieldCheck, Tag, Trash2 } from "lucide-react";

export function SubscriptionDetailModal({ isOpen, onClose, subscription, customerName, onDelete }) {
  if (!subscription) return null;

  const daysRemaining = getDaysRemaining(subscription.expiresAt);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription Details"
      subtitle={`Deployment: ${subscription.deploymentId?.deploymentCode || "Instance"}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Status:</span>
            <Badge status={subscription.status} />
          </div>
          {isExpiringSoon && (
            <Badge variant="expiring-soon">
              Expiring in {daysRemaining} days
            </Badge>
          )}
        </div>

        {/* Details list */}
        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="pt-2 flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Customer</span>
              <span className="font-semibold text-slate-800">
                {customerName || "—"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Plan Code</span>
              <span className="font-medium text-slate-800 capitalize">
                {subscription.planCode}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Rate / Price</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(subscription.price, subscription.currency)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Valid From (Start Date)</span>
              <span className="text-slate-800 text-xs">
                {formatDate(subscription.startsAt)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Expires On</span>
              <span className="text-slate-800 text-xs font-semibold">
                {formatDate(subscription.expiresAt)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Days Remaining</span>
              <span
                className={`text-xs font-bold ${
                  daysRemaining < 0
                    ? "text-rose-600"
                    : daysRemaining <= 7
                    ? "text-orange-600"
                    : "text-emerald-600"
                }`}
              >
                {daysRemaining < 0 ? "Expired" : `${daysRemaining} days`}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(subscription);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Subscription</span>
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SubscriptionDetailModal;

