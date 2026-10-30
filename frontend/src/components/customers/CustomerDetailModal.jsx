import React from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import { formatDate } from "../../utils/formatters";
import { Building2, Mail, Phone, Calendar, UserCheck, Tag, Trash2 } from "lucide-react";

export function CustomerDetailModal({ isOpen, onClose, customer, onDelete }) {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Profile Details"
      subtitle={`Customer Code: ${customer.customerCode}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-xs font-medium text-slate-600">Account Status</span>
          <Badge status={customer.accountStatus || "active"} />
        </div>

        {/* Details List */}
        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="pt-2 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Business Name</span>
              <span className="font-semibold text-slate-800">{customer.businessName}</span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <UserCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Contact Person</span>
              <span className="text-slate-800">{customer.contactName}</span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Email</span>
              <span className="text-slate-800">{customer.email || "—"}</span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Phone</span>
              <span className="text-slate-800">{customer.phone}</span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Internal ID</span>
              <span className="text-xs font-mono text-slate-600">{customer._id}</span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Registered Date</span>
              <span className="text-slate-800">{formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(customer);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Customer</span>
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

export default CustomerDetailModal;

