import React from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import { formatDate, formatDateTime, formatCurrency } from "../../utils/formatters";
import { Receipt, Calendar, CreditCard, Building2, Server, User, FileText, Trash2 } from "lucide-react";

export function RenewalDetailModal({ isOpen, onClose, renewal, onDelete }) {
  if (!renewal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Renewal Payment Record"
      subtitle={`Payment Reference: ${renewal.paymentReference || "N/A"}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Status and Amount Banner */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
              Payment Status
            </span>
            <div className="mt-1">
              <Badge status={renewal.paymentStatus} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
              Total Recorded Amount
            </span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(renewal.amount, renewal.currency)}
            </span>
          </div>
        </div>

        {/* Details breakdown */}
        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="pt-2 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Customer</span>
              <span className="font-semibold text-slate-800">
                {renewal.customerId?.businessName || "Unknown Customer"}{" "}
                <span className="text-xs font-mono text-slate-400">
                  ({renewal.customerId?.customerCode || "—"})
                </span>
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Server className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Target Deployment</span>
              <span className="font-mono text-xs font-medium text-slate-800">
                {renewal.deploymentId?.deploymentCode || "—"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Payment Method</span>
              <span className="capitalize font-medium text-slate-800">
                {renewal.paymentMethod || "UPI"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Receipt className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Reference / Transaction ID</span>
              <span className="font-mono text-xs font-semibold text-slate-900 select-all">
                {renewal.paymentReference || "—"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Validity Billing Period</span>
              <span className="text-xs text-slate-700">
                {formatDate(renewal.periodStartsAt)} &rarr; {formatDate(renewal.periodEndsAt)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Recorded Date & Staff</span>
              <span className="text-xs text-slate-700">
                {formatDateTime(renewal.createdAt)} by{" "}
                <span className="font-mono text-slate-900 font-medium">
                  {renewal.recordedBy || "admin"}
                </span>
              </span>
            </div>
          </div>

          {renewal.notes && (
            <div className="pt-2 flex items-start gap-3">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-slate-500 block">Admin Notes</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                  {renewal.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(renewal);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
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

export default RenewalDetailModal;

