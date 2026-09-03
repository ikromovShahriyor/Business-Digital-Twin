"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Notification, Language } from "@/types";
import {
  Bell,
  Search,
  Globe,
  Building2,
  Check,
  User,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

export function Navbar() {
  const { t, language, setLanguage } = useI18n();
  const { user, currentCompany, availableCompanies, switchCompany } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(setNotifications)
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg glass-input text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Workspace Switcher */}
        {availableCompanies.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setShowWorkspace(!showWorkspace);
                setShowLang(false);
                setShowNotifs(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-xs text-slate-200 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium max-w-[120px] truncate">
                {currentCompany?.name || "Company"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showWorkspace && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel border border-slate-700 shadow-xl p-1.5 z-50">
                <p className="px-2 py-1 text-[10px] text-slate-400 uppercase font-semibold">
                  {t("switch_workspace")}
                </p>
                {availableCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchCompany(c.id);
                      setShowWorkspace(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      c.id === currentCompany?.id
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === currentCompany?.id && (
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLang(!showLang);
              setShowWorkspace(false);
              setShowNotifs(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-xs text-slate-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {languages.find((l) => l.code === language)?.flag || "🌐"}
            </span>
            <span className="uppercase text-[11px] font-semibold">
              {language}
            </span>
          </button>

          {showLang && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl glass-panel border border-slate-700 shadow-xl p-1 z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLang(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    language === l.code
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowWorkspace(false);
              setShowLang(false);
            }}
            className="relative p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel border border-slate-700 shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                <span className="font-semibold text-xs text-slate-200">
                  {t("notifications")}
                </span>
                <span className="text-[10px] text-indigo-400">
                  {unreadCount} {t("new_badge")}
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    {t("no_notifications")}
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        n.isRead
                          ? "bg-slate-800/30 text-slate-400"
                          : "bg-indigo-950/40 text-slate-200 border border-indigo-500/20"
                      }`}
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user.firstName ? user.firstName[0] : "U"}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-200 leading-none truncate max-w-[100px]">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
