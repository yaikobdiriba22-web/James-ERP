/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Bell,
  Search,
  Sparkles,
  Sun,
  Moon,
  Globe,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { User, Notification } from "../types";
import { getEthiopianCalendarDate } from "../db/initialData";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenCommandPalette: () => void;
  onOpenAICopilot: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: "en" | "am" | "om";
  setLanguage: (lang: "en" | "am" | "om") => void;
}

export default function Header({
  user,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onOpenCommandPalette,
  onOpenAICopilot,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update clock every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => n.status === "Unread").length;
  
  // Format dates
  const gregorianDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const ethiopianDate = getEthiopianCalendarDate(currentTime.toISOString().split("T")[0]);

  // Translations mapping for header
  const translations = {
    en: { search: "Type commands or search ERP... (Ctrl + K)", hi: "Hi", assistant: "AI Analyst" },
    am: { search: "ትዕዛዞችን ይተይቡ ወይም ይፈልጉ... (Ctrl + K)", hi: "ሰላም", assistant: "አርቴፊሻል ኢንተለጀንስ" },
    om: { search: "Ajajawwan barreessi ykn barbaadi... (Ctrl + K)", hi: "Akkam", assistant: "AI Tiksituu" },
  };

  return (
    <header
      className={`h-16 px-6 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${
        darkMode
          ? "bg-[#090D16]/90 border-slate-800/80 text-slate-100"
          : "bg-white/95 border-slate-200 text-[#0F172A]"
      }`}
    >
      {/* Global Search and Command Palette Button */}
      <div className="flex-1 max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className={`w-full flex items-center justify-between px-4 py-2 rounded-full border text-left text-xs transition-all ${
            darkMode
              ? "bg-[#0F172A]/80 border-slate-800 text-slate-400 hover:bg-[#0F172A] focus:ring-4 focus:ring-blue-500/10"
              : "bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200/60 focus:ring-4 focus:ring-[#2563EB]/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <span>{translations[language].search}</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded border dark:border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Header Navigation Panel */}
      <div className="flex items-center gap-4 ml-4">
        {/* Real-time Ethiopian / Gregorian Calendars display */}
        <div className="hidden lg:flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <CalendarDays size={13} className="text-blue-500" />
            <span className={darkMode ? "text-slate-200" : "text-slate-700"}>
              {gregorianDate} • {formattedTime}
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono font-medium">
            Ethiopian: {ethiopianDate}
          </span>
        </div>

        {/* AI Co-Pilot Floating Badge Button */}
        <button
          onClick={onOpenAICopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-semibold font-display shadow-md shadow-cyan-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles size={13} className="animate-pulse" />
          <span>{translations[language].assistant}</span>
        </button>

        {/* Language selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLanguageDropdown(!showLanguageDropdown);
              setShowNotificationDropdown(false);
              setShowProfileDropdown(false);
            }}
            className={`p-2 rounded-lg border transition-colors ${
              darkMode
                ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                : "border-slate-200 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Globe size={16} />
          </button>
          {showLanguageDropdown && (
            <div
              className={`absolute right-0 mt-2 w-36 rounded-lg shadow-xl border p-1 z-30 font-display ${
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              {[
                { code: "en", label: "English" },
                { code: "am", label: "አማርኛ" },
                { code: "om", label: "Afaan Oromo" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                    language === lang.code
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "hover:bg-slate-800 text-slate-300"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggler Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg border transition-colors ${
            darkMode
              ? "border-slate-800 hover:bg-slate-800 text-slate-300"
              : "border-slate-200 hover:bg-slate-100 text-slate-600"
          }`}
        >
          {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
        </button>

        {/* Notifications Dropdown Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
              setShowLanguageDropdown(false);
            }}
            className={`p-2 rounded-lg border relative transition-colors ${
              darkMode
                ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                : "border-slate-200 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotificationDropdown && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-30 font-sans ${
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <h4 className="text-xs font-bold font-display uppercase tracking-wider">
                  Notifications
                </h4>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {unreadCount} New
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                        n.status === "Unread" ? "bg-blue-50/40 dark:bg-blue-950/10 font-medium" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                          {n.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        {n.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationDropdown(false);
                setShowLanguageDropdown(false);
              }}
              className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-800"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-cyan-400">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-none">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    {user.role}
                  </span>
                  {(user.role.toLowerCase().includes("admin") || user.role.toLowerCase().includes("ceo")) && (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/25 px-1 py-0.2 rounded font-mono font-bold tracking-wider">
                      CRUD
                    </span>
                  )}
                </div>
              </div>
            </button>
            {showProfileDropdown && (
              <div
                className={`absolute right-0 mt-2 w-52 rounded-lg shadow-xl border p-1 z-30 font-display ${
                  darkMode
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-100 text-slate-800"
                }`}
              >
                <div className="px-3 py-2 border-b dark:border-slate-800 text-left">
                  <p className="text-xs font-bold leading-none">{user.name}</p>
                  <p className="text-[9px] text-slate-400 mt-1 truncate">{user.email}</p>
                  
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono uppercase">Permissions</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[8px] border ${
                      (user.role.toLowerCase().includes("admin") || user.role.toLowerCase().includes("ceo"))
                        ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20"
                    }`}>
                      {(user.role.toLowerCase().includes("admin") || user.role.toLowerCase().includes("ceo")) ? "Full CRUD" : "Read / Write"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md font-medium transition-colors"
                >
                  <LogOut size={13} />
                  <span>Logout Session</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
