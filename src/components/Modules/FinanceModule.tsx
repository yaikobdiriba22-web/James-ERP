/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Wallet,
  Plus,
  TrendingUp,
  FileText,
  AlertCircle,
  Percent,
  TrendingDown,
  Activity,
  Award,
} from "lucide-react";
import { ChartOfAccount, JournalEntry, UserRole } from "../../types";

interface FinanceModuleProps {
  chartOfAccounts: ChartOfAccount[];
  journalEntries: JournalEntry[];
  token: string | null;
  onRefreshData: () => void;
  userRole: UserRole;
  darkMode: boolean;
}

export default function FinanceModule({
  chartOfAccounts,
  journalEntries,
  token,
  onRefreshData,
  userRole,
  darkMode,
}: FinanceModuleProps) {
  const [activeTab, setActiveTab] = React.useState<"coa" | "journal" | "budget">("coa");
  const [showJEForm, setShowJEForm] = React.useState(false);
  const [jeDescription, setJeDescription] = React.useState("");
  const [jeReference, setJeReference] = React.useState("");
  const [jeDate, setJeDate] = React.useState("");
  const [jeStatusMsg, setJeStatusMsg] = React.useState("");

  // Journal Items Rows: default with two lines
  const [jeRows, setJeRows] = React.useState([
    { accountId: chartOfAccounts[0]?.id || "", debit: "0", credit: "0" },
    { accountId: chartOfAccounts[1]?.id || "", debit: "0", credit: "0" },
  ]);

  const addRow = () => {
    setJeRows((prev) => [...prev, { accountId: chartOfAccounts[0]?.id || "", debit: "0", credit: "0" }]);
  };

  const removeRow = (idx: number) => {
    if (jeRows.length <= 2) return;
    setJeRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: string, val: string) => {
    setJeRows((prev) =>
      prev.map((row, i) => {
        if (i === idx) {
          return { ...row, [field]: val };
        }
        return row;
      })
    );
  };

  // Compute live Debit/Credit totals for validation
  const totalDebits = jeRows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0);
  const totalCredits = jeRows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Submit Journal Entry
  const handleJESubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jeDescription.trim()) {
      setJeStatusMsg("Please write a transaction description.");
      return;
    }
    if (!isBalanced) {
      setJeStatusMsg(`Unbalanced Entry! Debits (${totalDebits} ETB) must equal Credits (${totalCredits} ETB).`);
      return;
    }

    try {
      // Map rows with account names
      const formattedItems = jeRows.map((r) => {
        const acc = chartOfAccounts.find((c) => c.id === r.accountId);
        return {
          accountId: r.accountId,
          accountName: acc ? acc.name : "Unknown Account",
          debit: parseFloat(r.debit) || 0,
          credit: parseFloat(r.credit) || 0,
        };
      });

      const res = await fetch("/api/erp/finance/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: jeDescription,
          reference: jeReference,
          date: jeDate || new Date().toISOString().split("T")[0],
          items: formattedItems,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setJeStatusMsg("Journal entry posted and Ledger balances updated!");
        onRefreshData();
        setTimeout(() => {
          setShowJEForm(false);
          setJeDescription("");
          setJeReference("");
          setJeDate("");
          setJeRows([
            { accountId: chartOfAccounts[0]?.id || "", debit: "0", credit: "0" },
            { accountId: chartOfAccounts[1]?.id || "", debit: "0", credit: "0" },
          ]);
          setJeStatusMsg("");
        }, 2000);
      } else {
        setJeStatusMsg(data.error || "Failed to post entry.");
      }
    } catch (err) {
      setJeStatusMsg("Network error posting journal entry.");
    }
  };

  // Static budget mock calculations
  const budgetLimits = [
    { department: "Logistics Operations", allocated: 500000, spent: 345000 },
    { department: "Sales & Marketing", allocated: 1200000, spent: 950000 },
    { department: "Production & QC", allocated: 800000, spent: 780000 },
    { department: "Human Resources", allocated: 250000, spent: 120000 },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet size={22} className="text-blue-500" /> Finance & Corporate Ledger
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Analyze Chart of Accounts, post standard double-entry journal logs, and check budget lines.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border dark:border-slate-800/80 shrink-0">
          {[
            { id: "coa", label: "Chart of Accounts", icon: Wallet },
            { id: "journal", label: "General Ledger", icon: FileText },
            { id: "budget", label: "Budget allocations", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon size={12} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CHART OF ACCOUNTS */}
      {activeTab === "coa" && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {["Asset", "Liability", "Equity", "Revenue"].map((cat) => {
              const matches = chartOfAccounts.filter((c) => c.category === cat);
              const totalBal = matches.reduce((sum, c) => sum + Math.abs(c.balance), 0);
              return (
                <div key={cat} className={`p-4 rounded-xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Total {cat}s
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-slate-800 dark:text-white">
                    {totalBal.toLocaleString("en-US", { style: "currency", currency: "ETB", maximumFractionDigits: 0 })}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono font-medium">{matches.length} Accounts Ledger</span>
                </div>
              );
            })}
          </div>

          {/* Accounts List Table */}
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">Account Code</th>
                  <th className="p-3">Account Name</th>
                  <th className="p-3">Category Classification</th>
                  <th className="p-3 text-right">Active Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chartOfAccounts.map((coa) => (
                  <tr key={coa.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{coa.code}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{coa.name}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        coa.category === "Asset"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : coa.category === "Liability"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : coa.category === "Revenue"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                          : coa.category === "Expense"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {coa.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {Math.abs(coa.balance).toLocaleString("en-US", { style: "currency", currency: "ETB" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL LEDGER (JOURNAL ENTRIES) */}
      {activeTab === "journal" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              General Ledger Journal Postings
            </h3>
            <button
              onClick={() => setShowJEForm(!showJEForm)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/10 transition-colors"
            >
              <Plus size={13} />
              <span>Post New Journal Entry</span>
            </button>
          </div>

          {/* New JE Form popup */}
          {showJEForm && (
            <form onSubmit={handleJESubmit} className={`p-5 rounded-2xl border animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4 font-display">New Journal Entry</h4>
              <div className="space-y-4 text-xs">
                {/* Info row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Description / Narration</label>
                    <input
                      type="text"
                      required
                      value={jeDescription}
                      onChange={(e) => setJeDescription(e.target.value)}
                      placeholder="Settle lease / purchase inventory..."
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Reference ID</label>
                    <input
                      type="text"
                      value={jeReference}
                      onChange={(e) => setJeReference(e.target.value)}
                      placeholder="REF-..."
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Posting Date</label>
                    <input
                      type="date"
                      value={jeDate}
                      onChange={(e) => setJeDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Rows items */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Accounting Lines</span>
                  {jeRows.map((row, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 items-center">
                      <select
                        value={row.accountId}
                        onChange={(e) => updateRow(i, "accountId", e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none w-full"
                      >
                        {chartOfAccounts.map((coa) => (
                          <option key={coa.id} value={coa.id}>
                            {coa.code} - {coa.name} ({coa.category})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Debit"
                            value={row.debit}
                            onChange={(e) => updateRow(i, "debit", e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Credit"
                            value={row.credit}
                            onChange={(e) => updateRow(i, "credit", e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          disabled={jeRows.length <= 2}
                          className="px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-md disabled:opacity-30"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 font-mono flex items-center gap-1"
                  >
                    + Add Accounting Line Row
                  </button>
                </div>

                {/* Validation and submission row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-800 pt-3 gap-2">
                  <div className="text-[11px] font-mono font-medium">
                    <p className={isBalanced ? "text-emerald-500" : "text-amber-500"}>
                      Debits: {totalDebits.toLocaleString()} ETB | Credits: {totalCredits.toLocaleString()} ETB
                    </p>
                    {!isBalanced && (
                      <span className="text-[10px] text-red-500 block mt-0.5 font-sans leading-none font-semibold">
                        ❌ Ledger is unbalanced by {Math.abs(totalDebits - totalCredits).toLocaleString()} ETB
                      </span>
                    )}
                  </div>
                  {jeStatusMsg && (
                    <p className="text-[10px] font-semibold text-cyan-400 font-mono flex items-center gap-1 shrink-0">
                      <AlertCircle size={10} /> {jeStatusMsg}
                    </p>
                  )}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={!isBalanced}
                      className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg"
                    >
                      Post Ledger
                    </button>
                    <button type="button" onClick={() => setShowJEForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* JE List */}
          <div className="space-y-4">
            {journalEntries.map((je) => (
              <div
                key={je.id}
                className={`p-4 rounded-xl border ${
                  darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                {/* JE Header */}
                <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800/60 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {je.description}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      JE ID: {je.id} | Date: {je.date} | Ref: {je.reference || "None"}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    {je.status}
                  </span>
                </div>

                {/* JE Accounting Items */}
                <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/30 text-[11px]">
                  {je.items.map((item, i) => (
                    <div key={i} className="py-2 flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <div className="min-w-0">
                        <span className="font-mono font-bold">{item.accountId}</span>
                        <span className="ml-2 font-medium">{item.accountName}</span>
                      </div>
                      <div className="flex font-mono font-bold text-right gap-6">
                        <span className="w-20 text-slate-800 dark:text-slate-200">
                          {item.debit > 0 ? `${item.debit.toLocaleString()} D` : "--"}
                        </span>
                        <span className="w-20 text-slate-500">
                          {item.credit > 0 ? `${item.credit.toLocaleString()} C` : "--"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUDGETS & PROGRESS */}
      {activeTab === "budget" && (
        <div className="space-y-4 animate-fade-in">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              Departmental Budget Allocations (2026 Fiscal Year)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Live tracking of committed expenses vs allocated limits
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgetLimits.map((b, i) => {
              const percentage = (b.spent / b.allocated) * 100;
              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs pb-2">
                    <span className="font-bold">{b.department}</span>
                    <span className="font-mono font-bold text-slate-400">
                      {percentage.toFixed(0)}% Used
                    </span>
                  </div>

                  {/* Range bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>

                  {/* Balances details */}
                  <div className="flex justify-between items-center text-[10px] font-mono mt-3 text-slate-400 font-semibold">
                    <span>Spent: {b.spent.toLocaleString()} ETB</span>
                    <span>Budget: {b.allocated.toLocaleString()} ETB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
