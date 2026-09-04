"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { DigitalTwinSnapshot } from "@/types";
import {
  DollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  Users,
  Building,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Sparkles,
  Package
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export default function DashboardPage() {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<DigitalTwinSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTwinSnapshot()
      .then(setSnapshot)
      .catch((err) => console.error("Error loading twin snapshot:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {t("dashboard_title")}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("dashboard_subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="/simulator"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>{t("scenario_simulator")}</span>
            </a>
            <a
              href="/advisor"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("ai_advisor")}</span>
            </a>
          </div>
        </div>

        {/* Loading State */}
        {loading || !snapshot || !snapshot.historicalTrends ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Top Row: Executive Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={t("monthly_revenue")}
                value={`$${snapshot.monthlyRevenue.toLocaleString()}`}
                icon={DollarSign}
                trend={{ value: 8.4, label: t("vs_last_month") }}
                variant="indigo"
              />
              <StatCard
                title={t("net_profit")}
                value={`$${snapshot.monthlyNetProfit.toLocaleString()}`}
                icon={TrendingUp}
                trend={{ value: 12.2, label: t("vs_last_month") }}
                variant="emerald"
              />
              <StatCard
                title={t("net_margin")}
                value={`${snapshot.netMarginPercent.toFixed(1)}%`}
                subtitle={`COGS: $${snapshot.monthlyCogs.toLocaleString()}`}
                icon={Percent}
                variant="cyan"
              />
              <StatCard
                title={t("monthly_opex")}
                value={`$${snapshot.monthlyOpex.toLocaleString()}`}
                subtitle={`Payroll: $${snapshot.monthlyPayroll.toLocaleString()}`}
                icon={CreditCard}
                variant="amber"
              />
            </div>

            {/* Middle Row: Trend Chart & Quick Sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Financial Trend Chart */}
              <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {t("financial_trend")}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {t("trailing_6_months")}
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={snapshot.historicalTrends}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name={t("monthly_revenue")}
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="netProfit"
                        name={t("net_profit")}
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorProf)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Simulation Sandbox Promo */}
              <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/80">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    {t("quick_simulate")}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("quick_simulate_desc")}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{t("breakeven_revenue")}:</span>
                    <span className="font-bold text-slate-100">${snapshot.breakevenMonthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t("cash_runway")}:</span>
                    <span className="font-bold text-emerald-400">
                      {snapshot.cashRunwayMonths > 50 ? t("infinite_runway") : `${snapshot.cashRunwayMonths} ${t("months_short")}`}
                    </span>
                  </div>

                  <a
                    href="/simulator"
                    className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all block text-center"
                  >
                    <span>{t("launch_simulator")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Products & Branch Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" />
                    {t("top_products")}
                  </h3>
                  <a href="/products" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                    {t("view_catalog")}
                  </a>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {snapshot.topProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {p.category} • {t("cost_price")}: ${p.costPrice} → {t("selling_price")}: ${p.sellingPrice}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-400 block">
                          {p.grossMarginPercent.toFixed(1)}% {t("margin_badge")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t("stock")}: {p.stockQuantity} {t("pcs")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Network Summary */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    {t("branches")}
                  </h3>
                  <a href="/branches" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                    {t("branches")}
                  </a>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {snapshot.branches.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-200">{b.name}</p>
                          {b.isMainBranch && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                              HQ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {b.employeeCount} {t("staff_label")} • {t("monthly_opex")}: ${b.monthlyExpenses.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-100 block">
                          ${b.monthlyRevenue.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          +${b.netProfit.toLocaleString()} {t("profit_label")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
