"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { InventoryItem, Branch, StockMovement, StockValuation } from "@/types";
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Building,
  History,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Loader2
} from "lucide-react";

export default function InventoryPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [valuation, setValuation] = useState<StockValuation | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [bList, invList, movList, valData] = await Promise.all([
        api.getBranches(),
        api.getInventory(selectedBranch || undefined, search || undefined),
        api.getStockMovements(selectedBranch || undefined),
        api.getStockValuation(),
      ]);
      setBranches(bList);
      setItems(invList);
      setMovements(movList);
      setValuation(valData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, search]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      await api.adjustStock({
        branchId: adjustItem.branchId,
        productId: adjustItem.productId,
        quantityChange: Number(adjustQty),
        reason: adjustReason || "Qo'lda kiritilgan o'zgarish",
      });
      setAdjustItem(null);
      setAdjustReason("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const totalCostValuation = items.reduce((sum, i) => sum + (i.totalValuation || i.quantityOnHand * (i.unitCost || 0)), 0);
  const totalUnits = items.reduce((sum, i) => sum + i.quantityOnHand, 0);
  const lowStockCount = items.filter((i) => i.isLowStock).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Boxes className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
              <span>{t("inventory_title")}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t("inventory_subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:w-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-slate-200 focus:outline-none"
              >
                <option value="">{t("filter_by_branch")}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("stock_valuation_card")}</span>
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              ${(valuation?.totalInventoryCostValue || totalCostValuation).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t("cost_value")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("stock_units_card")}</span>
              <Boxes className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">
              {(valuation?.totalUnitsInStock || totalUnits).toLocaleString()} {t("pcs")}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t("all")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("stock_low_card")}</span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2">
              {valuation?.lowStockProductCount || lowStockCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t("low_stock_alerts")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("branches")}</span>
              <Building className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400 mt-2">
              {branches.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t("branches_subtitle")}</p>
          </div>
        </div>

        {/* Tab Toggle & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex gap-4 text-sm font-semibold">
            <button
              onClick={() => setActiveTab("stock")}
              className={`pb-2 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "stock"
                  ? "border-indigo-500 text-indigo-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>{t("tab_stock")}</span>
            </button>

            <button
              onClick={() => setActiveTab("movements")}
              className={`pb-2 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "movements"
                  ? "border-indigo-500 text-indigo-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t("tab_movements")}</span>
            </button>
          </div>

          {activeTab === "stock" && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search_placeholder")}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : activeTab === "stock" ? (
          <div className="rounded-xl glass-card border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t("product_items")}</th>
                    <th className="py-3 px-4">{t("branch")}</th>
                    <th className="py-3 px-4 text-right">{t("stock_quantity")}</th>
                    <th className="py-3 px-4 text-right">{t("cost_price")}</th>
                    <th className="py-3 px-4 text-right">{t("sum_amount")}</th>
                    <th className="py-3 px-4 text-right">{t("min_stock_alert")}</th>
                    <th className="py-3 px-4 text-center">{t("status_col")}</th>
                    <th className="py-3 px-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {item.productName}
                        {item.productSku && <span className="block text-[10px] font-mono text-slate-500 font-normal">{item.productSku}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {item.branchName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                        {item.quantityOnHand}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        ${item.unitCost || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-300">
                        ${(item.totalValuation || item.quantityOnHand * (item.unitCost || 0)).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {item.reorderPoint}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" /> {t("low_stock_alerts")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {t("active")}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustQty(10);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          {t("edit")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl glass-card border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t("date")}</th>
                    <th className="py-3 px-4">{t("movement_type")}</th>
                    <th className="py-3 px-4">{t("branch")}</th>
                    <th className="py-3 px-4">{t("product_items")}</th>
                    <th className="py-3 px-4 text-right">{t("quantity_change")}</th>
                    <th className="py-3 px-4 text-right">{t("reorder_point")}</th>
                    <th className="py-3 px-4 text-right">{t("stock_quantity")}</th>
                    <th className="py-3 px-4">{t("notes")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(m.movementDateUtc).toLocaleDateString()} {new Date(m.movementDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isPositive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {String(m.type)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {m.branchName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {m.productName}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? "+" : ""}{m.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                          {m.previousQuantity}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {m.newQuantity}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {m.referenceNumber && <span className="font-mono text-indigo-300 block font-semibold">{m.referenceNumber}</span>}
                          <span>{m.reason || "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {adjustItem && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700/80 p-5 sm:p-6 shadow-2xl animate-fade-in my-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-1">
                {t("adjust_stock_modal_title")}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {adjustItem.productName} ({adjustItem.branchName})
              </p>

              <form onSubmit={handleAdjustSubmit} className="space-y-4 text-sm">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">{t("stock_quantity")}:</span>
                  <span className="font-bold text-white">{adjustItem.quantityOnHand} {t("pcs")}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t("quantity_change")} *</label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {t("stock_quantity")}: {Math.max(0, adjustItem.quantityOnHand + Number(adjustQty))} {t("pcs")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t("reason")} *</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAdjustItem(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {t("cancel_btn")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                  >
                    {t("save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
