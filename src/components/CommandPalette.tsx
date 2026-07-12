/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, FolderKanban, Users, Wallet, Package, ShoppingCart, TrendingUp, HardDrive, LifeBuoy, BarChart3, Settings, LayoutDashboard, CornerDownLeft } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentModule: (mod: string) => void;
  darkMode: boolean;
}

export default function CommandPalette({
  isOpen,
  onClose,
  setCurrentModule,
  darkMode,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      };
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { id: "dashboard", label: "Go to Executive Dashboard", category: "Navigation", icon: LayoutDashboard },
    { id: "hr", label: "Go to Human Resources (Employees, Leave, Attendance)", category: "Navigation", icon: Users },
    { id: "finance", label: "Go to Finance (Chart of Accounts, Ledger, VAT)", category: "Navigation", icon: Wallet },
    { id: "inventory", label: "Go to Inventory & Warehouses (Product Catalog)", category: "Navigation", icon: Package },
    { id: "purchase", label: "Go to Purchase & Suppliers (Procurement)", category: "Navigation", icon: ShoppingCart },
    { id: "sales", label: "Go to Sales & CRM (Leads, Telebirr checkout)", category: "Navigation", icon: TrendingUp },
    { id: "projects", label: "Go to Projects & Kanban Tasks", category: "Navigation", icon: FolderKanban },
    { id: "assets", label: "Go to Company Assets Depreciation Tracker", category: "Navigation", icon: HardDrive },
    { id: "helpdesk", label: "Go to Help Desk Tickets & AI Live Chat", category: "Navigation", icon: LifeBuoy },
    { id: "reports", label: "Go to Reports (Audit Trails, Financial Excel export)", category: "Navigation", icon: BarChart3 },
    { id: "settings", label: "Go to System Settings (API keys, VAT controls)", category: "Navigation", icon: Settings },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border font-sans ${
          darkMode
            ? "bg-slate-900 border-slate-800 text-slate-200"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/20">
          <Search className="text-slate-400" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a module name or command to launch..."
            className="flex-1 bg-transparent border-none text-sm outline-none focus:ring-0 placeholder-slate-400 text-slate-800 dark:text-slate-100"
          />
          <button
            onClick={onClose}
            className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:opacity-80 transition-opacity"
          >
            ESC
          </button>
        </div>

        {/* Action Lists */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No matching commands or modules found.
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    setCurrentModule(cmd.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left text-xs font-medium transition-colors ${
                    darkMode
                      ? "hover:bg-slate-800 text-slate-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 dark:text-cyan-400">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p>{cmd.label}</p>
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                        {cmd.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 text-slate-400 text-[10px] font-mono">
                    <span>LAUNCH</span>
                    <CornerDownLeft size={10} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
