import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Menu, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

const pageTitles = {
  "/": "Dashboard",
  "/customers": "Customers",
  "/deployments": "Deployments",
  "/subscriptions": "Subscriptions",
  "/plan-requests": "Plan Requests",
  "/renewals": "Renewal History",
  "/settings": "Settings",
};

export function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = pageTitles[location.pathname] || "Admin Console";
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-10 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-400">Registry</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate">{title}</span>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 pl-1.5 pr-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white font-semibold text-xs">
            {initial}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-800 max-w-[160px] truncate">
            {user?.name || "Admin"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-lift border border-slate-200/80 p-2 z-30 animate-pop-in">
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white font-semibold text-sm">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="mx-3 mb-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinth-50 text-zinth-700 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Master Admin
              </div>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
