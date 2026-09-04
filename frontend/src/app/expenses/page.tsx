"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Expense } from "@/types";
import { CreditCard, Plus, Calendar, Tag, DollarSign } from "lucide-react";

export default function ExpensesPage() {
  const { t } = useI18n();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 1, // Rent
    amount: 0,
    payee: "",
    description: "",
    paymentMethod: "BankTransfer",
    isRecurring: false,
    recurringFrequency: "Monthly",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const list = await api.getExpenses();
      setExpenses(list);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense(formData);
      setShowModal(false);
      loadExpenses();
    } catch (err: any) {
      alert(err.message || "Failed to log expense");
    }
  };

  const totalOpex = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{t("expenses_title")}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t("expenses_subtitle")}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t("new_expense_btn")}</span>
          </button>
        </div>

        {/* Total OPEX Banner */}
        <div className="glass-panel p-4 rounded-xl border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{t("monthly_opex")}</span>
              <p className="text-xl font-black text-slate-100">${totalOpex.toLocaleString()}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {expenses.length} {t("expenses")}
          </span>
        </div>

        {/* Expenses Table */}
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t("payee_vendor_lbl")}</th>
                  <th className="py-3.5 px-4">{t("category")}</th>
                  <th className="py-3.5 px-4">{t("notes")}</th>
                  <th className="py-3.5 px-4">{t("date")}</th>
                  <th className="py-3.5 px-4">{t("payment_method_lbl")}</th>
                  <th className="py-3.5 px-4 text-right">{t("sum_amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {t("empty_expenses")}
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-100">{e.payee}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{e.description || "—"}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(e.expenseDateUtc).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-300">{e.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                        ${e.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-700 w-full max-w-md space-y-4 my-auto max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-100">{t("log_expense_modal_title")}</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t("payee_vendor_lbl")}</label>
                  <input
                    type="text"
                    required
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">{t("category")}</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    >
                      <option value="1">{t("monthly_rent")}</option>
                      <option value="2">{t("payroll")}</option>
                      <option value="3">Marketing</option>
                      <option value="4">Utilities</option>
                      <option value="5">Software & SaaS</option>
                      <option value="6">Supplies</option>
                      <option value="7">Logistics</option>
                      <option value="8">Legal & Tax</option>
                      <option value="10">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">{t("amount")} ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t("description")}</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    {t("cancel_btn")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                  >
                    {t("save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
