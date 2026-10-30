import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Shield, Key, Database, Server, User, CheckCircle2 } from "lucide-react";

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          System Settings & Platform Profile
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configuration parameters and operational security controls for Zinth Labs Registry.
        </p>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-lg bg-orange-50 text-zinth-500 border border-orange-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Admin Account Information</h3>
            <p className="text-xs text-slate-500">Currently authenticated administrator session</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Name</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {user?.name || "System Administrator"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Email Address</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {user?.email || "admin@zinthlabs.com"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Role</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Master Operations Admin
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Session Token</span>
            <span className="font-mono text-[11px] text-slate-600 mt-0.5 block">
              Encrypted Bearer JWT (LocalStorage)
            </span>
          </div>
        </div>
      </div>

      {/* System Architecture Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registry Infrastructure</h3>
            <p className="text-xs text-slate-500">Service topology and cryptographic configurations</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-xs divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-medium">Database Storage</span>
            </div>
            <span className="font-mono text-slate-800">MongoDB Core Database</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-medium">Deployment Key Encryption</span>
            </div>
            <span className="font-mono text-slate-800">SHA-256 One-Way Hashing</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-medium">API Validation Protocol</span>
            </div>
            <span className="font-mono text-slate-800">Bearer Token Header</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

