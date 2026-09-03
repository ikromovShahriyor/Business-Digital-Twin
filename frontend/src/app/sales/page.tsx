"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Sale, Branch, Product, Customer, Employee } from "@/types";
import {
  Receipt,
  Plus,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  UserCheck,
  Building,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function SalesPage() {
  const { t } = useI18n();
  const [sales, setSales] = useState<Sale[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    branchId: "",
    customerId: "",
    employeeId: "",
    channel: 1, // 1: DirectRetail, 2: Wholesale, 3: OnlineECommerce, 4: B2BContract
    paymentMethod: "Card",
    discountAmount: 0,
    paidAmount: 0,
    debtDueDateUtc: "",
    notes: "",
    items: [{ productId: "", quantity: 1, unitPrice: 0 }],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, bList, pList, cList, eList] = await Promise.all([
        api.getSales(),
        api.getBranches(),
        api.getProducts(),
        api.getCustomers(),
        api.getEmployees(),
      ]);
      setSales(sList);
      setBranches(bList);
      setProducts(pList);
      setCustomers(cList);
      setEmployees(eList);

      if (bList.length > 0) setFormData((prev) => ({ ...prev, branchId: bList[0].id }));
      if (pList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          items: [{ productId: pList[0].id, quantity: 1, unitPrice: pList[0].sellingPrice }],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const newItems = [...formData.items];
    newItems[index] = {
      productId,
      quantity: newItems[index].quantity || 1,
      unitPrice: prod ? prod.sellingPrice : 0,
    };
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setFormData({
      ...formData,
      items: [...formData.items, { productId: products[0].id, quantity: 1, unitPrice: products[0].sellingPrice }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const subTotal = formData.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalAmount = Math.max(0, subTotal - formData.discountAmount);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSale({
        ...formData,
        customerId: formData.customerId || undefined,
        employeeId: formData.employeeId || undefined,
        discountAmount: Number(formData.discountAmount),
        paidAmount: Number(formData.paidAmount),
        debtDueDateUtc: formData.debtDueDateUtc || undefined,
      });

      setShowModal(false);
      setFormData((prev) => ({
        ...prev,
        discountAmount: 0,
        paidAmount: 0,
        notes: "",
        items: [{ productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.sellingPrice || 0 }],
      }));
      loadData();
    } catch (err: any) {
      alert(err.message || "Sotuvni yaratishda xatolik");
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = sales.reduce((sum, s) => sum + (s.totalCostAmount || 0), 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.netProfitAmount || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Receipt className="w-7 h-7 text-indigo-400" />
              Sotuvlar & Buyurtmalar Jurnali
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {t("sales")}
            </p>
          </div>
          <button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                paidAmount: products[0]?.sellingPrice || 0,
              }));
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{t("new_sale_btn")}</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("total_revenue_stat")}</span>
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{sales.length} {t("invoice_no")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("total_cogs_stat")}</span>
              <CreditCard className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400 mt-2">${totalCost.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{t("sold_goods_value")}</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("total_gross_profit_stat")}</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">+${totalProfit.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{t("margin_label")}: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>

        {/* Sales Table */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-card border border-slate-800 text-slate-400">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-medium">{t("empty_sales")}</p>
          </div>
        ) : (
          <div className="rounded-xl glass-card border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t("invoice_no")}</th>
                    <th className="py-3 px-4">{t("branch")}</th>
                    <th className="py-3 px-4">{t("customer")}</th>
                    <th className="py-3 px-4">{t("responsible_employee")}</th>
                    <th className="py-3 px-4">{t("product_items")}</th>
                    <th className="py-3 px-4 text-right">{t("sum_amount")}</th>
                    <th className="py-3 px-4 text-right">{t("paid_amount")}</th>
                    <th className="py-3 px-4 text-right">{t("profit_amount")}</th>
                    <th className="py-3 px-4">{t("status_col")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                        {s.saleNumber}
                        <span className="block text-[10px] text-slate-500 font-normal font-sans">
                          {new Date(s.saleDateUtc).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{s.branchName}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{s.customerName || t("guest_retail")}</td>
                      <td className="py-3.5 px-4 text-slate-400">{s.employeeName || "—"}</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {s.items?.map((item, idx) => (
                            <span key={idx} className="block text-[11px] text-slate-300">
                              {item.productName} × <strong className="text-white">{item.quantity}</strong> (${item.unitPrice})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">${s.totalAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">${s.paidAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">+${(s.netProfitAmount || Math.max(0, s.totalAmount - (s.totalCostAmount || 0))).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          (s.remainingAmount || (s.totalAmount - s.paidAmount) || 0) > 0
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {(s.remainingAmount || (s.totalAmount - s.paidAmount) || 0) > 0 ? t("on_credit_debt") : t("fully_paid")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl glass-panel border border-slate-700/80 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-4">
                Yangi Sotuv Fakturasi Yaratish
              </h2>
              <form onSubmit={handleCreate} className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-3">
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mijoz</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Chakana / Mehmon</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.segment})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mas'ul Sotuvchi</label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Tanlanmagan</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.fullName} ({e.position})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sotilayotgan Mahsulotlar
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Qo'shish
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} (Narx: ${p.sellingPrice})</option>
                          ))}
                        </select>

                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].quantity = Number(e.target.value);
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white text-right"
                            placeholder="Soni"
                          />
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].unitPrice = Number(e.target.value);
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white text-right"
                            placeholder="Narxi"
                          />
                        </div>

                        <div className="w-24 text-right font-mono text-xs font-bold text-emerald-400">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={formData.items.length <= 1}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Chegirma ($)</label>
                    <input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">To'lov Usuli</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Card">Bank Kartasi</option>
                      <option value="Cash">Naqd Pul</option>
                      <option value="BankTransfer">Bank O'tkazmasi</option>
                      <option value="Payme">Payme / Click</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">To'langan Summa ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                </div>

                {/* Total Preview */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Jami Hisob-Faktura Qiymati:</span>
                    <span className="text-lg font-bold text-white">${totalAmount.toLocaleString()}</span>
                  </div>
                  {totalAmount > formData.paidAmount && (
                    <div className="text-right">
                      <span className="text-amber-400 block font-semibold">Nasiyaga Qolgan Qarz:</span>
                      <span className="text-base font-bold text-amber-400">
                        ${Math.max(0, totalAmount - formData.paidAmount).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                  >
                    Sotuvni Rasmiylashtirish & Ombordan Chiqarish
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
