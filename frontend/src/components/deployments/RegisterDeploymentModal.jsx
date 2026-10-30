import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import customerService from "../../services/customerService";
import deploymentService from "../../services/deploymentService";
import { Loader2, AlertCircle, Server } from "lucide-react";

export function RegisterDeploymentModal({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [formData, setFormData] = useState({
    deploymentCode: "",
    customerId: "",
    product: "turf-booking",
    frontendUrl: "",
    backendUrl: "",
    hostingType: "shared-vps",
    hostingReference: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch {
      // ignore
    } finally {
      setLoadingCustomers(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.deploymentCode.trim()) {
      errors.deploymentCode = "Deployment code is required.";
    }
    if (!formData.customerId) {
      errors.customerId = "Please select a registered customer.";
    }
    if (!formData.backendUrl.trim()) {
      errors.backendUrl = "Backend URL is required.";
    } else if (!/^https?:\/\//i.test(formData.backendUrl.trim())) {
      errors.backendUrl = "Backend URL must start with http:// or https://";
    }

    if (formData.frontendUrl.trim() && !/^https?:\/\//i.test(formData.frontendUrl.trim())) {
      errors.frontendUrl = "Frontend URL must start with http:// or https://";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await deploymentService.createDeployment({
        deploymentCode: formData.deploymentCode.trim().toUpperCase(),
        customerId: formData.customerId,
        product: formData.product.trim() || "turf-booking",
        frontendUrl: formData.frontendUrl.trim() || null,
        backendUrl: formData.backendUrl.trim(),
        hostingType: formData.hostingType,
        hostingReference: formData.hostingReference.trim() || null,
      });

      // Pass result containing apiKey to parent to show ApiKeyDisplayModal
      onSuccess?.(result.data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to register deployment. Please check if customer already has a deployment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Deployment"
      subtitle="Provision a deployed client instance and generate authentication credentials."
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deployment Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. DEP-TURF-MUMBAI-01"
              value={formData.deploymentCode}
              onChange={(e) => {
                setFormData({ ...formData, deploymentCode: e.target.value.toUpperCase() });
                if (fieldErrors.deploymentCode) setFieldErrors({ ...fieldErrors, deploymentCode: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.deploymentCode
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
            {fieldErrors.deploymentCode && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.deploymentCode}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => {
                setFormData({ ...formData, customerId: e.target.value });
                if (fieldErrors.customerId) setFieldErrors({ ...fieldErrors, customerId: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.customerId
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            >
              <option value="">
                {loadingCustomers ? "Loading customers..." : "-- Select Customer --"}
              </option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.businessName} ({c.customerCode})
                </option>
              ))}
            </select>
            {fieldErrors.customerId && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.customerId}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. turf-booking"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hosting Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.hostingType}
              onChange={(e) => setFormData({ ...formData, hostingType: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            >
              <option value="shared-vps">Shared VPS</option>
              <option value="dedicated-vps">Dedicated VPS</option>
              <option value="managed-platform">Managed Platform</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Backend API URL <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            placeholder="https://api.clientdomain.com"
            value={formData.backendUrl}
            onChange={(e) => {
              setFormData({ ...formData, backendUrl: e.target.value });
              if (fieldErrors.backendUrl) setFieldErrors({ ...fieldErrors, backendUrl: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.backendUrl
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          />
          {fieldErrors.backendUrl && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.backendUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Frontend Web URL
          </label>
          <input
            type="url"
            placeholder="https://app.clientdomain.com"
            value={formData.frontendUrl}
            onChange={(e) => {
              setFormData({ ...formData, frontendUrl: e.target.value });
              if (fieldErrors.frontendUrl) setFieldErrors({ ...fieldErrors, frontendUrl: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.frontendUrl
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          />
          {fieldErrors.frontendUrl && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.frontendUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Hosting Reference / Server Identifier
          </label>
          <input
            type="text"
            placeholder="e.g. vps-node-blr-04 (IP: 142.93.xxx.xxx)"
            value={formData.hostingReference}
            onChange={(e) => setFormData({ ...formData, hostingReference: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Registering..." : "Register Deployment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RegisterDeploymentModal;

