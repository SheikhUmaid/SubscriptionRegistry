import React, { useState, useEffect, useMemo } from "react";
import subscriptionService from "../services/subscriptionService";
import customerService from "../services/customerService";
import Badge from "../components/common/Badge";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import ConfirmModal from "../components/common/ConfirmModal";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import ExtendSubscriptionModal from "../components/subscriptions/ExtendSubscriptionModal";
import SubscriptionDetailModal from "../components/subscriptions/SubscriptionDetailModal";
import { formatDate, formatCurrency, getDaysRemaining } from "../utils/formatters";
import {
  CreditCard,
  Plus,
  RefreshCw,
  Eye,
  CalendarPlus,
  Ban,
  Filter,
  AlertCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";

export function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [subToExtend, setSubToExtend] = useState(null);
  const [subToSuspend, setSubToSuspend] = useState(null);
  const [suspending, setSuspending] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [subsData, custsData] = await Promise.all([
        subscriptionService.getSubscriptions(),
        customerService.getCustomers(),
      ]);

      const map = {};
      custsData.forEach((c) => {
        map[c._id] = c;
      });
      setCustomerMap(map);
      setSubscriptions(subsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCustomerName = (sub) => {
    // If populated on deployment
    if (sub.deploymentId?.customerId?.businessName) {
      return sub.deploymentId.customerId.businessName;
    }
    // If customerId is an ID string
    const custId =
      typeof sub.deploymentId?.customerId === "string"
        ? sub.deploymentId.customerId
        : sub.deploymentId?.customerId?._id;
    if (custId && customerMap[custId]) {
      return customerMap[custId].businessName;
    }
    return "—";
  };

  const handleSuspendConfirm = async () => {
    if (!subToSuspend) return;
    setSuspending(true);
    try {
      await subscriptionService.suspendSubscription(subToSuspend._id);
      setSubToSuspend(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to suspend subscription.");
    } finally {
      setSuspending(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subToDelete) return;
    setDeleting(true);
    try {
      await subscriptionService.deleteSubscription(subToDelete._id);
      setSubToDelete(null);
      if (selectedSub?._id === subToDelete._id) {
        setSelectedSub(null);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete subscription.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const custName = getCustomerName(sub).toLowerCase();
      const depCode = sub.deploymentId?.deploymentCode?.toLowerCase() || "";
      const plan = sub.planCode?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm.trim() ||
        custName.includes(searchTerm.toLowerCase()) ||
        depCode.includes(searchTerm.toLowerCase()) ||
        plan.includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, customerMap, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubscriptions.slice(start, start + itemsPerPage);
  }, [filteredSubscriptions, currentPage]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Subscriptions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client validity, billing cycles, renewals, and active states.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-zinth-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subscription</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by customer, deployment, or plan..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : filteredSubscriptions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No subscriptions found"
            description={
              searchTerm || statusFilter !== "all"
                ? "No subscription matches your search or filter criteria."
                : "No subscriptions have been created yet."
            }
            actionLabel={!searchTerm && statusFilter === "all" ? "Create Subscription" : undefined}
            onAction={!searchTerm && statusFilter === "all" ? () => setIsCreateOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Deployment Code</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedSubscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.expiresAt);
                  const isExpiringSoon =
                    sub.status === "active" &&
                    daysRemaining !== null &&
                    daysRemaining <= 7 &&
                    daysRemaining >= 0;

                  return (
                    <tr
                      key={sub._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpiringSoon ? "bg-orange-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {getCustomerName(sub)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {sub.deploymentId?.deploymentCode || "—"}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">
                        {sub.planCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {formatCurrency(sub.price, sub.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(sub.startsAt)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {formatDate(sub.expiresAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full text-[11px]">
                            <AlertTriangle className="w-3 h-3" />
                            {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                          </span>
                        ) : daysRemaining !== null && daysRemaining < 0 ? (
                          <span className="text-rose-600 font-semibold text-[11px]">
                            Expired
                          </span>
                        ) : daysRemaining !== null ? (
                          <span className="text-slate-600 text-[11px] font-medium">
                            {daysRemaining} days
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={sub.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedSub(sub)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {sub.status !== "suspended" && (
                            <button
                              type="button"
                              onClick={() => setSubToExtend(sub)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zinth-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition-colors"
                              title="Extend Validity"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                              <span>Extend</span>
                            </button>
                          )}

                          {sub.status !== "suspended" && (
                            <button
                              type="button"
                              onClick={() => setSubToSuspend(sub)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                              title="Suspend Subscription"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSubToDelete(sub)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors"
                            title="Delete Subscription"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredSubscriptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredSubscriptions.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Modals */}
      <CreateSubscriptionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchData}
      />

      <ExtendSubscriptionModal
        isOpen={Boolean(subToExtend)}
        onClose={() => setSubToExtend(null)}
        subscription={subToExtend}
        onSuccess={fetchData}
      />

      <SubscriptionDetailModal
        isOpen={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        subscription={selectedSub}
        customerName={selectedSub ? getCustomerName(selectedSub) : ""}
        onDelete={(sub) => setSubToDelete(sub)}
      />

      <ConfirmModal
        isOpen={Boolean(subToSuspend)}
        onClose={() => setSubToSuspend(null)}
        onConfirm={handleSuspendConfirm}
        title="Suspend Subscription?"
        message={`Are you sure you want to suspend the subscription for deployment ${
          subToSuspend?.deploymentId?.deploymentCode || ""
        }? While suspended, renewal extensions are disabled and client verification will reject access.`}
        confirmText="Suspend Subscription"
        isDanger={true}
        isLoading={suspending}
      />

      <ConfirmModal
        isOpen={Boolean(subToDelete)}
        onClose={() => setSubToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subscription?"
        message={`Are you sure you want to delete this subscription for deployment "${
          subToDelete?.deploymentId?.deploymentCode || ""
        }"? This will permanently remove its license and validity period from the registry.`}
        confirmText="Delete Subscription"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}

export default Subscriptions;

