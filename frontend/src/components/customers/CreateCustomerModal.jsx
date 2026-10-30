import React, { useState } from "react";
import Modal from "../common/Modal";
import customerService from "../../services/customerService";
import { Loader2, AlertCircle } from "lucide-react";

export function CreateCustomerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customerCode: "",
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.customerCode.trim()) {
      errors.customerCode = "Customer code is required.";
    }
    if (!formData.businessName.trim()) {
      errors.businessName = "Business name is required.";
    }
    if (!formData.contactName.trim()) {
      errors.contactName = "Contact name is required.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
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
      await customerService.createCustomer({
        customerCode: formData.customerCode.trim(),
        businessName: formData.businessName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
      });

      // Reset and close
      setFormData({
        customerCode: "",
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create customer. Please check the inputs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer"
      subtitle="Register an independent client account in the central registry."
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
            Customer Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. CUST-TURF-001"
            value={formData.customerCode}
            onChange={(e) => {
              setFormData({ ...formData, customerCode: e.target.value.toUpperCase() });
              if (fieldErrors.customerCode) setFieldErrors({ ...fieldErrors, customerCode: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.customerCode
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          />
          {fieldErrors.customerCode && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.customerCode}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Business / Organization Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Arena Turf Sports Club"
            value={formData.businessName}
            onChange={(e) => {
              setFormData({ ...formData, businessName: e.target.value });
              if (fieldErrors.businessName) setFieldErrors({ ...fieldErrors, businessName: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.businessName
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          />
          {fieldErrors.businessName && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.businessName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Person <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.contactName}
              onChange={(e) => {
                setFormData({ ...formData, contactName: e.target.value });
                if (fieldErrors.contactName) setFieldErrors({ ...fieldErrors, contactName: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.contactName
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
            {fieldErrors.contactName && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.contactName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                fieldErrors.phone
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
              }`}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. contact@arenaturf.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              fieldErrors.email
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                : "border-slate-300 focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
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
            {loading ? "Creating..." : "Create Customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateCustomerModal;

