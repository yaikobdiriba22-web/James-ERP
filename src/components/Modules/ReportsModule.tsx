/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import { AuditLog } from "../../types";

interface ReportsModuleProps {
  auditLogs: AuditLog[];
  darkMode: boolean;
}

export default function ReportsModule({ auditLogs, darkMode }: ReportsModuleProps) {
  const [downloadProgress, setDownloadProgress] = React.useState<"idle" | "compiling" | "completed">("idle");
  const [activeReportType, setActiveReportType] = React.useState<"excel" | "pdf">("excel");

  const handleExportSimulate = (type: "excel" | "pdf") => {
    setActiveReportType(type);
    setDownloadProgress("compiling");
    
    setTimeout(() => {
      setDownloadProgress("completed");
      setTimeout(() => {
        setDownloadProgress("idle");
      }, 2500);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-500" /> Auditing, Logs & Business Reports
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Review full security access logs, trace financial postings, and compile corporate ledger audits.
          </p>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
        {/* Card 1: Excel Ledger Export */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <FileSpreadsheet size={18} />
            </div>
            <h4 className="font-bold text-sm font-display tracking-tight mt-3">Microsoft Excel Spreadsheet (.xlsx)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Downloads a full multi-tab tabular compilation of the corporate Chart of Accounts, supplier catalogs, stock SKUs, employee directories, and sales ledgers.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            {downloadProgress === "compiling" && activeReportType === "excel" ? (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Loader2 size={13} className="animate-spin" />
                <span>Compiling XML structures and compiling balances...</span>
              </div>
            ) : downloadProgress === "completed" && activeReportType === "excel" ? (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold">
                <Check size={13} />
                <span>Ledger_Audit_2026.xlsx successfully compiled and saved.</span>
              </div>
            ) : (
              <button
                onClick={() => handleExportSimulate("excel")}
                className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs font-bold p-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span>Compile & Export xlsx</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2: PDF Statement Compile */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <Printer size={18} />
            </div>
            <h4 className="font-bold text-sm font-display tracking-tight mt-3">Balance Sheet Statement (.pdf)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compiles a premium styled, boardroom-ready, double-sided PDF reporting annual income ratios, operating cash flow charts, and regional tax clearances.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            {downloadProgress === "compiling" && activeReportType === "pdf" ? (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Loader2 size={13} className="animate-spin" />
                <span>Compiling Vector fonts and layouts...</span>
              </div>
            ) : downloadProgress === "completed" && activeReportType === "pdf" ? (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold">
                <Check size={13} />
                <span>Income_Statement_Boardroom.pdf sent to browser printers.</span>
              </div>
            ) : (
              <button
                onClick={() => handleExportSimulate("pdf")}
                className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs font-bold p-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer size={13} />
                <span>Print PDF Statement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log list */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Full System Audit Trail</span>
          </h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold">
            {auditLogs.length} Security Logs
          </span>
        </div>

        <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <th className="p-3">Audit Action</th>
                <th className="p-3">User Profile</th>
                <th className="p-3">Auditing Details</th>
                <th className="p-3 text-center">IP Address</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{log.action}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{log.userName}</td>
                  <td className="p-3 text-slate-500">{log.details}</td>
                  <td className="p-3 text-center font-mono text-[10px] text-slate-400">{log.ipAddress}</td>
                  <td className="p-3 text-right font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString([], { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
