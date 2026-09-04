"use client";

import React from "react";
import { DigitalTwinSnapshot, DigitalTwinNodeGraph } from "@/types";
import { useI18n } from "@/lib/i18n";
import {
  Activity,
  ArrowRight,
  TrendingUp,
  Building,
  Package,
  Users,
  DollarSign,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface DigitalTwinCanvasProps {
  snapshot: DigitalTwinSnapshot;
  nodeGraph?: DigitalTwinNodeGraph;
}

export function DigitalTwinCanvas({ snapshot }: DigitalTwinCanvasProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-indigo-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {t("twin_isolated_badge")}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">
            {snapshot.companyName} — {t("digital_twin")}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {t("twin_canvas_subtitle")}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              {t("twin_health_indicator")}
            </p>
            <p className="text-lg font-bold text-emerald-400">94 / 100</p>
          </div>
          <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Visual Neural Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node 1: Inflow / Revenue */}
        <div className="glass-panel p-5 rounded-2xl border-indigo-500/30 relative group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <DollarSign className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t("node_inflow")}
              </h4>
            </div>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">
              {t("active_stream")}
            </span>
          </div>

          <p className="text-2xl font-black text-slate-100 mt-2">
            ${snapshot.monthlyRevenue.toLocaleString()}
            <span className="text-xs font-medium text-slate-400 ml-1">/ {t("months_short")}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>{t("active_branches")}:</span>
              <span className="font-semibold text-slate-200">{snapshot.totalBranches}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("active_customers")}:</span>
              <span className="font-semibold text-slate-200">{snapshot.activeCustomers}</span>
            </div>
          </div>
        </div>

        {/* Node 2: Cost of Goods & Direct Supply */}
        <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 relative group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t("node_cogs")}
              </h4>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">
              {snapshot.grossMarginPercent.toFixed(1)}% {t("margin_badge")}
            </span>
          </div>

          <p className="text-2xl font-black text-slate-100 mt-2">
            ${snapshot.monthlyCogs.toLocaleString()}
            <span className="text-xs font-medium text-slate-400 ml-1">/ {t("months_short")}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>{t("gross_profit")}:</span>
              <span className="font-semibold text-emerald-400">${snapshot.monthlyGrossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("low_stock_alerts")}:</span>
              <span className={`font-semibold ${snapshot.lowStockProductCount > 0 ? "text-amber-400" : "text-slate-200"}`}>
                {snapshot.lowStockProductCount} {t("items_label")}
              </span>
            </div>
          </div>
        </div>

        {/* Node 3: Operating Drain & Workforce */}
        <div className="glass-panel p-5 rounded-2xl border-rose-500/30 relative group hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t("node_opex")}
              </h4>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold border border-rose-500/20">
              {t("fixed_and_variable")}
            </span>
          </div>

          <p className="text-2xl font-black text-slate-100 mt-2">
            ${snapshot.monthlyOpex.toLocaleString()}
            <span className="text-xs font-medium text-slate-400 ml-1">/ {t("months_short")}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>{t("payroll")}:</span>
              <span className="font-semibold text-slate-200">${snapshot.monthlyPayroll.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("workforce")}:</span>
              <span className="font-semibold text-slate-200">{snapshot.totalEmployees} {t("staff_label")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Retained Bottom-Line Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-emerald-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            {t("node_net_margin")}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
            ${snapshot.monthlyNetProfit.toLocaleString()}{" "}
            <span className="text-sm font-bold text-emerald-400">
              ({snapshot.netMarginPercent.toFixed(1)}% {t("net_margin")})
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t("breakeven_revenue")}: ${snapshot.breakevenMonthlyRevenue.toLocaleString()} | {t("cash_runway")}: {snapshot.cashRunwayMonths > 50 ? t("infinite_runway") : `${snapshot.cashRunwayMonths} ${t("months_short")}`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/simulator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>{t("quick_simulate")}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
