/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CommandPalette from "./components/CommandPalette";
import AIChatBot from "./components/AIChatBot";

// Modules
import DashboardModule from "./components/Modules/DashboardModule";
import HRModule from "./components/Modules/HRModule";
import FinanceModule from "./components/Modules/FinanceModule";
import InventoryModule from "./components/Modules/InventoryModule";
import PurchaseModule from "./components/Modules/PurchaseModule";
import SalesModule from "./components/Modules/SalesModule";
import ProjectsModule from "./components/Modules/ProjectsModule";
import AssetsModule from "./components/Modules/AssetsModule";
import HelpDeskModule from "./components/Modules/HelpDeskModule";
import ReportsModule from "./components/Modules/ReportsModule";
import SettingsModule from "./components/Modules/SettingsModule";

import {
  User,
  Company,
  Branch,
  Employee,
  ChartOfAccount,
  Product,
  SalesOrder,
  PurchaseOrder,
  Project,
  Task,
  Ticket,
  AuditLog,
  Notification,
  Lead,
  isModuleAllowed,
} from "./types";

export default function App() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [language, setLanguage] = React.useState<"en" | "am" | "om">("en");

  // Authentication States
  const [token, setToken] = React.useState<string | null>(localStorage.getItem("james_erp_token"));
  const [user, setUser] = React.useState<User | null>(null);
  const [authError, setAuthError] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");

  // Navigation / Workspace States
  const [currentModule, setCurrentModule] = React.useState("dashboard");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = React.useState(false);

  // Core Data States
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [currentCompany, setCurrentCompany] = React.useState<Company | null>(null);
  const [currentBranch, setCurrentBranch] = React.useState<Branch | null>(null);

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = React.useState<ChartOfAccount[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = React.useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [crmLeads, setCrmLeads] = React.useState<Lead[]>([]);

  const [isLoadingData, setIsLoadingData] = React.useState(false);

  // Preset accounts list for fast evaluation / sandbox role plays
  const demoAccounts = [
    { name: "Admin Portal", role: "Super Admin", email: "admin@jameserp.com", pass: "admin123" },
    { name: "James Kebede", role: "CEO / Owner", email: "ceo@jameserp.com", pass: "ceo123" },
    { name: "Martha Alazar", role: "HR Officer", email: "hr@jameserp.com", pass: "hr123" },
    { name: "Yohannes Demissie", role: "Accountant", email: "accounting@jameserp.com", pass: "acc123" },
  ];

  // Fetch current logged user profile on mount or token modification
  React.useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setUser(null);
    }
  }, [token]);

  // Auto-redirect if active module is restricted for the logged-in user
  React.useEffect(() => {
    if (user && !isModuleAllowed(user.role, currentModule)) {
      setCurrentModule("dashboard");
    }
  }, [user, currentModule]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/erp/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const d = await res.json();
        setUser(d.user);
        fetchERPData();
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  // Fetch complete ERP state from Express
  const fetchERPData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/erp/data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const d = await res.json();
        setCompanies(d.companies || []);
        setBranches(d.branches || []);
        setEmployees(d.employees || []);
        setChartOfAccounts(d.chartOfAccounts || []);
        setProducts(d.products || []);
        setSalesOrders(d.salesOrders || []);
        setPurchaseOrders(d.purchaseOrders || []);
        setProjects(d.projects || []);
        setTasks(d.tasks || []);
        setTickets(d.tickets || []);
        setAuditLogs(d.auditLogs || []);
        setNotifications(d.notifications || []);
        setCrmLeads(d.crmLeads || []);

        // Auto initialize active contexts
        if (d.companies.length > 0 && !currentCompany) {
          setCurrentCompany(d.companies[0]);
          const whBranches = d.branches.filter((b: Branch) => b.companyId === d.companies[0].id);
          if (whBranches.length > 0) {
            setCurrentBranch(whBranches[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync ERP data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle Authentication submit
  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!emailInput || !passwordInput) {
      setAuthError("Email and password fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("james_erp_token", data.token);
        setToken(data.token);
        setEmailInput("");
        setPasswordInput("");
      } else {
        setAuthError(data.error || "Authentication failed. Validate credentials.");
      }
    } catch (err) {
      setAuthError("Server offline or connection timeout.");
    }
  };

  // Preset Sandbox Login bypass
  const handleDemoBypass = async (email: string, pass: string) => {
    setAuthError("");
    setEmailInput(email);
    setPasswordInput(pass);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("james_erp_token", data.token);
        setToken(data.token);
        setEmailInput("");
        setPasswordInput("");
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError("Network error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("james_erp_token");
    setToken(null);
    setUser(null);
  };

  // Mark notification read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch("/api/erp/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchERPData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render module container based on active currentModule navigation state
  const renderActiveModule = () => {
    if (!currentCompany || !currentBranch || !user) return null;

    if (!isModuleAllowed(user.role, currentModule)) {
      return (
        <div className="py-16 px-4 max-w-lg mx-auto text-center space-y-6 animate-fade-in">
          <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Access Restricted
            </h3>
            <p className="text-sm text-slate-400">
              Your active role <span className="font-mono font-bold text-cyan-400">[{user.role}]</span> is not authorized to access the <span className="font-bold text-slate-200 uppercase">{currentModule}</span> module.
            </p>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
            <p className="text-slate-400 font-medium">Clearance required for this core business node:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">Admin / CEO</span>
              {currentModule === "hr" || currentModule === "projects" || currentModule === "helpdesk" ? (
                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">HR Manager</span>
              ) : null}
              {currentModule === "finance" || currentModule === "assets" || currentModule === "reports" ? (
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Accountant</span>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setCurrentModule("dashboard")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (currentModule) {
      case "dashboard":
        return (
          <DashboardModule
            user={user}
            employees={employees}
            chartOfAccounts={chartOfAccounts}
            products={products}
            salesOrders={salesOrders}
            projects={projects}
            tasks={tasks}
            auditLogs={auditLogs}
            currentCompany={currentCompany}
            darkMode={darkMode}
            language={language}
          />
        );
      case "hr":
        return (
          <HRModule
            employees={employees}
            token={token}
            onRefreshData={fetchERPData}
            userRole={user.role}
            darkMode={darkMode}
          />
        );
      case "finance":
        return (
          <FinanceModule
            chartOfAccounts={chartOfAccounts}
            journalEntries={auditLogs.filter((l) => l.action.toLowerCase().includes("journal") || l.action.toLowerCase().includes("ledger")).map((l) => ({
              id: l.id,
              description: l.details,
              reference: l.ipAddress,
              date: l.timestamp.split("T")[0],
              items: [
                { accountId: "1010", accountName: "Commercial Bank of Ethiopia (CBE) - Operating", debit: 12500, credit: 0 },
                { accountId: "4010", accountName: "Sourcing Cash Expenditures", debit: 0, credit: 12500 }
              ],
              status: "Posted"
            }))}
            token={token}
            onRefreshData={fetchERPData}
            userRole={user.role}
            darkMode={darkMode}
          />
        );
      case "inventory":
        return (
          <InventoryModule
            products={products}
            warehouses={branches.map((b) => ({ id: b.id, name: `${b.name} Warehouse`, address: b.address }))}
            token={token}
            onRefreshData={fetchERPData}
            darkMode={darkMode}
          />
        );
      case "purchase":
        return (
          <PurchaseModule
            purchaseOrders={purchaseOrders}
            suppliers={employees.slice(0, 3).map((emp, idx) => ({
              id: `sup-${idx}`,
              name: idx === 0 ? "BGI Brewery Sourcing PLC" : idx === 1 ? "Horizon Agro Plantation PLC" : "Ethiopian Packaging Factory",
              phone: emp.phone,
              email: emp.email,
              tin: `TIN-SUP-${idx}821`,
              address: emp.departmentId === "agri" ? "Addis Ababa, Bole Subcity" : "Hawassa, Industrial Boulevard",
              productsSupplied: idx === 0 ? ["Raw Coffee Cherry", "Brewing supplies"] : ["Organic Fertilizer", "Nylon Sacks"]
            }))}
            products={products}
            token={token}
            onRefreshData={fetchERPData}
            darkMode={darkMode}
          />
        );
      case "sales":
        return (
          <SalesModule
            salesOrders={salesOrders}
            customers={employees.slice(2, 4).map((emp, idx) => ({
              id: `cust-${idx}`,
              name: idx === 0 ? "Midroc Investment Holdings" : "Desta Agro Industry Corp",
              phone: emp.phone,
              email: emp.email,
              tin: `TIN-CUST-${idx}129`,
              address: "Adama Town, Central Circle"
            }))}
            products={products}
            crmLeads={crmLeads}
            token={token}
            onRefreshData={fetchERPData}
            darkMode={darkMode}
          />
        );
      case "projects":
        return (
          <ProjectsModule
            projects={projects}
            tasks={tasks}
            employees={employees}
            token={token}
            onRefreshData={fetchERPData}
            darkMode={darkMode}
          />
        );
      case "assets":
        return (
          <AssetsModule
            assets={products.slice(0, 3).map((p, idx) => ({
              id: `ast-${idx}`,
              name: idx === 0 ? "Bole HQ Industrial Processing Plant" : idx === 1 ? "Isuzu FSR Cargo Sourcing Freight" : "IT Central Server Grid rack",
              category: idx === 0 ? "MACHINERY" : idx === 1 ? "VEHICLES" : "HARDWARE",
              cost: idx === 0 ? 5400000 : idx === 1 ? 1800000 : 250000,
              salvageValue: idx === 0 ? 400000 : idx === 1 ? 150000 : 20000,
              usefulLife: idx === 0 ? 15 : idx === 1 ? 8 : 5,
              purchaseDate: idx === 0 ? "2024-03-12" : idx === 1 ? "2025-06-18" : "2026-01-10",
              netBookValue: idx === 0 ? 4900000 : idx === 1 ? 1680000 : 230000
            }))}
            token={token}
            onRefreshData={fetchERPData}
            darkMode={darkMode}
          />
        );
      case "helpdesk":
        return (
          <HelpDeskModule
            tickets={tickets}
            token={token}
            onRefreshData={fetchERPData}
            darkMode={darkMode}
          />
        );
      case "reports":
        return (
          <ReportsModule
            auditLogs={auditLogs}
            darkMode={darkMode}
          />
        );
      case "settings":
        return (
          <SettingsModule
            token={token}
            darkMode={darkMode}
            onToggleDarkMode={setDarkMode}
          />
        );
      default:
        return (
          <div className="py-24 text-center text-slate-400 font-semibold">
            Module under construction.
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ease-in-out ${darkMode ? "bg-[#090D16] text-slate-100" : "bg-[#F8FAFC] text-slate-800"}`}>
      {/* 1. GATEWAY: AUTHENTICATION FLOW PORTAL */}
      {!token && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#090D16] relative overflow-hidden">
          {/* Subtle slow animated background effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
              animate={{
                scale: [1, 1.12, 0.95, 1],
                x: [0, 40, -30, 0],
                y: [0, -30, 40, 0],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 0.9, 1.1, 1],
                x: [0, -40, 30, 0],
                y: [0, 30, -40, 0],
              }}
              transition={{
                duration: 26,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl"
            />
            {/* Soft grid overlay */}
            <motion.div
              animate={{
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]"
            />
          </div>

          <div className="w-full max-w-lg glass-dark rounded-3xl p-6 md:p-8 border border-slate-800/60 shadow-2xl relative overflow-hidden flex flex-col justify-between z-10">
            {/* Elegant Top Branding decorative glow */}
            <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-600/10 blur-xl"></div>
            <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-cyan-400/5 blur-xl"></div>

            {/* Editorial Aesthetic Header & Typography */}
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
                  ESTABLISHED MMXV
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                The <span className="italic font-normal text-slate-300">James</span> Ledger
              </h2>
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto"></div>
              <p className="text-xs text-slate-400 font-serif max-w-sm mx-auto leading-relaxed italic">
                Secure executive portal & enterprise control desk for modern holdings.
              </p>
            </div>

            {/* Main Auth Form */}
            <form onSubmit={handleAuthLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider font-semibold">
                  Secure email ID
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g., ceo@jameserp.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider font-semibold">
                  Authentication PIN Code
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {authError && (
                <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                  <AlertCircle size={10} /> {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
              >
                <Lock size={13} />
                <span>Authorize Workspace Session</span>
              </button>
            </form>

            {/* RBAC sandbox profile role plays selectors */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 justify-center">
                <UserCheck size={11} className="text-cyan-400 animate-pulse" />
                <span>Fast bypass: Select Sandbox User Profile</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {demoAccounts.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleDemoBypass(item.email, item.pass)}
                    className="p-2.5 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 text-center transition-all flex flex-col justify-between items-center"
                  >
                    <span className="text-[10px] font-bold text-slate-100 truncate w-full">
                      {item.name.split(" ")[0]}
                    </span>
                    <span className="text-[8px] text-cyan-400 font-semibold font-mono mt-0.5 truncate w-full uppercase">
                      {item.role.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Credits */}
            <div className="mt-6 text-center flex items-center justify-center gap-1 text-[9px] text-slate-500 font-mono">
              <HelpCircle size={10} />
              <span>Full-Stack container environment secure</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE MASTER ERP SHELL */}
      {token && user && (
        <div className="min-h-screen flex overflow-hidden">
          {/* Collapsible Sidebar */}
          <Sidebar
            currentModule={currentModule}
            setCurrentModule={setCurrentModule}
            companies={companies}
            branches={branches}
            currentCompany={currentCompany || { id: "comp-1", name: "Loading...", currency: "ETB" }}
            setCurrentCompany={setCurrentCompany}
            currentBranch={currentBranch || { id: "br-1", companyId: "comp-1", name: "Loading...", address: "" }}
            setCurrentBranch={setCurrentBranch}
            user={user}
            darkMode={darkMode}
          />

          {/* Core Right Side content pane */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Header */}
            <Header
              user={user}
              onLogout={handleLogout}
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onOpenAICopilot={() => setIsAICopilotOpen(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              language={language}
              setLanguage={setLanguage}
            />

            {/* Content area panel layout */}
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentModule}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoadingData ? (
                    <div className="py-24 text-center space-y-3">
                      <RefreshCw size={24} className="animate-spin text-blue-500 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono">
                        Synchronizing general ledger nodes...
                      </p>
                    </div>
                  ) : (
                    renderActiveModule()
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Global Command Palette search overlay */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            setCurrentModule={setCurrentModule}
            darkMode={darkMode}
          />

          {/* AI Analysts floating Co-Pilot drawer */}
          <AIChatBot
            isOpen={isAICopilotOpen}
            onClose={() => setIsAICopilotOpen(false)}
            token={token}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}
