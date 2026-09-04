"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { IncomeStatement, CashFlowEstimate, StockValuation, DebtSummary } from "@/types";
import {
  FileBarChart2,
  Download,
  TrendingUp,
  DollarSign,
  Boxes,
  Hourglass,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Building
} from "lucide-react";

export default function ReportsPage() {
  const { t } = useI18n();
  const [statement, setStatement] = useState<IncomeStatement | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowEstimate | null>(null);
  const [valuation, setValuation] = useState<StockValuation | null>(null);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getIncomeStatement(),
      api.getCashFlow(),
      api.getStockValuation(),
      api.getDebtSummary(),
    ])
      .then(([inc, cf, val, debt]) => {
        setStatement(inc);
        setCashFlow(cf);
        setValuation(val);
        setDebtSummary(debt);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!statement) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      `Korsatkich,Miqdor (USD)\n` +
      `Yalpi Tushum (Gross Revenue),${statement.grossRevenue}\n` +
      `Chegirmalar (Discounts),${statement.returnsAndDiscounts}\n` +
      `Sof Tushum (Net Revenue),${statement.netRevenue}\n` +
      `Mahsulot Tannarxi (COGS),${statement.costOfGoodsSold}\n` +
      `Yalpi Foyda (Gross Profit),${statement.grossProfit}\n` +
      `Operatsion Xarajatlar (OPEX),${statement.totalOpex}\n` +
      `Operatsion Foyda (EBIT),${statement.operatingIncome}\n` +
      `Sof Foyda (Net Income),${statement.netIncome}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Moliyaviy_Hisobot_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 sm:gap-3">
              <FileBarChart2 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
              <span>{t("reports_title")}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t("reports_subtitle")}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-lg w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>{t("export_csv")}</span>
          </button>
        </div>

        {loading || !statement ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl glass-card border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">{t("net_revenue_lbl")}</span>
                <p className="text-2xl font-bold text-white mt-2">${statement.netRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{t("last_30_days")}</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">{t("gross_profit_lbl")}</span>
                <p className="text-2xl font-bold text-emerald-400 mt-2">${statement.grossProfit.toLocaleString()}</p>
                <p className="text-xs text-emerald-500/80 mt-1">{t("margin_label")}: {statement.grossMarginPercent.toFixed(1)}%</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">{t("monthly_opex")}</span>
                <p className="text-2xl font-bold text-rose-400 mt-2">${statement.totalOpex.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{t("opex_breakdown_lbl")}</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">{t("net_profit_lbl")}</span>
                <p className={`text-2xl font-bold mt-2 ${statement.netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {statement.netIncome >= 0 ? "+" : ""}${statement.netIncome.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{t("net_margin_lbl")}: {statement.netMarginPercent.toFixed(1)}%</p>
              </div>
            </div>

            {/* Income Statement & Cash Flow side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* P&L Table */}
              <div className="lg:col-span-7 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    {t("income_statement_title")}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(statement.startDateUtc).toLocaleDateString()} — {new Date(statement.endDateUtc).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                  <div className="flex justify-between py-2 font-semibold text-slate-300">
                    <span>{t("gross_revenue_lbl")}</span>
                    <span className="font-mono text-white font-bold">${statement.grossRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-400 pl-4">
                    <span>{t("discounts_lbl")}</span>
                    <span className="font-mono text-slate-400">-${statement.returnsAndDiscounts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 font-bold text-white bg-slate-900/60 px-3 rounded-lg">
                    <span>{t("net_revenue_lbl")}</span>
                    <span className="font-mono text-indigo-300">${statement.netRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 text-rose-400 pl-4">
                    <span>{t("cogs_lbl")}</span>
                    <span className="font-mono">-${statement.costOfGoodsSold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 font-bold text-emerald-400 bg-emerald-950/20 px-3 rounded-lg">
                    <span>{t("gross_profit_lbl")} ({statement.grossMarginPercent.toFixed(1)}%)</span>
                    <span className="font-mono">${statement.grossProfit.toLocaleString()}</span>
                  </div>

                  {/* OPEX Category Breakdown */}
                  <div className="pt-2 space-y-1.5 pl-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t("opex_breakdown_lbl")}:
                    </span>
                    {Object.entries(statement.opexByCategory || {}).map(([cat, amt]) => (
                      <div key={cat} className="flex justify-between text-slate-400 text-[11px]">
                        <span>• {cat}</span>
                        <span className="font-mono text-slate-300">${amt.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between py-2 text-amber-400 font-semibold pl-4">
                    <span>{t("total_opex_lbl")}</span>
                    <span className="font-mono">-${statement.totalOpex.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-3 font-extrabold text-white text-sm bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 px-3 rounded-xl border border-indigo-500/30">
                    <span className={statement.netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {t("net_profit_lbl")}
                    </span>
                    <span className={`font-mono text-base ${statement.netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {statement.netIncome >= 0 ? "+" : ""}${statement.netIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Flow Card */}
              {cashFlow && (
                <div className="lg:col-span-5 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      {t("cash_flow_title")}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {t("cash_flow_subtitle")}
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <ArrowDownLeft className="w-4 h-4" /> {t("total_inflows")}:
                          </span>
                          <span className="font-bold text-white text-sm">+${cashFlow.totalInflows.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-[11px] text-slate-400 pl-5">
                          <div className="flex justify-between">
                            <span>{t("operating_inflows")}:</span>
                            <span className="font-mono text-slate-300">${cashFlow.operatingInflows.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("debt_collections")}:</span>
                            <span className="font-mono text-slate-300">${cashFlow.debtCollections.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                            <ArrowUpRight className="w-4 h-4" /> {t("total_outflows")}:
                          </span>
                          <span className="font-bold text-rose-400 text-sm">-${cashFlow.totalOutflows.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-[11px] text-slate-400 pl-5">
                          <div className="flex justify-between">
                            <span>{t("operating_outflows")}:</span>
                            <span className="font-mono text-slate-300">${cashFlow.operatingOutflows.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("supplier_payments")}:</span>
                            <span className="font-mono text-slate-300">${cashFlow.supplierPayments.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{t("net_cash_flow")}:</span>
                          <span className={`text-base font-bold font-mono ${cashFlow.netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {cashFlow.netCashFlow >= 0 ? "+" : ""}${cashFlow.netCashFlow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Valuation and Debts quick widget */}
                  {valuation && debtSummary && (
                    <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-indigo-400" /> {t("inventory_valuation_lbl")}:
                        </span>
                        <span className="font-bold text-white">${valuation.totalInventoryCostValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Hourglass className="w-3.5 h-3.5 text-amber-400" /> {t("customer_debts_lbl")}:
                        </span>
                        <span className="font-bold text-emerald-400">${debtSummary.totalCustomerDebt.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
