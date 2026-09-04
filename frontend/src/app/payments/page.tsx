"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useI18n } from "@/lib/i18n";
import { Payment, Branch } from "@/types";
import { api } from "@/lib/api";
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Loader2,
  CreditCard
} from "lucide-react";

export default function PaymentsPage() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    branchId: "",
    type: 1, // 1: InflowSale, 2: InflowDebtCollection, 3: OutflowExpense, 4: OutflowPurchase, 5: OutflowDebtPayment
    amount: 0,
    paymentMethod: "Cash",
    payerOrPayee: "",
    transactionReference: "",
    notes: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const typeNum = typeFilter !== "all" ? Number(typeFilter) : undefined;
      const [paymentsData, branchesData] = await Promise.all([
        api.getPayments(typeNum),
        api.getBranches(),
      ]);
      setPayments(paymentsData);
      setBranches(branchesData);
      if (branchesData.length > 0 && !formData.branchId) {
        setFormData((prev) => ({ ...prev, branchId: branchesData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPayment({
        ...formData,
        amount: Number(formData.amount),
        type: Number(formData.type),
      });

      setIsModalOpen(false);
      setFormData({
        branchId: branches[0]?.id || "",
        type: 1,
        amount: 0,
        paymentMethod: "Cash",
        payerOrPayee: "",
        transactionReference: "",
        notes: "",
      });
      loadData();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const inflows = payments
    .filter((p) => String(p.type).includes("Inflow") || p.type === 1 || p.type === 2)
    .reduce((sum, p) => sum + p.amount, 0);

  const outflows = payments
    .filter((p) => String(p.type).includes("Outflow") || p.type === 3 || p.type === 4 || p.type === 5)
    .reduce((sum, p) => sum + p.amount, 0);

  const netCash = inflows - outflows;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
              <span>{t("payments")}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t("cash_flow")}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t("add_new")}</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("node_inflow")}</span>
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">+${inflows.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{t("sales")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("expenses")}</span>
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400 mt-2">-${outflows.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{t("monthly_opex")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("node_net_margin")}</span>
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 ${netCash >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {netCash >= 0 ? "+" : ""}${netCash.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t("cash_runway")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">{t("filter_by_category")}</option>
            <option value="1">{t("node_inflow")}: {t("sales")}</option>
            <option value="2">{t("node_inflow")}: {t("receivable_type")}</option>
            <option value="3">{t("expenses")}: {t("monthly_opex")}</option>
            <option value="4">{t("expenses")}: {t("purchases")}</option>
            <option value="5">{t("expenses")}: {t("payable_type")}</option>
          </select>
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-card border border-slate-800 text-slate-400">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-medium">{t("empty_payments")}</p>
          </div>
        ) : (
          <div className="rounded-xl glass-card border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t("invoice_no")}</th>
                    <th className="py-3 px-4">{t("category")}</th>
                    <th className="py-3 px-4">{t("branch")}</th>
                    <th className="py-3 px-4">{t("customer")} / {t("supplier")}</th>
                    <th className="py-3 px-4">{t("payment_method_lbl")}</th>
                    <th className="py-3 px-4">{t("date")}</th>
                    <th className="py-3 px-4 text-right">{t("sum_amount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => {
                    const isInflow = String(p.type).includes("Inflow") || p.type === 1 || p.type === 2;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                          {p.transactionReference || "TRX-AUTO"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isInflow
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {isInflow ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {isInflow ? t("node_inflow") : t("expenses")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {p.branchName || "HQ-01"}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          {p.payerOrPayee || "—"}
                          {p.notes && <span className="block text-[10px] text-slate-500 font-normal">{p.notes}</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(p.paymentDateUtc).toLocaleDateString()} {new Date(p.paymentDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-bold text-sm ${isInflow ? "text-emerald-400" : "text-rose-400"}`}>
                          {isInflow ? "+" : "-"}${p.amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Payment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700/80 p-5 sm:p-6 shadow-2xl animate-fade-in my-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-4">
                Yangi Kassa Orderi / To'lov Yaratish
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">To'lov Turi *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Kirim: To'g'ridan-to'g'ri Savdo Tushumi</option>
                    <option value={2}>Kirim: Nasiya Qarz Undiruvi</option>
                    <option value={3}>Chiqim: Operatsion Xarajat</option>
                    <option value={4}>Chiqim: Ta'minot Xaridi To'lovi</option>
                    <option value={5}>Chiqim: Yetkazib Beruvchiga Qarz To'lovi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Filial *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Summa ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">To'lov Usuli</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Cash">Naqd pul</option>
                      <option value="Card">Plastik karta</option>
                      <option value="BankTransfer">Bank hisob raqam</option>
                      <option value="Payme">Payme / Click</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kontragent</label>
                    <input
                      type="text"
                      value={formData.payerOrPayee}
                      onChange={(e) => setFormData({ ...formData, payerOrPayee: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Kimdan / Kimga"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Izoh</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Masalan: Kassa kirim orderi #102"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                  >
                    Tranzaksiyani Saqlash
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
