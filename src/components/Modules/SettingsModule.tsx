/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import {
  Settings,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Lock,
  HelpCircle,
  Sparkles,
  Palette,
  Sun,
  Moon,
} from "lucide-react";

interface SettingsModuleProps {
  token: string | null;
  darkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
}

export default function SettingsModule({ token, darkMode, onToggleDarkMode }: SettingsModuleProps) {
  const [apiKeyStatus, setApiKeyStatus] = React.useState<"loading" | "active" | "missing">("loading");
  const [modelName, setModelName] = React.useState("gemini-3.5-flash");

  React.useEffect(() => {
    // Ping the backend proxy check
    const checkApiKey = async () => {
      try {
        const res = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: "api_key_health_handshake_query" }),
        });
        const data = await res.json();
        if (res.ok && data.text) {
          setApiKeyStatus("active");
        } else {
          setApiKeyStatus("missing");
        }
      } catch (err) {
        setApiKeyStatus("missing");
      }
    };

    checkApiKey();
  }, [token]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings size={22} className="text-blue-500" /> System Settings & Credentials
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Configure regional VAT rates, audit tax TIN coordinates, and review workspace API integrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Left: General settings */}
        <div className="space-y-6">
          {/* Editorial Aesthetic Theme Section */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-500 ease-in-out ${
              darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <h3 className="text-sm font-bold font-display uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-1.5">
              <Palette size={15} className="text-blue-500" /> Editorial Aesthetic Presentation
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed font-serif italic">
              Toggle between highly calibrated, print-journal inspired visual modes designed for corporate clarity and readability.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Editorial Light Theme Card */}
              <button
                onClick={() => onToggleDarkMode(false)}
                className={`group relative p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                  !darkMode
                    ? "border-blue-500 bg-blue-50/25 ring-2 ring-blue-500/15"
                    : "border-slate-800 bg-slate-950/20 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold font-display tracking-tight flex items-center gap-1.5 ${!darkMode ? "text-blue-600" : "text-slate-400 group-hover:text-white"}`}>
                    <Sun size={12} /> Editorial Light
                  </span>
                  {!darkMode && (
                    <motion.div layoutId="activeThemeDot" className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
                {/* Visual miniature */}
                <div className="h-12 rounded-lg bg-[#F8FAFC] border border-slate-200 p-2 flex flex-col justify-between overflow-hidden">
                  <div className="h-1 w-2/3 bg-slate-800 rounded-full" />
                  <div className="space-y-1">
                    <div className="h-0.5 w-full bg-slate-300 rounded-full" />
                    <div className="h-0.5 w-1/2 bg-slate-200 rounded-full" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Crisp off-whites and classic print-inspired slate. Ideal for day reading.
                </p>
              </button>

              {/* Editorial Dark Theme Card */}
              <button
                onClick={() => onToggleDarkMode(true)}
                className={`group relative p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                  darkMode
                    ? "border-blue-500 bg-blue-950/10 ring-2 ring-blue-500/15"
                    : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold font-display tracking-tight flex items-center gap-1.5 ${darkMode ? "text-blue-400" : "text-slate-500 group-hover:text-slate-900"}`}>
                    <Moon size={12} /> Editorial Dark
                  </span>
                  {darkMode && (
                    <motion.div layoutId="activeThemeDot" className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  )}
                </div>
                {/* Visual miniature */}
                <div className="h-12 rounded-lg bg-[#090D16] border border-slate-800 p-2 flex flex-col justify-between overflow-hidden">
                  <div className="h-1 w-2/3 bg-white rounded-full" />
                  <div className="space-y-1">
                    <div className="h-0.5 w-full bg-slate-700 rounded-full" />
                    <div className="h-0.5 w-1/2 bg-slate-800 rounded-full" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Deep modern slate with low-emission glowing nodes. Ideal for dark rooms.
                </p>
              </button>
            </div>
          </div>

          {/* Taxation config */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-500 ease-in-out ${
              darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <h3 className="text-sm font-bold font-display uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-1.5">
              <Percent size={15} className="text-blue-500" /> Regional Taxation Parameters
            </h3>
            <div className="space-y-3.5 text-xs text-slate-500">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Base Corporate TIN</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">TIN-ET-00918237</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Ethiopian VAT percentage</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">15.0 % (Standard Rate)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Base Accounting Currency</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">Ethiopian Birr (ETB)</span>
              </div>
            </div>
          </div>

          {/* SLA Support credentials */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-500 ease-in-out ${
              darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <h3 className="text-sm font-bold font-display uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-1.5">
              <Lock size={15} className="text-cyan-400" /> Security Access Policies
            </h3>
            <div className="space-y-3.5 text-xs text-slate-500">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">RBAC Security Mode</span>
                <span className="font-mono font-bold text-emerald-500">STRICT JWT ROLES</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Token Expiry Lifespan</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">24 Hours Sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Workspace security checklist and validation */}
        <div className="space-y-6">
          <div
            className={`p-5 rounded-2xl border ${
              darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <h3 className="text-sm font-bold font-display uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-1.5">
              <Sparkles size={15} className="text-blue-500 animate-pulse" /> AI Workspace Integration Guard
            </h3>

            {/* Displaying health check status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/25 border dark:border-slate-850/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Gemini SDK Health:</span>
                </div>
                {apiKeyStatus === "loading" ? (
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase animate-pulse">CHECKING SECRETS...</span>
                ) : apiKeyStatus === "active" ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 size={10} /> healthy & active
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide flex items-center gap-1">
                    <ShieldAlert size={10} /> KEY MISCONFIGURED
                  </span>
                )}
              </div>

              {/* Instructions to configure */}
              <div className="text-xs space-y-3 text-slate-500 leading-relaxed text-left">
                <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-cyan-400" /> How to activate the Copilot features:
                </p>
                <p>
                  To secure client transaction records and avoid token exposure, this application operates a **full-stack Express server API proxy** on Port 3000. All Gemini analytical queries are handled server-side.
                </p>
                <p className="font-bold text-slate-700 dark:text-slate-300">Follow these simple configurations:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1.5">
                  <li>Open the built-in **Secrets panel** on the AI Studio UI sidebar.</li>
                  <li>Add a new secret key variable named <strong className="font-mono text-cyan-400 select-all">GEMINI_API_KEY</strong>.</li>
                  <li>Paste your Gemini API key in the value input.</li>
                  <li>Save the secret. The workspace will automatically compile and securely inject it without any code exposures.</li>
                </ol>
                <p className="p-2 rounded bg-slate-100 dark:bg-slate-950/30 text-[10px] font-mono text-slate-400 border dark:border-slate-850/60 leading-normal">
                  NOTE: If a key is missing or misconfigured, the ERP remains 100% functional, and the support helpdesk gracefully falls back to mock analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
