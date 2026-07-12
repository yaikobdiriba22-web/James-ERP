/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Project, Task, Employee } from "../../types";

interface ProjectsModuleProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  token: string | null;
  onRefreshData: () => void;
  darkMode: boolean;
}

export default function ProjectsModule({
  projects,
  tasks,
  employees,
  token,
  onRefreshData,
  darkMode,
}: ProjectsModuleProps) {
  const [activeTab, setActiveTab] = React.useState<"kanban" | "projects">("kanban");
  const [showTaskForm, setShowTaskForm] = React.useState(false);

  // States for Add Task Form
  const [taskTitle, setTaskTitle] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState(projects[0]?.id || "");
  const [selectedEmpId, setSelectedEmpId] = React.useState(employees[0]?.id || "");
  const [taskPriority, setTaskPriority] = React.useState<"Low" | "Medium" | "High">("Medium");
  const [taskDueDate, setTaskDueDate] = React.useState("");
  const [taskStatusMsg, setTaskStatusMsg] = React.useState("");

  // Submit Task Requisition
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedProjectId || !selectedEmpId) {
      setTaskStatusMsg("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/erp/projects/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          projectId: selectedProjectId,
          assigneeId: selectedEmpId,
          priority: taskPriority,
          dueDate: taskDueDate || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTaskStatusMsg("Backlog task logged successfully!");
        onRefreshData();
        setTimeout(() => {
          setShowTaskForm(false);
          setTaskTitle("");
          setTaskStatusMsg("");
        }, 1500);
      } else {
        setTaskStatusMsg(data.error || "Failed to log task.");
      }
    } catch (err) {
      setTaskStatusMsg("Network error logging task.");
    }
  };

  // Move / Cycle Task Kanban column status
  const handleCycleStatus = async (taskId: string, currentStatus: string, direction: "next" | "prev") => {
    const columns = ["To Do", "In Progress", "Review", "Done"];
    const idx = columns.indexOf(currentStatus);
    let nextIdx = idx;

    if (direction === "next" && idx < columns.length - 1) nextIdx += 1;
    if (direction === "prev" && idx > 0) nextIdx -= 1;

    if (nextIdx === idx) return;

    try {
      const res = await fetch("/api/erp/projects/task/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          status: columns[nextIdx],
        }),
      });

      if (res.ok) {
        onRefreshData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update task column.");
      }
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  const columns = [
    { id: "To Do", label: "TO DO", border: "border-t-slate-400" },
    { id: "In Progress", label: "IN PROGRESS", border: "border-t-blue-500" },
    { id: "Review", label: "REVIEW BACKLOG", border: "border-t-amber-500" },
    { id: "Done", label: "COMPLETED", border: "border-t-emerald-500" },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban size={22} className="text-blue-500" /> Projects & Tasks
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Review timeline deadlines, balance task backlogs, and drag work orders across Kanban columns.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "kanban"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "projects"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Corporate Projects
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === "kanban" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              Scrum Sprint backlogs
            </h3>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/10 transition-colors"
            >
              <Plus size={13} />
              <span>Raise Sprint Task</span>
            </button>
          </div>

          {/* New Task Requisition Form popup */}
          {showTaskForm && (
            <form onSubmit={handleTaskSubmit} className={`p-4 rounded-xl border max-w-md animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Add Backlog Task</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Task Deliverable Title</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Refactor VAT postings / Test Sourcing API..."
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Project Scope</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Assignee Staff</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Priority Severity</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Severity</option>
                      <option value="High">High Blockers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>
                </div>

                {taskStatusMsg && (
                  <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                    <AlertCircle size={10} /> {taskStatusMsg}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                    Schedule Task
                  </button>
                  <button type="button" onClick={() => setShowTaskForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Kanban board columns mapping */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
            {columns.map((col) => {
              const matches = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`rounded-2xl border-t-4 p-4 flex flex-col gap-3 min-h-[350px] ${col.border} ${
                    darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {col.label}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-850 dark:text-slate-400 text-slate-600 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      {matches.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {matches.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-3 text-xs ${
                          darkMode ? "bg-slate-950 border-slate-850/80" : "bg-slate-50/50 border-slate-150"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                            {task.title}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 block truncate">
                            Project: {task.projectName}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Assignee: {task.assigneeName.split(" ")[0]}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                              task.priority === "High"
                                ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                                : task.priority === "Medium"
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Direct status move arrow actions */}
                        <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-150 dark:border-slate-800/30">
                          {col.id !== "To Do" && (
                            <button
                              type="button"
                              onClick={() => handleCycleStatus(task.id, task.status, "prev")}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-250 dark:border-slate-800"
                              title="Move back"
                            >
                              <ArrowLeft size={10} />
                            </button>
                          )}
                          {col.id !== "Done" && (
                            <button
                              type="button"
                              onClick={() => handleCycleStatus(task.id, task.status, "next")}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-250 dark:border-slate-800"
                              title="Advance status"
                            >
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border ${
                darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">{p.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">ID: {p.id}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  p.status === "In Progress"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-slate-500 leading-relaxed">{p.description}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 flex justify-between items-center text-[10px] font-mono text-slate-400 font-semibold">
                  <span>START: {p.startDate}</span>
                  <span>DEADLINE: {p.endDate}</span>
                </div>
                <div className="pt-1 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                  <span>Manager: {p.managerName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
