/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Send, X, Bot, User, HelpCircle, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  darkMode: boolean;
}

export default function AIChatBot({
  isOpen,
  onClose,
  token,
  darkMode,
}: AIChatBotProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your **James ERP AI Assistant**. I have real-time access to the company's ledger, products catalog, active projects, employee registers, and customer logs.\n\nHow can I help you today? You can type any request or click one of the preset business analytics tools below!",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: textToSend,
          history: chatHistory,
        }),
      });

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.text || "Sorry, I am currently experiencing connection difficulties.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err`,
          role: "assistant",
          content: "Failed to communicate with AI model. Please verify your GEMINI_API_KEY settings or network connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetAnalyticTools = [
    { title: "📊 Business Revenue Analysis", prompt: "Summarize current financial status and analyze the chart of accounts, highlighting where cash flow is flowing." },
    { title: "📈 12-Month Sales Forecast", prompt: "Can you analyze our current sales orders and make a projected sales forecast, listing projected revenues?" },
    { title: "📦 Inventory Stock Reorders", prompt: "Do we have any items near or below reorder points? List our current stock levels and recommend stock transfers." },
    { title: "💼 HR Staff Allocation", prompt: "Provide a quick performance score report and leave status summary of active employees." },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 flex justify-end">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Slide-out Panel */}
      <div
        className={`w-full max-w-md h-screen flex flex-col shadow-2xl border-l animate-slide-left font-sans ${
          darkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-cyan-500/10 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display tracking-tight text-slate-800 dark:text-slate-100">
                James AI Analyst Copilot
              </h3>
              <p className="text-[10px] text-emerald-500 font-medium font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE DATABASE INTEGRATION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/40 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : darkMode
                    ? "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                    : "bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 text-xs font-semibold">
                  U
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start items-center">
              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shrink-0">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium font-mono animate-pulse">
                AI Analyst is examining corporate state ledger...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 space-y-1.5">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono px-1">
            Quick Business Analytics
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {presetAnalyticTools.map((tool, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSend(tool.prompt)}
                className={`p-2 text-left text-[10px] rounded-lg border font-medium leading-tight transition-colors ${
                  darkMode
                    ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tool.title}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(input);
              }}
              disabled={isLoading}
              placeholder="Ask for forecasts, summaries, searches..."
              className={`flex-1 rounded-lg px-3 py-2 text-xs border outline-none focus:ring-1 focus:ring-blue-500 ${
                darkMode
                  ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-slate-400 font-mono">
            <HelpCircle size={10} />
            <span>Supported models: Gemini 3.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
