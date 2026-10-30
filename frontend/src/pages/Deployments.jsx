import React, { useState, useEffect, useMemo } from "react";
import deploymentService from "../services/deploymentService";
import Badge from "../components/common/Badge";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import ConfirmModal from "../components/common/ConfirmModal";
import RegisterDeploymentModal from "../components/deployments/RegisterDeploymentModal";
import ApiKeyDisplayModal from "../components/deployments/ApiKeyDisplayModal";
import DeploymentDetailModal from "../components/deployments/DeploymentDetailModal";
import { Server, Plus, RefreshCw, Eye, ExternalLink, Filter, AlertCircle, Trash2 } from "lucide-react";

export function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [hostingFilter, setHostingFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [newKeyData, setNewKeyData] = useState(null); // { apiKey, deploymentCode }
  const [deploymentToDelete, setDeploymentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDeployments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await deploymentService.getDeployments();
      setDeployments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load deployments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deploymentToDelete) return;
    setDeleting(true);
    try {
      await deploymentService.deleteDeployment(deploymentToDelete._id);
      setDeploymentToDelete(null);
      if (selectedDeployment?._id === deploymentToDelete._id) {
        setSelectedDeployment(null);
      }
      fetchDeployments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete deployment.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRegisterSuccess = (resultData) => {
    fetchDeployments();
    if (resultData?.apiKey) {
      setNewKeyData({
        apiKey: resultData.apiKey,
        deploymentCode: resultData.deployment?.deploymentCode,
      });
    }
  };

  // Filter & Search
  const filteredDeployments = useMemo(() => {
    return deployments.filter((dep) => {
      const customerName = dep.customerId?.businessName || "";
      const customerCode = dep.customerId?.customerCode || "";

      const matchesSearch =
        !searchTerm.trim() ||
        dep.deploymentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.backendUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.frontendUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.hostingReference?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesHosting =
        hostingFilter === "all" || dep.hostingType === hostingFilter;

      return matchesSearch && matchesHosting;
    });
  }, [deployments, searchTerm, hostingFilter]);

  const totalPages = Math.ceil(filteredDeployments.length / itemsPerPage);
  const paginatedDeployments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeployments.slice(start, start + itemsPerPage);
  }, [filteredDeployments, currentPage]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleHostingFilterChange = (val) => {
    setHostingFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Deployments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registry of active client infrastructure, server endpoints, and credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDeployments}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-zinth-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Deployment</span>
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
            onClick={fetchDeployments}
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
          placeholder="Search by deployment code, customer, URL..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Hosting Type:</span>
          </div>
          <select
            value={hostingFilter}
            onChange={(e) => handleHostingFilterChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          >
            <option value="all">All Hosting Types</option>
            <option value="shared-vps">Shared VPS</option>
            <option value="dedicated-vps">Dedicated VPS</option>
            <option value="managed-platform">Managed Platform</option>
          </select>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : filteredDeployments.length === 0 ? (
          <EmptyState
            icon={Server}
            title="No deployments found"
            description={
              searchTerm || hostingFilter !== "all"
                ? "No deployment matches your search or filter criteria."
                : "No deployments have been registered in the system yet."
            }
            actionLabel={!searchTerm && hostingFilter === "all" ? "Register Deployment" : undefined}
            onAction={!searchTerm && hostingFilter === "all" ? () => setIsRegisterOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Deployment Code</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Frontend URL</th>
                  <th className="py-3 px-4">Backend URL</th>
                  <th className="py-3 px-4">Hosting Type</th>
                  <th className="py-3 px-4">Hosting Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedDeployments.map((dep) => (
                  <tr
                    key={dep._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {dep.deploymentCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {dep.customerId?.businessName || "Unknown Customer"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {dep.customerId?.customerCode || ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {dep.product}
                    </td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate">
                      {dep.frontendUrl ? (
                        <a
                          href={dep.frontendUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinth-600 hover:text-zinth-700 inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span className="truncate">{dep.frontendUrl.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate">
                      <a
                        href={dep.backendUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-slate-800 inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span className="truncate">{dep.backendUrl.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={dep.hostingType} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {dep.hostingReference || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={dep.deploymentStatus || "active"} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedDeployment(dep)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-zinth-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeploymentToDelete(dep)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors"
                          title="Delete Deployment"
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
        {!loading && filteredDeployments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredDeployments.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Register Modal */}
      <RegisterDeploymentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* Single-view Secure API Key Modal */}
      <ApiKeyDisplayModal
        isOpen={Boolean(newKeyData)}
        onClose={() => setNewKeyData(null)}
        apiKey={newKeyData?.apiKey}
        deploymentCode={newKeyData?.deploymentCode}
      />

      {/* Details Modal */}
      <DeploymentDetailModal
        isOpen={Boolean(selectedDeployment)}
        onClose={() => setSelectedDeployment(null)}
        deployment={selectedDeployment}
        onDelete={(dep) => setDeploymentToDelete(dep)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deploymentToDelete)}
        onClose={() => setDeploymentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Deployment?"
        message={`Are you sure you want to delete deployment "${deploymentToDelete?.deploymentCode}"? This will revoke all API keys, remove associated subscriptions, and permanently remove this instance from the registry.`}
        confirmText="Delete Deployment"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}

export default Deployments;

