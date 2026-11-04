import React, { useEffect, useState } from "react";
import planRequestService from "../services/planRequestService";
import Badge from "../components/common/Badge";
import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { AlertCircle, ArrowRight, Check, Inbox, RefreshCw, X } from "lucide-react";

export function PlanRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toApprove, setToApprove] = useState(null);
  const [toReject, setToReject] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [working, setWorking] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      setRequests(await planRequestService.getPlanRequests(statusFilter));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plan requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const run = async (action) => {
    setWorking(true);
    try {
      const res = await action();
      alert(res.message);
      setToApprove(null);
      setToReject(null);
      setRejectNote("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setWorking(false);
    }
  };

  const venueName = (r) => r.deploymentId?.customerId?.businessName || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Plan Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Venues that paid by UPI and asked to renew or switch plan. Check the UPI reference
            in your bank app, then approve.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-zinth-500" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requests"
            description={statusFilter === "pending" ? "No venue is waiting on you." : "Nothing matches this filter."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Plan change</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">UPI reference</th>
                  <th className="py-3 px-4">Sent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 align-top">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{venueName(r)}</div>
                      <div className="font-mono text-slate-500">{r.deploymentId?.deploymentCode}</div>
                      {r.note && <div className="mt-1 text-slate-500 italic">"{r.note}"</div>}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        {r.currentPlanCode || "none"}
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-slate-900">{r.requestedPlanCode}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {r.paymentReference || <span className="font-sans text-slate-400">not given</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDateTime(r.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={r.status} />
                      {r.resolutionNote && (
                        <div className="mt-1 text-slate-500">{r.resolutionNote}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === "pending" && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setToApprove(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setToReject(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(toApprove)}
        onClose={() => setToApprove(null)}
        onConfirm={() => run(() => planRequestService.approve(toApprove._id))}
        title="Approve plan request?"
        message={
          toApprove
            ? `Only approve once you've seen ${formatCurrency(toApprove.amount, toApprove.currency)}${
                toApprove.paymentReference ? ` (ref ${toApprove.paymentReference})` : ""
              } in your account. ${venueName(toApprove)} moves to ${toApprove.requestedPlanCode} and gets 30 more days.`
            : ""
        }
        confirmText="Payment received — approve"
        isLoading={working}
      />

      <ConfirmModal
        isOpen={Boolean(toReject)}
        onClose={() => {
          setToReject(null);
          setRejectNote("");
        }}
        onConfirm={() => run(() => planRequestService.reject(toReject._id, rejectNote))}
        title="Reject plan request?"
        message={
          <span className="block space-y-2">
            <span className="block">The venue will see this reason in their admin panel.</span>
            <input
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Payment not received — please check the UPI reference"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
            />
          </span>
        }
        confirmText="Reject request"
        isDanger={true}
        isLoading={working}
      />
    </div>
  );
}

export default PlanRequests;
