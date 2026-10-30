import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import deploymentService from "../../services/deploymentService";
import subscriptionService from "../../services/subscriptionService";
import { Loader2, AlertCircle } from "lucide-react";

export function CreateSubscriptionModal({ isOpen, onClose, onSuccess }) {
  const [deployments, setDeployments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(false);

  // Default start date = today, expiry date = 30 days from now
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultExpiryStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    deploymentId: "",
    planCode: "monthly",
    startsAt: todayStr,
    expiresAt: defaultExpiryStr,
    price: "",
    currency: "INR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadDeployments();
    }
  }, [isOpen]);

  const loadDeployments = async () => {
    setLoadingDeps(true);
    try {
      const data = await deploymentService.getDeployments();
      setDeployments(data);
    } catch {
      // ignore
    } finally {
      setLoadingDeps(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.deploymentId) {
      errors.deploymentId = "Please select a target deployment.";
    }
    if (!formData.planCode.trim()) {
      errors.planCode = "Plan code is required.";
    }
    if (!formData.startsAt) {
      errors.startsAt = "Start date is required.";
    }
    if (!formData.expiresAt) {
      errors.expiresAt = "Expiry date is required.";
    } else if (new Date(formData.expiresAt) <= new Date(formData.startsAt)) {
      errors.expiresAt = "Expiry date must be after the start date.";
    }
    if (formData.price === "" || isNaN(formData.price) || Number(formData.price) < 0) {
      errors.price = "A valid non-negative price is required.";
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
      await subscriptionService.createSubscription({
        deploymentId: formData.deploymentId,
        planCode: formData.planCode.trim(),
        startsAt: new Date(formData.startsAt),
        expiresAt: new Date(formData.expiresAt),
        price: Number(formData.price),
        currency: formData.currency,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to create subscription. Ensure deployment doesn't already have one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Subscription"
      subtitle="Issue an active billing plan and validity period for a deployment."
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deployment Instance <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.deploymentId}
            onChange={(e) => {
              setFormData({ ...formData, deploymentId: e.target.value });
              if (fieldErrors.deploymentId) setFieldErrors({ ...fieldErrors, deploymentId: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.deploymentId
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          >
            <option value="">
              {loadingDeps ? "Loading deployments..." : "-- Select Deployment --"}
            </option>
            {deployments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.deploymentCode} — {d.customerId?.businessName || "Client"} ({d.product})
              </option>
            ))}
          </select>
          {fieldErrors.deploymentId && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.deploymentId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plan Code <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.planCode}
              onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            >
              <option value="monthly">Monthly Standard</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half Yearly</option>
              <option value="annual">Annual Enterprise</option>
              <option value="custom">Custom Trial / Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startsAt}
              onChange={(e) => {
                setFormData({ ...formData, startsAt: e.target.value });
                if (fieldErrors.startsAt) setFieldErrors({ ...fieldErrors, startsAt: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.startsAt
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
            {fieldErrors.startsAt && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.startsAt}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expiry Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => {
                setFormData({ ...formData, expiresAt: e.target.value });
                if (fieldErrors.expiresAt) setFieldErrors({ ...fieldErrors, expiresAt: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.expiresAt
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
            {fieldErrors.expiresAt && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.expiresAt}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subscription Price <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-400">
              {formData.currency}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5000"
              value={formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: e.target.value });
                if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: "" });
              }}
              className={`w-full pl-12 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.price
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
          </div>
          {fieldErrors.price && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.price}</p>
          )}
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
            {loading ? "Creating..." : "Create Subscription"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateSubscriptionModal;

