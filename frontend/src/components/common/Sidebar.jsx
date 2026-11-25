import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Server,
  CreditCard,
  History,
  Settings,
  X,
  Inbox,
  UserRoundSearch,
} from "lucide-react";

const navigationGroups = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [{ name: "Demo Requests", href: "/demo-requests", icon: UserRoundSearch }],
  },
  {
    label: "Registry",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Deployments", href: "/deployments", icon: Server },
      { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "Billing",
    items: [
      { name: "Plan Requests", href: "/plan-requests", icon: Inbox },
      { name: "Renewal History", href: "/renewals", icon: History },
    ],
  },
  {
    label: "System",
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-ink-950 text-slate-300 transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Soft brand glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top_left,rgba(255,94,30,0.18),transparent_65%)]" />

        {/* Brand */}
        <div className="relative flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinth-400 to-zinth-600 text-white font-extrabold text-lg shadow-glow">
              Z
            </div>
            <div className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-white">
                Zinth Labs
              </span>
              <span className="block text-xs font-medium text-slate-400">
                Registry Admin
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-2 text-[11.5px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      end={item.href === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-white/[0.07] text-white"
                            : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-zinth-500" />
                          )}
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                              isActive
                                ? "bg-zinth-500 text-white shadow-glow"
                                : "bg-white/[0.04] text-slate-400 group-hover:text-slate-200"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="relative p-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </span>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-slate-200">All systems live</span>
              <span className="block text-[11.5px] text-slate-500 truncate">Zinth Registry v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
