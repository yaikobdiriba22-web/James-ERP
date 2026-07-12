/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LifeBuoy,
  Plus,
  Bot,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Ticket } from "../../types";

interface HelpDeskModuleProps {
  tickets: Ticket[];
  token: string | null;
  onRefreshData: () => void;
  darkMode: boolean;
}

export default function HelpDeskModule({
  tickets,
  token,
  onRefreshData,
  darkMode,
}: HelpDeskModuleProps) {
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(tickets[0] || null);
  const [showAddTicket, setShowAddTicket] = React.useState(false);

  // States for Add Ticket Form
  const [ticketSubject, setTicketSubject] = React.useState("");
  const [ticketCustomer, setTicketCustomer] = React.useState("");
  const [ticketCategory, setTicketCategory] = React.useState("Billing & Checkout");
  const [ticketDesc, setTicketDesc] = React.useState("");
  const [ticketPriority, setTicketPriority] = React.useState<"Low" | "Medium" | "High">("Medium");
  const [ticketStatusMsg, setTicketStatusMsg] = React.useState("");

  // States for AI Auto Reply
  const [aiResponse, setAiResponse] = React.useState("");
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  // Submit Ticket
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketCustomer || !ticketDesc) {
      setTicketStatusMsg("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/erp/helpdesk/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: ticketSubject,
          customerName: ticketCustomer,
          category: ticketCategory,
          description: ticketDesc,
          priority: ticketPriority,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTicketStatusMsg("Support ticket registered in ticketing system!");
        onRefreshData();
        setTimeout(() => {
          setShowAddTicket(false);
          setTicketSubject("");
          setTicketCustomer("");
          setTicketDesc("");
          setTicketStatusMsg("");
        }, 1500);
      } else {
        setTicketStatusMsg(data.error || "Failed to log ticket.");
      }
    } catch (err) {
      setTicketStatusMsg("Network error logging ticket.");
    }
  };

  // Trigger Gemini AI resolution plan
  const handleTriggerAIResolution = async (ticket: Ticket) => {
    setIsAiLoading(true);
    setAiResponse("");

    try {
      const prompt = `You are the Support Team Lead for James ERP. Solve this customer ticket:
Subject: ${ticket.subject}
Customer: ${ticket.customerName}
Category: ${ticket.category}
Problem Description: ${ticket.description}
Priority: ${ticket.priority}

Draft a highly professional, polite email response resolving their issue or outline the concrete internal logistics/ERP adjustments steps needed to handle it. Be concise, objective, and helpful.`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setAiResponse(data.text || "AI Agent suggested: Please schedule a telephone review with the customer regarding accounting postings.");
    } catch (err) {
      setAiResponse("SLA Auto Assistant failed: Check settings to verify your GEMINI_API_KEY environment variables are declared correctly.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Resolve Ticket status on-the-fly
  const handleMarkResolved = async (ticketId: string) => {
    try {
      const res = await fetch("/api/erp/helpdesk/ticket/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId }),
      });

      if (res.ok) {
        onRefreshData();
        // Update selected local reference
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev) => prev ? { ...prev, status: "Resolved" } : null);
        }
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy size={22} className="text-blue-500" /> Help Desk & SLA Support
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Resolve customer queries, track resolution deadlines, and leverage AI Auto-Resolution agents.
          </p>
        </div>
        <button
          onClick={() => setShowAddTicket(!showAddTicket)}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
        >
          + Log Support Ticket
        </button>
      </div>

      {/* Add Ticket Form popup */}
      {showAddTicket && (
        <form onSubmit={handleTicketSubmit} className={`p-4 rounded-xl border max-w-md animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Register Support Ticket</h4>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Ticket Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Telebirr refund delay"
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Customer Name</label>
                <input
                  type="text"
                  required
                  value={ticketCustomer}
                  onChange={(e) => setTicketCustomer(e.target.value)}
                  placeholder="e.g. BGI Ethiopia PLC"
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                >
                  <option value="Billing & Checkout">Billing & Checkout</option>
                  <option value="Sourcing & Logistics">Sourcing & Logistics</option>
                  <option value="IT Access Controls">IT Access Controls</option>
                  <option value="Employee Benefits">Employee Benefits</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Severity Priority</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="High">High Blocker</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Problem Description</label>
              <textarea
                required
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Detail customer query..."
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                rows={3}
              />
            </div>

            {ticketStatusMsg && (
              <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                <AlertCircle size={10} /> {ticketStatusMsg}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                Log Ticket
              </button>
              <button type="button" onClick={() => setShowAddTicket(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Support tickets list */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">Customer / Issue</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Priority</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setAiResponse("");
                    }}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer ${
                      selectedTicket?.id === t.id ? "bg-blue-50/30 dark:bg-blue-950/10 font-medium" : ""
                    }`}
                  >
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{t.subject}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Client: {t.customerName}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{t.category}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        t.priority === "High"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : t.priority === "Medium"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        t.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : t.status === "In Progress"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed resolutions + AI help sidebar drawer */}
        <div className="space-y-4">
          {selectedTicket ? (
            <div
              className={`p-5 rounded-2xl border ${
                darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">{selectedTicket.subject}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">Ticket ID: {selectedTicket.id}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                  selectedTicket.status === "Resolved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {selectedTicket.status}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/10 dark:bg-slate-950/40 p-3 rounded-xl border dark:border-slate-850/60 leading-relaxed text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Issue Description</p>
                  <p>{selectedTicket.description}</p>
                </div>

                {/* AI resolutions generation container */}
                {aiResponse && (
                  <div className="bg-gradient-to-r from-blue-600/5 to-cyan-500/5 dark:from-blue-950/20 dark:to-cyan-950/20 p-4 rounded-xl border border-blue-500/15 text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold font-display text-blue-600 dark:text-cyan-400 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                      <Bot size={14} className="animate-pulse" /> AI Agent Resolution Draft
                    </span>
                    <p>{aiResponse}</p>
                  </div>
                )}

                <div className="flex gap-2 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={isAiLoading}
                    onClick={() => handleTriggerAIResolution(selectedTicket)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white p-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    <span>SLA Smart Auto-Reply</span>
                  </button>
                  {selectedTicket.status !== "Resolved" && (
                    <button
                      onClick={() => handleMarkResolved(selectedTicket.id)}
                      className="px-3 bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg flex items-center justify-center"
                      title="Settle ticket as resolved"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-slate-400 text-xs font-semibold text-center">
              Select an ongoing ticket left to initiate auto-replies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
