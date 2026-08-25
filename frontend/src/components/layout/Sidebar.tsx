"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Cpu,
  Sliders,
  Sparkles,
  GitBranch,
  Package,
  Boxes,
  Users,
  Truck,
  Receipt,
  ShoppingCart,
  Hourglass,
  Wallet,
  CreditCard,
  UserCheck,
  FileBarChart2,
  ShieldAlert,
  Settings,
  LogOut,
  Building2,
  ExternalLink
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { currentCompany, logout } = useAuth();

  const navSections = [
    {
      title: "Core Intelligence",
      items: [
        { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
        { href: "/digital-twin", label: t("digital_twin"), icon: Cpu, badge: "Live" },
        { href: "/simulator", label: t("scenario_simulator"), icon: Sliders, badge: "Studio" },
        { href: "/advisor", label: t("ai_advisor"), icon: Sparkles, badge: "AI" },
      ]
    },
    {
      title: "Savdo & Ta'minot",
      items: [
        { href: "/products", label: t("products"), icon: Package },
        { href: "/inventory", label: t("inventory"), icon: Boxes },
        { href: "/sales", label: t("sales"), icon: Receipt },
        { href: "/purchases", label: t("purchases") || "Xaridlar", icon: ShoppingCart },
        { href: "/debts", label: t("debts") || "Nasiya & Qarzlar", icon: Hourglass },
        { href: "/payments", label: t("payments") || "To'lovlar Jurnali", icon: Wallet },
      ]
    },
    {
      title: "Resurslar & Tashkilot",
      items: [
        { href: "/branches", label: t("branches"), icon: GitBranch },
        { href: "/employees", label: t("employees"), icon: UserCheck },
        { href: "/customers", label: t("customers"), icon: Users },
        { href: "/suppliers", label: t("suppliers") || "Yetkazib beruvchilar", icon: Truck },
        { href: "/expenses", label: t("expenses"), icon: CreditCard },
      ]
    },
    {
      title: "Analitika & Tizim",
      items: [
        { href: "/reports", label: t("reports"), icon: FileBarChart2 },
        { href: "/audit", label: t("audit_logs"), icon: ShieldAlert },
        { href: "/settings", label: t("settings"), icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen flex flex-col glass-panel border-r border-slate-800/80 sticky top-0 shrink-0 z-40 bg-slate-950/70 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
          <Cpu className="w-5 h-5 text-white animate-pulse-slow" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 truncate">
            {t("app_name")}
          </h1>
          <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-semibold">
            Enterprise Twin OS
          </p>
        </div>
      </div>

      {/* Active Workspace Pill */}
      {currentCompany && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs">
          <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="truncate flex-1">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Workspace</span>
            <span className="font-semibold text-slate-200 text-xs truncate block">{currentCompany.name}</span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-900/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        item.badge === "Live" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        item.badge === "AI" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                        "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Scalar API Docs Link */}
        <div className="pt-2">
          <a
            href="http://localhost:5000/scalar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/30 border border-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Scalar API Docs</span>
            </div>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">OpenAPI</span>
          </a>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
