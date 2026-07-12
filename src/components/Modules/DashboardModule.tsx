/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  FolderKanban,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Award,
  Landmark,
  UserCheck,
  CalendarCheck,
  Lock,
} from "lucide-react";
import { Employee, ChartOfAccount, Product, SalesOrder, Project, Task, AuditLog, User } from "../../types";
import { getEthiopianCalendarDate } from "../../db/initialData";

interface DashboardModuleProps {
  user: User;
  employees: Employee[];
  chartOfAccounts: ChartOfAccount[];
  products: Product[];
  salesOrders: SalesOrder[];
  projects: Project[];
  tasks: Task[];
  auditLogs: AuditLog[];
  currentCompany: { id: string; name: string; currency: string };
  darkMode: boolean;
  language: "en" | "am" | "om";
}

export default function DashboardModule({
  user,
  employees,
  chartOfAccounts,
  products,
  salesOrders,
  projects,
  tasks,
  auditLogs,
  currentCompany,
  darkMode,
  language,
}: DashboardModuleProps) {
  const [selectedCurrency, setSelectedCurrency] = React.useState<"ETB" | "USD">("ETB");
  const conversionRate = 122.5; // 1 USD = 122.5 ETB

  const formatCurrency = (amount: number) => {
    const activeAmt = selectedCurrency === "USD" ? amount / conversionRate : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedCurrency,
      maximumFractionDigits: 0,
    }).format(activeAmt);
  };

  // 1. Calculate dynamic ledger values based on Chart Of Accounts
  const revenueCOA = chartOfAccounts.filter((c) => c.category === "Revenue");
  const expenseCOA = chartOfAccounts.filter((c) => c.category === "Expense");
  const assetCOA = chartOfAccounts.filter((c) => c.category === "Asset");

  const totalRevenue = Math.abs(revenueCOA.reduce((sum, c) => sum + c.balance, 0));
  const totalExpenses = expenseCOA.reduce((sum, c) => sum + c.balance, 0);
  const totalAssets = assetCOA.reduce((sum, c) => sum + c.balance, 0);
  const totalProfit = totalRevenue - totalExpenses;

  // Inventory value
  const totalInventoryValue = products.reduce((sum, p) => {
    const qty = Object.values(p.stock).reduce((s, q) => s + q, 0);
    return sum + qty * p.cost;
  }, 0);

  // Active projects and tickets
  const activeProjectsCount = projects.filter((p) => p.status === "In Progress").length;

  // Suggested multi-language titles
  const titles = {
    en: {
      rev: "Revenue Balance", profit: "Net Profit Margin", exp: "Operating Expenses",
      assets: "Asset Evaluation", inventory: "Inventory Value", activeProj: "Active Projects",
      chartsTitle: "Revenue & Expense Trends (2026)", cashFlowTitle: "Liquid Cash Flow",
      activities: "Audit Trail", tasks: "Task Tracker", calendar: "Events Calendar"
    },
    am: {
      rev: "ጠቅላላ ገቢ", profit: "የተጣራ ትርፍ", exp: "የስራ ማስኬጃ ወጪዎች",
      assets: "የሀብት ግምት", inventory: "የምርት ክምችት ዋጋ", activeProj: "ንቁ ፕሮጀክቶች",
      chartsTitle: "የገቢ እና ወጪ አዝማሚያ (2026)", cashFlowTitle: "የገንዘብ ፍሰት",
      activities: "የቁጥጥር መዝገብ", tasks: "የስራ ክትትል", calendar: "የክስተቶች የቀን መቁጠሪያ"
    },
    om: {
      rev: "Galii Waligalaa", profit: "Bu'aa Qulqulluu", exp: "Baasii Hojii",
      assets: "Madaallii Qabeenyaa", inventory: "Gatii Meeshaalee Clr", activeProj: "Projektoota Hojirra Jiran",
      chartsTitle: "Adeemsa Galii fi Baasii (2026)", cashFlowTitle: "Yaasoo Maallaqaa",
      activities: "Gabaasa To'annoo", tasks: "Hordoffii Hojii", calendar: "Kalandara Sagantaalee"
    },
  };

  const activeTitle = titles[language];

  // SVG Chart data points (Months: Jan - June)
  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const revenuePoints = [1200000, 1500000, 1900000, 1800000, 2400000, 2800000, totalRevenue > 0 ? totalRevenue : 3100000];
  const expensePoints = [800000, 950000, 1100000, 1050000, 1400000, 1550000, totalExpenses > 0 ? totalExpenses : 1700000];

  // Map points to SVG coordinates (width 500, height 200, padding 40)
  const maxVal = Math.max(...revenuePoints, ...expensePoints) * 1.15;
  const mapY = (val: number) => 170 - (val / maxVal) * 130;
  const mapX = (index: number) => 40 + index * 65;

  // Generate SVG path for revenue
  const revenuePath = revenuePoints.map((val, idx) => `${mapX(idx)},${mapY(val)}`).join(" L ");
  const revenueAreaPath = `M ${mapX(0)},170 L ${revenuePath} L ${mapX(revenuePoints.length - 1)},170 Z`;

  // Generate SVG path for expenses
  const expensePath = expensePoints.map((val, idx) => `${mapX(idx)},${mapY(val)}`).join(" L ");
  const expenseAreaPath = `M ${mapX(0)},170 L ${expensePath} L ${mapX(expensePoints.length - 1)},170 Z`;

  // Holidays Calendar Items
  const holidays = [
    { date: "Sept 11", name: "Enkutatash (Ethiopian New Year)", ec: "Meskerem 1" },
    { date: "Sept 27", name: "Meskel (Finding of the True Cross)", ec: "Meskerem 17" },
    { date: "Jan 07", name: "Genna (Ethiopian Christmas)", ec: "Tahsas 29" },
    { date: "Jan 19", name: "Timket (Epiphany)", ec: "Ter 11" },
    { date: "Mar 02", name: "Victory of Adwa Day", ec: "Yekatit 23" },
    { date: "May 01", name: "Ethiopian Good Friday", ec: "Miazia 23" },
  ];

  const normRole = (user.role || "").toLowerCase();
  const isCEO = normRole.includes("ceo") || normRole.includes("admin");
  const isHR = normRole.includes("hr") || normRole.includes("human");
  const isAccountant = normRole.includes("accountant") || normRole.includes("accounting") || normRole.includes("finance");

  // HR Stats calculations
  const totalRoster = employees.length;
  const presentToday = employees.filter(e => e.attendance && e.attendance.length > 0 && e.attendance.some(a => a.status === "Present")).length;
  const attendanceRate = totalRoster > 0 ? Math.round((presentToday / totalRoster) * 100) : 94;
  const activeLeaves = employees.reduce((acc, e) => acc + (e.leaves ? e.leaves.filter(l => l.status === "Approved").length : 0), 0);
  const openTraining = employees.reduce((acc, e) => acc + (e.training ? e.training.filter(t => t.status === "Completed").length : 0), 0);

  // Departments for HR Breakdown
  const depts = [
    { id: "dept-exec", name: "Executive Suite", color: "from-amber-600 to-yellow-500", text: "text-amber-400" },
    { id: "dept-finance", name: "Finance & Accounts", color: "from-emerald-600 to-teal-500", text: "text-emerald-400" },
    { id: "dept-hr", name: "Human Resources", color: "from-purple-600 to-indigo-500", text: "text-purple-400" },
    { id: "dept-sales", name: "Sales & Marketing", color: "from-blue-600 to-cyan-500", text: "text-blue-400" },
    { id: "dept-ops", name: "Logistics Operations", color: "from-cyan-600 to-sky-500", text: "text-cyan-400" },
    { id: "dept-hawassa-ops", name: "Production & QC", color: "from-red-600 to-orange-500", text: "text-red-400" },
  ];

  const deptStats = depts.map(d => {
    const count = employees.filter(e => e.departmentId === d.id).length;
    const percentage = totalRoster > 0 ? Math.round((count / totalRoster) * 100) : 0;
    return { ...d, count, percentage };
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Dynamic Welcome Card & Header Banner */}
      {isCEO && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-900/20 border border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">CEO CONTROL CENTER</span>
              <span className="text-[10px] text-slate-400 font-mono">SECURE HUB SESSION</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight">Welcome back, {user.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              You have full administrative clearance over {currentCompany.name}. Review company-wide liquid asset sheets, dynamic ledger balances, active HR headcount distribution, and security access streams.
            </p>
          </div>
          <div className="px-4 py-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-right font-mono shrink-0">
            <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">System Status</span>
            <span className="text-xs text-slate-700 dark:text-white font-black flex items-center gap-1.5 justify-end">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ALL ONLINE
            </span>
          </div>
        </div>
      )}

      {isHR && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-slate-900/20 border border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">HR REGISTRY</span>
              <span className="text-[10px] text-slate-400 font-mono">SECURE HUB SESSION</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight">Welcome back, {user.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              You have HR operational authorization. Monitor dynamic employee roster expansions, department distributions, attendance compliance metrics, and training program tracks.
            </p>
          </div>
          <div className="px-4 py-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-right font-mono shrink-0">
            <span className="block text-[10px] text-purple-400 font-bold uppercase tracking-wider">Staff Attendance</span>
            <span className="text-xs text-slate-700 dark:text-white font-black flex items-center gap-1.5 justify-end">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {attendanceRate}% PRESENT TODAY
            </span>
          </div>
        </div>
      )}

      {isAccountant && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/20 border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">FINANCE LEDGER & TAX</span>
              <span className="text-[10px] text-slate-400 font-mono">SECURE HUB SESSION</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight">Welcome back, {user.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              You have operational authorization over corporate accounts, general ledger, and asset records. Track dynamic revenue flows, net operating profit, assets, and cash allocations.
            </p>
          </div>
          <div className="px-4 py-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-right font-mono shrink-0">
            <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">General Ledger</span>
            <span className="text-xs text-slate-700 dark:text-white font-black flex items-center gap-1.5 justify-end">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              RECONCILED
            </span>
          </div>
        </div>
      )}

      {/* Title & Currency controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-150 dark:border-slate-800/60">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            {currentCompany.name} <span className="text-slate-400 text-sm font-normal">({user.role} Dashboard)</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Dynamic Intelligence Desk (Base Currency: {currentCompany.currency})
          </p>
        </div>
        
        {/* Only show currency selector for financial profiles */}
        {(isCEO || isAccountant) && (
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border dark:border-slate-800/80">
            <button
              onClick={() => setSelectedCurrency("ETB")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedCurrency === "ETB"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-800"
              }`}
            >
              ETB
            </button>
            <button
              onClick={() => setSelectedCurrency("USD")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedCurrency === "USD"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-800"
              }`}
            >
              USD
            </button>
          </div>
        )}
      </div>

      {/* Bento Grid: Core Business KPIs (Tailored by Role) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(!isHR) ? (
          <>
            {/* KPI Card 1: Revenue */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  {activeTitle.rev}
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {formatCurrency(totalRevenue)}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-emerald-500">
                  <TrendingUp size={12} />
                  <span>+14.5% vs last month</span>
                </div>
              </div>
            </div>

            {/* KPI Card 2: Net Profit */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  {activeTitle.profit}
                </span>
                <div className={`p-2 rounded-xl ${totalProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {formatCurrency(totalProfit)}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-emerald-500">
                  <TrendingUp size={12} />
                  <span>32% operating margin</span>
                </div>
              </div>
            </div>

            {/* KPI Card 3: Expenses */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  {activeTitle.exp}
                </span>
                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                  <TrendingDown size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {formatCurrency(totalExpenses)}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  <Clock size={12} />
                  <span>Includes payroll, rents & leases</span>
                </div>
              </div>
            </div>

            {/* KPI Card 4: Assets Valuations / Inventory SKUs */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  {isAccountant ? "Total Asset Value" : "Inventory Valuation"}
                </span>
                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500">
                  <Landmark size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {formatCurrency(isAccountant ? totalAssets : totalInventoryValue)}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-cyan-400">
                  <Package size={12} />
                  <span>{products.length} registered SKUs</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* HR KPI Card 1: Total Employees */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  Total Corporate Roster
                </span>
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {totalRoster} <span className="text-xs text-slate-400 font-normal">Employees</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-purple-500">
                  <UserCheck size={12} />
                  <span>Fully cataloged in database</span>
                </div>
              </div>
            </div>

            {/* HR KPI Card 2: Attendance Compliance */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  Present Today
                </span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <CalendarCheck size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {presentToday} <span className="text-xs text-slate-400 font-normal">Staff</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-emerald-500">
                  <TrendingUp size={12} />
                  <span>{attendanceRate}% attendance rate</span>
                </div>
              </div>
            </div>

            {/* HR KPI Card 3: Active Approved Leaves */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  Approved Leaves
                </span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                  <Clock size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {activeLeaves} <span className="text-xs text-slate-400 font-normal">Active</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-amber-500">
                  <Clock size={12} />
                  <span>Approved for this calendar cycle</span>
                </div>
              </div>
            </div>

            {/* HR KPI Card 4: Training & Development */}
            <div
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-slate-900/60 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  Training Completion
                </span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <Award size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                  {openTraining} <span className="text-xs text-slate-400 font-normal font-sans">Modules Completed</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-blue-500">
                  <CheckCircle2 size={12} />
                  <span>Active compliance tracks</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Operational Dashboard Metrics (SVG Graph or Department distribution based on Role) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(!isHR) ? (
          /* CEO & Accountant see Revenue Curves chart */
          <div
            className={`lg:col-span-2 p-5 rounded-2xl border ${
              darkMode
                ? "bg-slate-900/60 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider">
                  {activeTitle.chartsTitle}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dynamic revenue curves vs operating expenditures
                </p>
              </div>
              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-blue-500"></span>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-red-500"></span>
                  <span>Expenses</span>
                </div>
              </div>
            </div>

            {/* SVG Animated Chart Area */}
            <div className="relative w-full h-56 mt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                {/* Grids and Axes */}
                <line x1="40" y1="40" x2="480" y2="40" stroke="rgba(148,163,184,0.1)" strokeDasharray="3" />
                <line x1="40" y1="105" x2="480" y2="105" stroke="rgba(148,163,184,0.1)" strokeDasharray="3" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(148,163,184,0.2)" />

                {/* Chart Areas (Shaded Gradients) */}
                <path d={revenueAreaPath} fill="rgba(37,99,235,0.06)" />
                <path d={expenseAreaPath} fill="rgba(220,38,38,0.04)" />

                {/* Chart Lines */}
                <path d={`M ${revenuePath}`} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`M ${expensePath}`} fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points markers */}
                {revenuePoints.map((val, idx) => (
                  <circle key={`rev-${idx}`} cx={mapX(idx)} cy={mapY(val)} r="4" fill="#2563EB" stroke={darkMode ? "#0F172A" : "#FFFFFF"} strokeWidth="1.5" />
                ))}
                {expensePoints.map((val, idx) => (
                  <circle key={`exp-${idx}`} cx={mapX(idx)} cy={mapY(val)} r="4" fill="#DC2626" stroke={darkMode ? "#0F172A" : "#FFFFFF"} strokeWidth="1.5" />
                ))}

                {/* X Axis Labels */}
                {chartMonths.map((m, idx) => (
                  <text key={idx} x={mapX(idx)} y="188" fontSize="8" fill="#94A3B8" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">
                    {m}
                  </text>
                ))}

                {/* Y Axis Grid scale indicators */}
                <text x="32" y="43" fontSize="7" fill="#94A3B8" textAnchor="end" fontWeight="600" fontFamily="monospace">
                  {(maxVal * 0.8 / 1000).toFixed(0)}k
                </text>
                <text x="32" y="108" fontSize="7" fill="#94A3B8" textAnchor="end" fontWeight="600" fontFamily="monospace">
                  {(maxVal * 0.4 / 1000).toFixed(0)}k
                </text>
                <text x="32" y="173" fontSize="7" fill="#94A3B8" textAnchor="end" fontWeight="600" fontFamily="monospace">
                  0
                </text>
              </svg>
            </div>
          </div>
        ) : (
          /* HR Manager sees Department Roster Breakdown list */
          <div
            className={`lg:col-span-2 p-5 rounded-2xl border ${
              darkMode
                ? "bg-slate-900/60 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider">
                  Departmental Staff Distribution
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dynamic distribution of corporate staff across active business sectors
                </p>
              </div>
              <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2.5 py-0.5 rounded font-mono font-bold">
                {depts.length} Sectors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {deptStats.map((dept) => (
                <div
                  key={dept.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    darkMode
                      ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{dept.name}</span>
                    <span className="text-[11px] font-mono font-black text-slate-400">
                      {dept.count} Staff
                    </span>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${dept.color}`}
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono font-semibold text-slate-400">
                      <span>Roster Allocation</span>
                      <span>{dept.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corporate Holidays Calendar widget (Common to all roles) */}
        <div
          className={`p-5 rounded-2xl border ${
            darkMode
              ? "bg-slate-900/60 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-500" />
              <span>{activeTitle.calendar}</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              National & Cultural Holidays (Ethiopian Calendar)
            </p>
          </div>
          <div className="space-y-3">
            {holidays.map((h, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border flex justify-between items-center transition-colors ${
                  darkMode
                    ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80"
                    : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/40"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                    {h.name}
                  </p>
                  <span className="text-[9px] text-cyan-400 font-mono font-medium">
                    EC equivalent: {h.ec}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md shrink-0">
                  {h.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Audit Trails (Recent Activities) & Task trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Logs / HR Access Logs based on user role */}
        <div
          className={`p-5 rounded-2xl border ${
            darkMode
              ? "bg-slate-900/60 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider">
                {isHR ? "Staff Access Security Logs" : activeTitle.activities}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isHR ? "Roster modification logs and personnel updates" : "Real-time ledger postings and administrative audit trail"}
              </p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {auditLogs
              .filter(log => {
                if (isHR) {
                  // HR sees login actions, leave updates, and profile edits
                  const act = (log.action || "").toLowerCase();
                  return act.includes("hr") || act.includes("employee") || act.includes("login") || act.includes("session") || act.includes("user");
                }
                return true; // CEO/Accountant see all financial and system logs
              })
              .slice(0, 5)
              .map((log) => (
                <div key={log.id} className="flex gap-3 items-start text-xs border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-0 last:pb-0">
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                    isHR ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {isHR ? <ShieldCheck size={12} /> : <Briefcase size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.action} <span className="text-slate-400 font-normal">by</span> {log.userName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 dark:text-slate-400 text-slate-500 px-1 py-0.5 rounded font-mono font-medium mt-1 inline-block">
                      {log.ipAddress}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Dynamic task tracker */}
        <div
          className={`p-5 rounded-2xl border ${
            darkMode
              ? "bg-slate-900/60 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider">
                {activeTitle.tasks}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Current backlog and active work orders
              </p>
            </div>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-mono font-bold">
              {tasks.length} Total
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No active tasks logged in the company registry.
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    darkMode
                      ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80"
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400">
                      <span className="font-medium bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
                        {t.projectName}
                      </span>
                      <span>• Assignee: {t.assigneeName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md font-mono ${
                        t.status === "Done"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : t.status === "In Progress"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                          : t.status === "Review"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Due: {t.dueDate.split("-")[1]}/{t.dueDate.split("-")[2]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
