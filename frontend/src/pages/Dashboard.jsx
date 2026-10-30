import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import customerService from "../services/customerService";
import deploymentService from "../services/deploymentService";
import subscriptionService from "../services/subscriptionService";
import renewalService from "../services/renewalService";
import StatCard from "../components/common/StatCard";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { formatDate, formatCurrency, getDaysRemaining } from "../utils/formatters";
import {
  Users,
  Server,
  CreditCard,
  AlertCircle,
  Clock,
  History,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDeployments: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
  });

  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState([]);
  const [recentRenewals, setRecentRenewals] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [customers, deployments, subscriptions, renewals] = await Promise.all([
        customerService.getCustomers(),
        deploymentService.getDeployments(),
        subscriptionService.getSubscriptions(),
        renewalService.getRenewals(),
      ]);

      // Calculate stats
      const activeSubs = subscriptions.filter((s) => s.status === "active").length;
      const expiredSubs = subscriptions.filter((s) => s.status === "expired").length;

      setStats({
        totalCustomers: customers.length,
        totalDeployments: deployments.length,
        activeSubscriptions: activeSubs,
        expiredSubscriptions: expiredSubs,
      });

      // Recent customers (top 5)
      setRecentCustomers(customers.slice(0, 5));

      // Recent deployments (top 5)
      setRecentDeployments(deployments.slice(0, 5));

      // Subscriptions expiring soon (active, sorted by expiresAt ascending)
      const now = new Date().getTime();
      const upcoming = subscriptions
        .filter((s) => s.status === "active")
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
        .slice(0, 5);
      setExpiringSubscriptions(upcoming);

      // Recent renewal activity (top 5)
      setRecentRenewals(renewals.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard overview data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Registry Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry and operational metrics for Zinth Labs client deployments.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-zinth-500" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Statistics Cards */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            color="orange"
            description="Registered client organizations"
          />
          <StatCard
            title="Total Deployments"
            value={stats.totalDeployments}
            icon={Server}
            color="blue"
            description="Provisioned live instances"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={CreditCard}
            color="emerald"
            description="Currently valid licenses"
          />
          <StatCard
            title="Expired Subscriptions"
            value={stats.expiredSubscriptions}
            icon={Clock}
            color="rose"
            description="Lapsed or pending renewal"
          />
        </div>
      )}

      {/* 2x2 Grid of Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Recently Registered Customers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinth-500" />
              <h3 className="text-sm font-bold text-slate-900">Recently Registered Customers</h3>
            </div>
            <Link
              to="/customers"
              className="text-xs font-semibold text-zinth-600 hover:text-zinth-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {recentCustomers.length === 0 ? (
              <EmptyState
                title="No customers registered yet"
                description="Customers will appear here once registered."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCustomers.map((cust) => (
                  <div key={cust._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {cust.businessName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {cust.customerCode} • {cust.contactName}
                      </span>
                    </div>
                    <div className="text-right">
                      <Badge status={cust.accountStatus || "active"} />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {formatDate(cust.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Recently Created Deployments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Deployments</h3>
            </div>
            <Link
              to="/deployments"
              className="text-xs font-semibold text-zinth-600 hover:text-zinth-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {recentDeployments.length === 0 ? (
              <EmptyState
                title="No deployments found"
                description="Provision a deployment to view active server instances."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDeployments.map((dep) => (
                  <div key={dep._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-mono font-semibold text-slate-900 block">
                        {dep.deploymentCode}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {dep.customerId?.businessName || "Client"} • {dep.product}
                      </span>
                    </div>
                    <div className="text-right">
                      <Badge status={dep.hostingType} />
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                        {dep.hostingReference || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Subscriptions Expiring Soon */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">Subscriptions Expiring Soon</h3>
            </div>
            <Link
              to="/subscriptions"
              className="text-xs font-semibold text-zinth-600 hover:text-zinth-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {expiringSubscriptions.length === 0 ? (
              <EmptyState
                title="No imminent expirations"
                description="All active subscriptions currently have healthy validity."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {expiringSubscriptions.map((sub) => {
                  const daysLeft = getDaysRemaining(sub.expiresAt);
                  const isCritical = daysLeft !== null && daysLeft <= 7;

                  return (
                    <div key={sub._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-mono font-semibold text-slate-900 block">
                          {sub.deploymentId?.deploymentCode || "Deployment"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Plan: <span className="capitalize">{sub.planCode}</span> • {formatCurrency(sub.price, sub.currency)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                            isCritical
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {daysLeft < 0 ? "Expired" : `${daysLeft} days left`}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Expires: {formatDate(sub.expiresAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Recent Renewal Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Renewal Activity</h3>
            </div>
            <Link
              to="/renewals"
              className="text-xs font-semibold text-zinth-600 hover:text-zinth-700 flex items-center gap-1"
            >
              <span>Audit Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {recentRenewals.length === 0 ? (
              <EmptyState
                title="No renewal history yet"
                description="Extensions and payments will be logged here."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentRenewals.map((ren) => (
                  <div key={ren._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {ren.customerId?.businessName || "Client"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Ref: {ren.paymentReference || "N/A"} • {ren.paymentMethod?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block">
                        +{formatCurrency(ren.amount, ren.currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDate(ren.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

