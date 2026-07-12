/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Package,
  ShoppingCart,
  TrendingUp,
  FolderKanban,
  HardDrive,
  LifeBuoy,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  GitBranch,
} from "lucide-react";
import { Company, Branch, User, isModuleAllowed } from "../types";

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (mod: string) => void;
  companies: Company[];
  branches: Branch[];
  currentCompany: Company;
  setCurrentCompany: (comp: Company) => void;
  currentBranch: Branch;
  setCurrentBranch: (br: Branch) => void;
  user: User | null;
  darkMode: boolean;
}

export default function Sidebar({
  currentModule,
  setCurrentModule,
  companies,
  branches,
  currentCompany,
  setCurrentCompany,
  currentBranch,
  setCurrentBranch,
  user,
  darkMode,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const allModules = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "hr", label: "Human Resources", icon: Users },
    { id: "finance", label: "Finance & Ledger", icon: Wallet },
    { id: "inventory", label: "Inventory & Stock", icon: Package },
    { id: "purchase", label: "Purchase & Procurement", icon: ShoppingCart },
    { id: "sales", label: "Sales & CRM", icon: TrendingUp },
    { id: "projects", label: "Projects & Tasks", icon: FolderKanban },
    { id: "assets", label: "Corporate Assets", icon: HardDrive },
    { id: "helpdesk", label: "Help Desk", icon: LifeBuoy },
    { id: "reports", label: "Reports & Audits", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const modules = allModules.filter((m) => {
    if (!user) return true;
    return isModuleAllowed(user.role, m.id);
  });

  // Filter branches for selected company
  const filteredBranches = branches.filter((b) => b.companyId === currentCompany.id);

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col sticky top-0 shrink-0 z-20 bg-[#0F172A] border-r border-white/10 text-white"
    >
      {/* Sidebar Header Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-[#2563EB]/40 text-white">
              J
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-none tracking-tight text-white uppercase">
                James ERP
              </h1>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-1 block">
                Enterprise Core
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-[#2563EB]/40 text-white mx-auto">
            J
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Multi-Company / Branch Selectors */}
      {!isCollapsed && (
        <div className="p-4 border-b border-white/10 bg-white/5 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 flex items-center gap-1.5 font-mono">
              <Building2 size={10} className="text-[#2563EB]" /> Company
            </label>
            <select
              value={currentCompany.id}
              onChange={(e) => {
                const found = companies.find((c) => c.id === e.target.value);
                if (found) {
                  setCurrentCompany(found);
                  // Auto set first branch
                  const bList = branches.filter((b) => b.companyId === found.id);
                  if (bList.length > 0) setCurrentBranch(bList[0]);
                }
              }}
              className="w-full bg-[#1E293B] border border-white/10 text-xs text-white rounded-lg p-2 focus:border-[#2563EB] focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0F172A] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 flex items-center gap-1.5 font-mono">
              <GitBranch size={10} className="text-[#06B6D4]" /> Branch Location
            </label>
            <select
              value={currentBranch.id}
              onChange={(e) => {
                const found = branches.find((b) => b.id === e.target.value);
                if (found) setCurrentBranch(found);
              }}
              className="w-full bg-[#1E293B] border border-white/10 text-xs text-white rounded-lg p-2 focus:border-[#2563EB] focus:outline-none"
            >
              {filteredBranches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#0F172A] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {!isCollapsed && (
          <span className="px-3 mb-2 block text-[10px] font-bold tracking-widest text-white/30 uppercase font-mono">
            Main Modules
          </span>
        )}
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = currentModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setCurrentModule(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white opacity-100" : "opacity-80"} />
              {!isCollapsed && <span className="truncate">{m.label}</span>}
            </button>
          );
        })}
      </div>

      {/* User Information Profile Footer */}
      {user && (() => {
        const norm = (user.role || "").toLowerCase();
        let roleColor = "ring-blue-500/80";
        let avatarBg = "bg-gradient-to-tr from-blue-600 to-cyan-500";
        let badgeStyle = "text-blue-400 bg-blue-500/10 border-blue-500/20";
        let roleLabel: string = user.role;

        if (norm.includes("ceo") || norm.includes("admin")) {
          roleColor = "ring-amber-500/80";
          avatarBg = "bg-gradient-to-tr from-amber-600 to-yellow-500";
          badgeStyle = "text-amber-400 bg-amber-500/10 border-amber-500/20";
          roleLabel = "CEO & Administrator";
        } else if (norm.includes("hr") || norm.includes("human")) {
          roleColor = "ring-purple-500/80";
          avatarBg = "bg-gradient-to-tr from-purple-600 to-indigo-500";
          badgeStyle = "text-purple-400 bg-purple-500/10 border-purple-500/20";
          roleLabel = "Human Resources Manager";
        } else if (norm.includes("accountant") || norm.includes("accounting") || norm.includes("finance")) {
          roleColor = "ring-emerald-500/80";
          avatarBg = "bg-gradient-to-tr from-emerald-600 to-teal-500";
          badgeStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          roleLabel = "Chief Accountant";
        }

        return (
          <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-white/5">
            <div className={`h-9 w-9 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-xs ring-2 ring-offset-2 ring-[#0F172A] ${roleColor} shadow-md shrink-0`}>
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold leading-none text-white truncate">{user.name}</h4>
                <p className="text-[9px] text-white/50 font-medium tracking-wide mt-1 truncate uppercase">{roleLabel}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeStyle}`}>AUTHORIZED</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </motion.div>
  );
}
