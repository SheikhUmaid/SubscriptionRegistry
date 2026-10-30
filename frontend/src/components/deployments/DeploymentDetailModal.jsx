import React from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import { formatDate } from "../../utils/formatters";
import { Server, Globe, ExternalLink, Calendar, Building2, Cpu, ShieldCheck, Trash2 } from "lucide-react";

export function DeploymentDetailModal({ isOpen, onClose, deployment, onDelete }) {
  if (!deployment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deployment Specifications"
      subtitle={`Code: ${deployment.deploymentCode}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Status bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Status:</span>
            <Badge status={deployment.deploymentStatus || "active"} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Hosting:</span>
            <Badge status={deployment.hostingType} />
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="pt-2 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Assigned Customer</span>
              <span className="font-semibold text-slate-800">
                {deployment.customerId?.businessName || "—"}{" "}
                <span className="font-mono text-xs text-slate-500">
                  ({deployment.customerId?.customerCode || "—"})
                </span>
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Cpu className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Product</span>
              <span className="font-medium text-slate-800">{deployment.product}</span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Server className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Backend API URL</span>
              <a
                href={deployment.backendUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinth-600 hover:text-zinth-700 flex items-center gap-1 font-mono text-xs break-all"
              >
                <span>{deployment.backendUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Frontend Web URL</span>
              {deployment.frontendUrl ? (
                <a
                  href={deployment.frontendUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinth-600 hover:text-zinth-700 flex items-center gap-1 font-mono text-xs break-all"
                >
                  <span>{deployment.frontendUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 text-xs">Not configured</span>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Server className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Hosting Reference</span>
              <span className="text-slate-800 text-xs font-mono">
                {deployment.hostingReference || "None specified"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Registered On</span>
              <span className="text-slate-800 text-xs">{formatDate(deployment.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(deployment);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Deployment</span>
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeploymentDetailModal;

