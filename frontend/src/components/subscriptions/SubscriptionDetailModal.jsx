import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import PlanEntitlements from "./PlanEntitlements";
import subscriptionService from "../../services/subscriptionService";
import { formatDate, formatCurrency, getDaysRemaining } from "../../utils/formatters";
import { CreditCard, Calendar, Clock, ShieldCheck, Tag, Trash2, Loader2, Layers } from "lucide-react";

export function SubscriptionDetailModal({ isOpen, onClose, subscription, customerName, onDelete, onPlanChanged }) {
  const [plans, setPlans] = useState([]);
  const [newPlanCode, setNewPlanCode] = useState("");
  const [changingPlan, setChangingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPlanError("");
    subscriptionService
      .getPlans()
      .then(setPlans)
      .catch(() => setPlanError("Failed to load plans."));
  }, [isOpen]);

  useEffect(() => {
    setNewPlanCode(subscription?.planCode || "");
  }, [subscription]);

  if (!subscription) return null;

  // Legacy plan codes (e.g. "monthly") are licensed as Basic by the registry.
  const currentPlan =
    plans.find((p) => p.code === subscription.planCode) ||
    plans.find((p) => p.code === "basic");
  const isLegacyPlan =
    plans.length > 0 && !plans.some((p) => p.code === subscription.planCode);

  const handleChangePlan = async () => {
    setChangingPlan(true);
    setPlanError("");
    try {
      const res = await subscriptionService.changePlan(subscription._id, {
        planCode: newPlanCode,
      });
      onPlanChanged?.(res.data);
    } catch (err) {
      setPlanError(err.response?.data?.message || "Failed to change plan.");
    } finally {
      setChangingPlan(false);
    }
  };

  const daysRemaining = getDaysRemaining(subscription.expiresAt);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription Details"
      subtitle={`Deployment: ${subscription.deploymentId?.deploymentCode || "Instance"}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Status:</span>
            <Badge status={subscription.status} />
          </div>
          {isExpiringSoon && (
            <Badge variant="expiring-soon">
              Expiring in {daysRemaining} days
            </Badge>
          )}
        </div>

        {/* Details list */}
        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="pt-2 flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Customer</span>
              <span className="font-semibold text-slate-800">
                {customerName || "—"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Plan</span>
              <span className="font-medium text-slate-800">
                {currentPlan?.name || subscription.planCode}
              </span>
              {isLegacyPlan && (
                <span className="block text-xs text-orange-600">
                  Legacy code "{subscription.planCode}" — licensed as {currentPlan?.name}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Rate / Price</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(subscription.price, subscription.currency)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Layers className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <span className="text-xs text-slate-500 block">
                Licence Entitlements
              </span>
              <PlanEntitlements plan={currentPlan} />
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={newPlanCode}
                  onChange={(e) => setNewPlanCode(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinth-500/20 focus:border-zinth-500"
                >
                  {isLegacyPlan && (
                    <option value={subscription.planCode} disabled>
                      {subscription.planCode} (legacy)
                    </option>
                  )}
                  {plans.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} — {formatCurrency(p.price, p.currency)}/{p.interval}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleChangePlan}
                  disabled={changingPlan || newPlanCode === subscription.planCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinth-500 hover:bg-zinth-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {changingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Change Plan
                </button>
              </div>
              {planError && (
                <p className="text-xs text-rose-600">{planError}</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Valid From (Start Date)</span>
              <span className="text-slate-800 text-xs">
                {formatDate(subscription.startsAt)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Expires On</span>
              <span className="text-slate-800 text-xs font-semibold">
                {formatDate(subscription.expiresAt)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500 block">Days Remaining</span>
              <span
                className={`text-xs font-bold ${
                  daysRemaining < 0
                    ? "text-rose-600"
                    : daysRemaining <= 7
                    ? "text-orange-600"
                    : "text-emerald-600"
                }`}
              >
                {daysRemaining < 0 ? "Expired" : `${daysRemaining} days`}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(subscription);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Subscription</span>
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SubscriptionDetailModal;

