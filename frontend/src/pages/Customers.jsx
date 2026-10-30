import React, { useState, useEffect, useMemo } from "react";
import customerService from "../services/customerService";
import Badge from "../components/common/Badge";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import ConfirmModal from "../components/common/ConfirmModal";
import CreateCustomerModal from "../components/customers/CreateCustomerModal";
import CustomerDetailModal from "../components/customers/CustomerDetailModal";
import { formatDate } from "../utils/formatters";
import { Users, Plus, RefreshCw, Eye, AlertCircle, Filter, Trash2 } from "lucide-react";

export function Customers() {
  const [customers, setCustomers] = useState([]);
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers from registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await customerService.deleteCustomer(customerToDelete._id);
      setCustomerToDelete(null);
      if (selectedCustomer?._id === customerToDelete._id) {
        setSelectedCustomer(null);
      }
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        !searchTerm.trim() ||
        cust.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || cust.accountStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

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
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Customers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client accounts, business contacts, and registration profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCustomers}
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
            <span>Create Customer</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchCustomers}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by code, business name, phone, or email..."
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              searchTerm || statusFilter !== "all"
                ? "No customer matches your search or filter criteria."
                : "No customer records currently exist in the registry."
            }
            actionLabel={!searchTerm && statusFilter === "all" ? "Create Customer" : undefined}
            onAction={!searchTerm && statusFilter === "all" ? () => setIsCreateOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Customer Code</th>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCustomers.map((cust) => (
                  <tr
                    key={cust._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {cust.customerCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {cust.businessName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {cust.contactName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {cust.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {cust.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={cust.accountStatus || "active"} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(cust.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-zinth-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(cust)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors"
                          title="Delete Customer"
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
        {!loading && filteredCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Modals */}
      <CreateCustomerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchCustomers}
      />

      <CustomerDetailModal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onDelete={(cust) => setCustomerToDelete(cust)}
      />

      <ConfirmModal
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer?"
        message={`Are you sure you want to delete "${customerToDelete?.businessName}" (${customerToDelete?.customerCode})? This will permanently remove the customer record and cascade delete any associated deployments, credentials, and subscriptions.`}
        confirmText="Delete Customer"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}

export default Customers;

