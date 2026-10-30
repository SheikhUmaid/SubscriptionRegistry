import React, { useState } from "react";
import Modal from "../common/Modal";
import { KeyRound, Copy, Check, AlertTriangle, ShieldAlert } from "lucide-react";

export function ApiKeyDisplayModal({ isOpen, onClose, apiKey, deploymentCode }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !apiKey) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure API Key Generated"
      subtitle={`Credentials for deployment ${deploymentCode || ""}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Warning Alert */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block text-amber-900">
              Important: This API key is only shown once!
            </span>
            <p className="text-amber-800 leading-relaxed">
              For security, this key cannot be retrieved again after you close this dialog. It is hashed before storage in the registry database. Please copy and store it securely in the client application's environment configuration immediately.
            </p>
          </div>
        </div>

        {/* API Key Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Generated Live API Key</span>
            <span className="text-[11px] text-slate-400 font-normal">SHA-256 Hashed on Server</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="w-full pl-3 pr-24 py-2.5 font-mono text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-lg select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`absolute right-1.5 px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-zinth-500 hover:bg-zinth-600 text-white shadow-sm"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Deployment can authenticate via Bearer token header.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            I Have Saved This Key
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeyDisplayModal;

