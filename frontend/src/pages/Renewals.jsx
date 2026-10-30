import React, { useState, useEffect, useMemo } from "react";
import renewalService from "../services/renewalService";
import customerService from "../services/customerService";
import deploymentService from "../services/deploymentService";
import Badge from "../components/common/Badge";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import ConfirmModal from "../components/common/ConfirmModal";
import RenewalDetailModal from "../components/renewals/RenewalDetailModal";
import { formatDate, formatCurrency } from "../utils/formatters";
import { History, RefreshCw, Eye, Filter, AlertCircle, Info, Trash2 } from "lucide-react";

export function Renewals() {
  const [renewals, setRenewals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedDeploymentId, setSelectedDeploymentId] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [renewalToDelete, setRenewalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRenewals = async () => {
    setLoading(true);
    setError("");
    try {
      const [renewalsData, custsData, depsData] = await Promise.all([
        renewalService.getRenewals({
          customerId: selectedCustomerId || undefined,
          deploymentId: selectedDeploymentId || undefined,
        }),
        customerService.getCustomers(),
        deploymentService.getDeployments(),
      ]);

      setRenewals(renewalsData);
      setCustomers(custsData);
      setDeployments(depsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load renewal history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, [selectedCustomerId, selectedDeploymentId]);

  const handleDeleteConfirm = async () => {
    if (!renewalToDelete) return;
    setDeleting(true);
    try {
      await renewalService.deleteRenewal(renewalToDelete._id);
      setRenewalToDelete(null);
      if (selectedRenewal?._id === renewalToDelete._id) {
        setSelectedRenewal(null);
      }
      fetchRenewals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete renewal record.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search
  const filteredRenewals = useMemo(() => {
    return renewals.filter((ren) => {
      const custName = ren.customerId?.businessName?.toLowerCase() || "";
      const custCode = ren.customerId?.customerCode?.toLowerCase() || "";
      const depCode = ren.deploymentId?.deploymentCode?.toLowerCase() || "";
      const ref = ren.paymentReference?.toLowerCase() || "";
      const recordedBy = ren.recordedBy?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm.trim() ||
        custName.includes(searchTerm.toLowerCase()) ||
        custCode.includes(searchTerm.toLowerCase()) ||
        depCode.includes(searchTerm.toLowerCase()) ||
        ref.includes(searchTerm.toLowerCase()) ||
        recordedBy.includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || ren.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [renewals, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredRenewals.length / itemsPerPage);
  const paginatedRenewals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRenewals.slice(start, start + itemsPerPage);
  }, [filteredRenewals, currentPage]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleCustomerFilter = (val) => {
    setSelectedCustomerId(val);
    setCurrentPage(1);
  };

  const handleDeploymentFilter = (val) => {
    setSelectedDeploymentId(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Renewal History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of subscription extensions, transaction references, and payment verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRenewals}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-zinth-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Info notice about read-only page */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Renewal entries are immutable audit records generated whenever a subscription extension is confirmed.
        </span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRenewals}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by customer, deployment, reference..."
          className="w-full lg:w-72"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Customer filter */}
          <select
            value={selectedCustomerId}
            onChange={(e) => handleCustomerFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.businessName}
              </option>
            ))}
          </select>

          {/* Deployment filter */}
          <select
            value={selectedDeploymentId}
            onChange={(e) => handleDeploymentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          >
            <option value="">All Deployments</option>
            {deployments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.deploymentCode}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : filteredRenewals.length === 0 ? (
          <EmptyState
            icon={History}
            title="No renewal records found"
            description="No transaction records match your active query or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Deployment</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Recorded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedRenewals.map((ren) => (
                  <tr
                    key={ren._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {ren.customerId?.businessName || "Unknown Customer"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {ren.deploymentId?.deploymentCode || "—"}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">
                      {ren.type}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatCurrency(ren.amount, ren.currency)}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] font-medium text-slate-600">
                      {ren.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-[130px] truncate">
                      {ren.paymentReference || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={ren.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(ren.periodStartsAt)} &rarr; {formatDate(ren.periodEndsAt)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(ren.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedRenewal(ren)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-zinth-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenewalToDelete(ren)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredRenewals.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredRenewals.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      <RenewalDetailModal
        isOpen={Boolean(selectedRenewal)}
        onClose={() => setSelectedRenewal(null)}
        renewal={selectedRenewal}
        onDelete={(ren) => setRenewalToDelete(ren)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(renewalToDelete)}
        onClose={() => setRenewalToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Renewal Record?"
        message={`Are you sure you want to delete payment record "${
          renewalToDelete?.paymentReference || "N/A"
        }"? This will permanently delete this audit record.`}
        confirmText="Delete Record"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}

export default Renewals;

