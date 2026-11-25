import React, { useEffect, useMemo, useState } from "react";
import leadService from "../services/leadService";
import SearchInput from "../components/common/SearchInput";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import ConfirmModal from "../components/common/ConfirmModal";
import Modal from "../components/common/Modal";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { formatDateTime } from "../utils/formatters";
import {
  AlertCircle,
  Building2,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  RefreshCw,
  Trash2,
  UserRoundSearch,
} from "lucide-react";

export const LEAD_STATUSES = [
  { value: "new", label: "New", style: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "contacted", label: "Contacted", style: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "demo-scheduled", label: "Demo scheduled", style: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "converted", label: "Converted", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "closed", label: "Closed", style: "bg-slate-100 text-slate-600 border-slate-200" },
];

const statusMeta = (value) => LEAD_STATUSES.find((s) => s.value === value) || LEAD_STATUSES[0];

const pitchLabel = (p) => (p === "7+" ? "7+" : p || "—");

function StatusPill({ status }) {
  const meta = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${meta.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {meta.label}
    </span>
  );
}

const formatPhone = (p) => {
  const d = String(p || "").replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : p;
};

const waLink = (phone) => `https://wa.me/${String(phone || "").replace(/\D/g, "")}`;

export function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selected, setSelected] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    setError("");
    try {
      setLeads(await leadService.getLeads());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load demo requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const counts = useMemo(() => {
    const c = { all: leads.length };
    LEAD_STATUSES.forEach((s) => (c[s.value] = 0));
    leads.forEach((l) => (c[l.status] = (c[l.status] || 0) + 1));
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesSearch =
        !q ||
        [l.name, l.business, l.city, l.phone, l.message, l.plan]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [leads, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openLead = (lead) => {
    setSelected(lead);
    setNotesDraft(lead.notes || "");
  };

  const applyUpdate = (updated) => {
    setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    setSelected((cur) => (cur && cur._id === updated._id ? updated : cur));
  };

  const changeStatus = async (lead, status) => {
    try {
      applyUpdate(await leadService.updateLead(lead._id, { status }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      applyUpdate(await leadService.updateLead(selected._id, { notes: notesDraft }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await leadService.deleteLead(toDelete._id);
      setLeads((prev) => prev.filter((l) => l._id !== toDelete._id));
      if (selected?._id === toDelete._id) setSelected(null);
      setToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete request.");
    } finally {
      setDeleting(false);
    }
  };

  const filterTabs = [{ value: "all", label: "All" }, ...LEAD_STATUSES];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Demo Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Every demo form submitted on the TurfOS website, newest first.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLeads}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-card disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-zinth-500" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchLeads} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
                <span
                  className={`min-w-[1.5rem] px-1.5 rounded-md text-xs tabular ${
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[tab.value] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <SearchInput
          value={searchTerm}
          onChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          placeholder="Search name, turf, city or phone..."
          className="w-full lg:w-80"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserRoundSearch}
            title={leads.length ? "No requests match" : "No demo requests yet"}
            description={
              leads.length
                ? "Try a different status or search term."
                : "Requests submitted through the TurfOS website demo form will appear here."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="py-3.5 px-5">Contact</th>
                    <th className="py-3.5 px-5">Turf / City</th>
                    <th className="py-3.5 px-5">Pitches</th>
                    <th className="py-3.5 px-5">Plan</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Received</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pageItems.map((lead) => (
                    <tr
                      key={lead._id}
                      className={`hover:bg-slate-50/80 transition-colors ${lead.status === "new" ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <a href={`tel:${lead.phone}`} className="text-xs text-slate-500 hover:text-zinth-600 tabular">
                          {formatPhone(lead.phone)}
                        </a>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-800">{lead.business}</div>
                        <div className="text-xs text-slate-500">{lead.city}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 tabular">{pitchLabel(lead.pitches)}</td>
                      <td className="py-4 px-5 text-slate-600">{lead.plan || "—"}</td>
                      <td className="py-4 px-5">
                        <select
                          value={lead.status}
                          onChange={(e) => changeStatus(lead, e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
                          aria-label={`Status for ${lead.name}`}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(lead.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => openLead(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-zinth-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                            title="Delete request"
                            aria-label={`Delete request from ${lead.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || ""}
        subtitle={selected ? `Received ${formatDateTime(selected.createdAt)}` : ""}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={selected.status} />
              {selected.plan && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinth-50 text-zinth-700 border-zinth-200">
                  {selected.plan} plan
                </span>
              )}
              <span className="text-xs text-slate-400">via {selected.source}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Phone, label: "Phone", value: formatPhone(selected.phone) },
                { icon: Building2, label: "Business / Turf", value: selected.business },
                { icon: MapPin, label: "City", value: selected.city },
                { icon: UserRoundSearch, label: "Pitches", value: pitchLabel(selected.pitches) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Icon className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-sm font-medium text-slate-900 break-words">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <MessageSquareText className="w-4 h-4 text-slate-400" />
                Message
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap p-4 rounded-xl border border-slate-200 bg-white min-h-[3rem]">
                {selected.message || <span className="text-slate-400">No message.</span>}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${selected.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-xl shadow-glow transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <a
                href={waLink(selected.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <div className="grid sm:grid-cols-[200px_1fr] gap-4 pt-5 border-t border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => changeStatus(selected, e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Internal notes</label>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Call outcome, demo date, follow-ups..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={saving || notesDraft === (selected.notes || "")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete demo request"
        message={`Permanently delete the request from ${toDelete?.name} (${toDelete?.business})? This cannot be undone.`}
        confirmText="Delete"
        isDanger
        isLoading={deleting}
      />
    </div>
  );
}

export default Leads;
