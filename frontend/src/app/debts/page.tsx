"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useI18n } from "@/lib/i18n";
import { DebtRecord, DebtSummary } from "@/types";
import { api } from "@/lib/api";
import {
  Hourglass,
  Plus,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Calendar
} from "lucide-react";

export default function DebtsPage() {
  const { t } = useI18n();
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"CustomerDebt" | "SupplierDebt">("CustomerDebt");
  const [isLoading, setIsLoading] = useState(true);

  // Pay Debt Modal State
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("BankTransfer");
  const [payNotes, setPayNotes] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const typeNum = activeTab === "CustomerDebt" ? 1 : 2;
      const [debtsData, summaryData] = await Promise.all([
        api.getDebts(typeNum),
        api.getDebtSummary(),
      ]);
      setDebts(debtsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;
    try {
      await api.payDebt({
        debtRecordId: selectedDebt.id,
        paymentAmount: Number(payAmount),
        paymentMethod: payMethod,
        notes: payNotes,
      });

      setSelectedDebt(null);
      setPayAmount(0);
      setPayNotes("");
      loadData();
    } catch (err: any) {
      alert(err.message || "To'lovda xatolik");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Hourglass className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
              <span>Nasiya va Qarzlar Boshqaruvi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Mijozlardan kutilayotgan nasiya mablag'lari (Receivables) va yetkazib beruvchilarga to'lanadigan qarzlar (Payables)
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl glass-card border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mijozlar Nasiyasi</span>
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-2">
                ${summary.totalCustomerDebt.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">Kutilayotgan tushum (Debitorlik)</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bizning Qarzimiz</span>
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-400 mt-2">
                ${summary.totalSupplierDebt.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">Kreditorlik majburiyatlari</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faol Nasiyalar Soni</span>
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {summary.activeCustomerDebtsCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">To'lov kutilayotgan mijozlar</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Muddati O'tgan</span>
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400 mt-2">
                {summary.overdueCustomerDebtsCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">Shoshilinch undirilishi lozim</p>
            </div>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 gap-3 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("CustomerDebt")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "CustomerDebt"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>{t("receivable_type")}</span>
          </button>

          <button
            onClick={() => setActiveTab("SupplierDebt")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "SupplierDebt"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>{t("payable_type")}</span>
          </button>
        </div>

        {/* Debts Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : debts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-card border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-3" />
            <p className="font-medium">{t("empty_debts")}</p>
          </div>
        ) : (
          <div className="rounded-xl glass-card border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t("debt_title")}</th>
                    <th className="py-3 px-4">{activeTab === "CustomerDebt" ? t("customer") : t("supplier")}</th>
                    <th className="py-3 px-4">{t("due_date")}</th>
                    <th className="py-3 px-4 text-right">{t("sum_amount")}</th>
                    <th className="py-3 px-4 text-right">{t("paid_amount")}</th>
                    <th className="py-3 px-4 text-right">{t("debt_title")}</th>
                    <th className="py-3 px-4">{t("status_col")}</th>
                    <th className="py-3 px-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {debts.map((d) => {
                    const isPaid = d.remainingAmount <= 0;
                    const isOverdue = !isPaid && d.dueDateUtc && new Date(d.dueDateUtc) < new Date();
                    return (
                      <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {d.title}
                          {d.notes && <span className="block text-[11px] text-slate-500 font-normal">{d.notes}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-indigo-300 font-medium">
                          {activeTab === "CustomerDebt" ? d.customerName || t("customer") : d.supplierName || t("supplier")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {d.dueDateUtc ? (
                            <span className={isOverdue ? "text-rose-400 font-bold flex items-center gap-1" : ""}>
                              {isOverdue && <AlertCircle className="w-3 h-3" />}
                              {new Date(d.dueDateUtc).toLocaleDateString()}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                          ${d.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">
                          ${d.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          <span className={d.remainingAmount > 0 ? (activeTab === "CustomerDebt" ? "text-amber-400" : "text-rose-400") : "text-slate-500"}>
                            ${d.remainingAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isPaid
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isOverdue
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {isPaid ? "To'langan" : isOverdue ? "Muddati O'tgan" : "Faol Nasiya"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isPaid && (
                            <button
                              onClick={() => {
                                setSelectedDebt(d);
                                setPayAmount(d.remainingAmount);
                              }}
                              className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs border border-indigo-500/40 transition-colors"
                            >
                              To'lov qilish
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pay Modal */}
        {selectedDebt && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700/80 p-5 sm:p-6 shadow-2xl animate-fade-in my-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-1">
                Qarz To'lovini Qabul Qilish / O'tkazish
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {selectedDebt.title} ({activeTab === "CustomerDebt" ? selectedDebt.customerName : selectedDebt.supplierName})
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4 text-sm">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Qolgan Qarz Miqdori:</span>
                  <span className="font-bold text-white">${selectedDebt.remainingAmount.toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">To'lov Summasi ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedDebt.remainingAmount}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">To'lov Usuli</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BankTransfer">Bank O'tkazmasi</option>
                    <option value="Cash">Naqd Pul</option>
                    <option value="Card">Bank Kartasi</option>
                    <option value="Payme">Payme / Click</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kvitansiya / Izoh</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Masalan: Kvitansiya #TRX-9481"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedDebt(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
                  >
                    To'lovni Saqlash
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
