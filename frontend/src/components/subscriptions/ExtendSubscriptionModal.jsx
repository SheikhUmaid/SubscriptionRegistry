import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import subscriptionService from "../../services/subscriptionService";
import { formatDate } from "../../utils/formatters";
import { Loader2, AlertCircle, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

export function ExtendSubscriptionModal({ isOpen, onClose, subscription, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "upi",
    paymentReference: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (subscription) {
      setFormData({
        amount: subscription.price || "",
        paymentMethod: "upi",
        paymentReference: "",
        notes: "",
      });
      setError("");
      setFieldErrors({});
    }
  }, [subscription, isOpen]);

  if (!subscription) return null;

  // Calculate proposed new expiry (+30 days from current expiry or now)
  const now = new Date();
  const currentExpiry = subscription.expiresAt ? new Date(subscription.expiresAt) : now;
  const periodStartsAt = currentExpiry > now ? currentExpiry : now;
  const proposedExpiry = new Date(periodStartsAt);
  proposedExpiry.setDate(proposedExpiry.getDate() + 30);

  const validate = () => {
    const errors = {};
    if (formData.amount === "" || isNaN(formData.amount) || Number(formData.amount) < 0) {
      errors.amount = "A valid renewal amount is required.";
    }
    if (!formData.paymentReference.trim()) {
      errors.paymentReference = "Payment reference / transaction ID is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await subscriptionService.extendSubscription(subscription._id, {
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim(),
        notes: formData.notes.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to extend subscription. Ensure payment reference is unique."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Extend Subscription Validity"
      subtitle={`Deployment: ${subscription.deploymentId?.deploymentCode || "Instance"}`}
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Date progression display */}
      <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Validity Extension (30 Days)
        </span>
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">Current Expiry</span>
            <span className="font-semibold text-slate-800">
              {formatDate(subscription.expiresAt)}
            </span>
          </div>

          <div className="p-1.5 rounded-full bg-orange-100 text-zinth-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-[11px] text-emerald-600 font-medium block">Proposed Expiry</span>
            <span className="font-bold text-emerald-700">
              {formatDate(proposedExpiry)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Renewal Amount ({subscription.currency || "INR"}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                if (fieldErrors.amount) setFieldErrors({ ...fieldErrors, amount: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.amount
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
            {fieldErrors.amount && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            >
              <option value="upi">UPI (GPay, PhonePe, Paytm)</option>
              <option value="bank-transfer">Bank IMPS / NEFT</option>
              <option value="razorpay">Razorpay Gateway</option>
              <option value="cash">Cash Settlement</option>
              <option value="other">Other Method</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Reference / Transaction ID <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. UPI-TXN-9842109841"
            value={formData.paymentReference}
            onChange={(e) => {
              setFormData({ ...formData, paymentReference: e.target.value });
              if (fieldErrors.paymentReference) setFieldErrors({ ...fieldErrors, paymentReference: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.paymentReference
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          />
          {fieldErrors.paymentReference && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.paymentReference}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Administrative Notes
          </label>
          <textarea
            rows="2"
            placeholder="Verified bank statement or invoice reference..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Extending..." : "Confirm Extension"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ExtendSubscriptionModal;

