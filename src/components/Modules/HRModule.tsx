/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Users,
  Clock,
  Calendar,
  Check,
  X,
  AlertCircle,
  Plus,
  UserPlus,
  UserCheck,
  Award,
} from "lucide-react";
import { Employee, UserRole } from "../../types";

interface HRModuleProps {
  employees: Employee[];
  token: string | null;
  onRefreshData: () => void;
  userRole: UserRole;
  darkMode: boolean;
}

export default function HRModule({
  employees,
  token,
  onRefreshData,
  userRole,
  darkMode,
}: HRModuleProps) {
  const [activeTab, setActiveTab] = React.useState<"staff" | "attendance" | "leaves">("staff");
  
  // States for Leave Request Form
  const [showLeaveForm, setShowLeaveForm] = React.useState(false);
  const [selectedEmpId, setSelectedEmpId] = React.useState(employees[0]?.id || "");
  const [leaveType, setLeaveType] = React.useState<"Annual" | "Sick" | "Maternity" | "Paternity" | "Unpaid">("Annual");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [days, setDays] = React.useState("3");
  const [reason, setReason] = React.useState("");
  const [leaveStatusMsg, setLeaveStatusMsg] = React.useState("");

  // States for Attendance Log Form
  const [showAttendanceForm, setShowAttendanceForm] = React.useState(false);
  const [attEmpId, setAttEmpId] = React.useState(employees[0]?.id || "");
  const [attStatus, setAttStatus] = React.useState<"Present" | "Late" | "Absent">("Present");
  const [attCheckIn, setAttCheckIn] = React.useState("08:30");
  const [attStatusMsg, setAttStatusMsg] = React.useState("");

  // Submit Leave Request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !startDate || !endDate) {
      setLeaveStatusMsg("Please complete all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/erp/hr/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: selectedEmpId,
          leaveType,
          startDate,
          endDate,
          days,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLeaveStatusMsg("Leave request submitted successfully!");
        onRefreshData();
        setTimeout(() => {
          setShowLeaveForm(false);
          setLeaveStatusMsg("");
          setReason("");
        }, 1500);
      } else {
        setLeaveStatusMsg(data.error || "Failed to submit leave.");
      }
    } catch (err) {
      setLeaveStatusMsg("Network error submitting leave.");
    }
  };

  // Submit Attendance Logger
  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/erp/hr/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: attEmpId,
          status: attStatus,
          checkIn: attCheckIn,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAttStatusMsg("Attendance logged successfully!");
        onRefreshData();
        setTimeout(() => {
          setShowAttendanceForm(false);
          setAttStatusMsg("");
        }, 1500);
      } else {
        setAttStatusMsg(data.error || "Failed to log attendance.");
      }
    } catch (err) {
      setAttStatusMsg("Network error logging attendance.");
    }
  };

  // Process (Approve/Reject) Leave Request
  const handleProcessLeave = async (empId: string, leaveId: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/erp/hr/leaves/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: empId,
          leaveId,
          status,
        }),
      });

      if (res.ok) {
        onRefreshData();
      } else {
        const d = await res.json();
        alert(d.error || "Error updating leave status.");
      }
    } catch (err) {
      console.error("Failed to process leave approval:", err);
    }
  };

  // Filter lists
  const allLeaves = employees.flatMap((emp) =>
    emp.leaves.map((l) => ({
      ...l,
      employeeName: emp.name,
      employeeEmail: emp.email,
      employeeId: emp.id,
    }))
  );

  const allAttendance = employees.flatMap((emp) =>
    emp.attendance.map((att) => ({
      ...att,
      employeeName: emp.name,
      employeeRole: emp.role,
    }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Access Controls: check if HR or Admin
  const canApprove = [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.HR, UserRole.MANAGER].includes(userRole);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={22} className="text-blue-500" /> Human Resources Module
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Maintain organizational rosters, approve leaves, and review daily attendance rosters.
          </p>
        </div>

        {/* Modular Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border dark:border-slate-800/80 shrink-0">
          {[
            { id: "staff", label: "Staff Roster", icon: Users },
            { id: "attendance", label: "Attendance Logs", icon: Clock },
            { id: "leaves", label: "Leave Desk", icon: Calendar },
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

      {/* TABS 1: STAFF ROSTER */}
      {activeTab === "staff" && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Roster size</span>
              <h4 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{employees.length} Employees</h4>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Active on Duty</span>
              <h4 className="text-2xl font-bold mt-1 text-emerald-500">
                {employees.filter((e) => e.status === "Active").length} Active
              </h4>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">On Approved Leaves</span>
              <h4 className="text-2xl font-bold mt-1 text-blue-500">
                {employees.filter((e) => e.status === "On Leave").length} Staff
              </h4>
            </div>
          </div>

          {/* Roster Table */}
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Role / Department</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Base Salary</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Reviews Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.map((emp) => {
                    const latestScore = emp.performance[0]?.score || "N/A";
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-500/20 flex items-center justify-center font-bold text-blue-600 dark:text-cyan-400">
                              {emp.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{emp.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{emp.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.role}</p>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{emp.departmentId}</span>
                        </td>
                        <td className="p-3 font-mono">{emp.phone}</td>
                        <td className="p-3 font-semibold font-mono">{emp.salary.toLocaleString()} ETB</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            emp.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : emp.status === "On Leave"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                              : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {latestScore !== "N/A" ? (
                            <div className="flex items-center gap-1.5 text-amber-500 font-semibold font-mono">
                              <Award size={13} />
                              <span>{latestScore} / 5</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Not Reviewed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TABS 2: ATTENDANCE LOGS */}
      {activeTab === "attendance" && (
        <div className="space-y-4 animate-fade-in">
          {/* Control Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              Daily Employee Check-Ins
            </h3>
            <button
              onClick={() => setShowAttendanceForm(!showAttendanceForm)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/10 transition-colors"
            >
              <UserPlus size={13} />
              <span>Log Manual Check-In</span>
            </button>
          </div>

          {/* Attendance log form popup */}
          {showAttendanceForm && (
            <form onSubmit={handleAttendanceSubmit} className={`p-4 rounded-xl border max-w-md animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Log Check-In Form</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Select Staff member</label>
                  <select
                    value={attEmpId}
                    onChange={(e) => setAttEmpId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Duty Status</label>
                    <select
                      value={attStatus}
                      onChange={(e) => setAttStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Arrival Time</label>
                    <input
                      type="text"
                      value={attCheckIn}
                      onChange={(e) => setAttCheckIn(e.target.value)}
                      placeholder="e.g., 08:30"
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                </div>
                {attStatusMsg && (
                  <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                    <AlertCircle size={10} /> {attStatusMsg}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                    Confirm Log
                  </button>
                  <button type="button" onClick={() => setShowAttendanceForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Attendance Table */}
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Log Date</th>
                  <th className="p-3">In (Checked)</th>
                  <th className="p-3">Out (Checked)</th>
                  <th className="p-3 text-center">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{att.employeeName}</td>
                    <td className="p-3 font-mono">{att.date}</td>
                    <td className="p-3 font-mono">{att.checkIn}</td>
                    <td className="p-3 font-mono text-slate-400">{att.checkOut || "--:--"}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        att.status === "Present"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : att.status === "Late"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                      }`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABS 3: LEAVE DESK */}
      {activeTab === "leaves" && (
        <div className="space-y-4 animate-fade-in">
          {/* Action header */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              Leave Requests & Approved Absences
            </h3>
            <button
              onClick={() => setShowLeaveForm(!showLeaveForm)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/10 transition-colors"
            >
              <Plus size={13} />
              <span>Submit Leave Request</span>
            </button>
          </div>

          {/* Leave Request form popup */}
          {showLeaveForm && (
            <form onSubmit={handleLeaveSubmit} className={`p-4 rounded-xl border max-w-md animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3">New Leave Request</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Select Employee</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    >
                      <option value="Annual">Annual</option>
                      <option value="Sick">Sick</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Paternity">Paternity</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Days count</label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Absence Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide details..."
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                {leaveStatusMsg && (
                  <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                    <AlertCircle size={10} /> {leaveStatusMsg}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                    Submit Request
                  </button>
                  <button type="button" onClick={() => setShowLeaveForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Leaves List Table */}
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Absence Details</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-center">Status</th>
                  {canApprove && <th className="p-3 text-right">Approve Board Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{l.employeeName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{l.employeeEmail}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{l.leaveType} Leave</p>
                      <span className="text-[10px] text-slate-400 font-mono">{l.days} Days Total</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                      {l.startDate} <span className="text-slate-400">to</span> {l.endDate}
                    </td>
                    <td className="p-3 text-slate-500 truncate max-w-[150px]">{l.reason || "No detail provided"}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        l.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : l.status === "Rejected"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="p-3 text-right">
                        {l.status === "Pending" ? (
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleProcessLeave(l.employeeId, l.id, "Approved")}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded border border-emerald-500/20"
                              title="Approve leave"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => handleProcessLeave(l.employeeId, l.id, "Rejected")}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded border border-red-500/20"
                              title="Reject leave"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono font-bold">PROCESSED</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
