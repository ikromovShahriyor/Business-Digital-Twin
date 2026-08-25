"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Purchase, Supplier, Branch, Product } from "@/types";
import { api } from "@/lib/api";
import {
  ShoppingCart,
  Plus,
  Search,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Purchase Form
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BankTransfer");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; unitCost: number }>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [purchasesData, suppliersData, branchesData, productsData] = await Promise.all([
        api.getPurchases(),
        api.getSuppliers(),
        api.getBranches(),
        api.getProducts(),
      ]);
      setPurchases(purchasesData);
      setSuppliers(suppliersData);
      setBranches(branchesData);
      setProducts(productsData);

      if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
      if (suppliersData.length > 0) setSelectedSupplier(suppliersData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      { productId: products[0].id, quantity: 10, unitCost: products[0].costPrice },
    ]);
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;

    if (field === "productId") {
      const prod = products.find((p) => p.id === val);
      if (prod) updated[index].unitCost = prod.costPrice;
    }

    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalPurchaseCost = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Kamida 1 ta mahsulot kiriting");
      return;
    }

    try {
      await api.createPurchase({
        supplierId: selectedSupplier,
        branchId: selectedBranch,
        paymentMethod,
        paidAmount: Number(paidAmount),
        notes,
        items,
      });

      setIsModalOpen(false);
      setItems([]);
      setPaidAmount(0);
      setNotes("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOutstanding = purchases.reduce((sum, p) => sum + p.outstandingAmount, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-indigo-400" />
              Ta'minot Xaridlari (Purchases)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Yetkazib beruvchilardan mahsulot kirimi, hisob-fakturalar va ombor to'ldirish
            </p>
          </div>
          <button
            onClick={() => {
              if (items.length === 0 && products.length > 0) {
                setItems([{ productId: products[0].id, quantity: 10, unitCost: products[0].costPrice }]);
              }
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Xarid Hujjati</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jami Xaridlar Summasi</span>
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{purchases.length} ta xarid hujjati</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To'langan Summa</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">${totalPaid.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Avans va to'liq to'lovlar</p>
          </div>

          <div className="p-4 rounded-xl glass-card border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Qarz Qoldig'i (Qarzdorlik)</span>
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400 mt-2">${totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Yetkazib beruvchilarga to'lanishi lozim</p>
          </div>
        </div>

        {/* Purchases Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-card border border-slate-800 text-slate-400">
            <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-medium">Hozircha ta'minot xaridlari mavjud emas</p>
          </div>
        ) : (
          <div className="rounded-xl glass-card border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Hujjat #</th>
                    <th className="py-3 px-4">Yetkazib Beruvchi</th>
                    <th className="py-3 px-4">Qabul Qilgan Filial</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4">Mahsulotlar</th>
                    <th className="py-3 px-4 text-right">Jami Summa</th>
                    <th className="py-3 px-4 text-right">To'langan</th>
                    <th className="py-3 px-4 text-right">Qarz Qoldiq</th>
                    <th className="py-3 px-4">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                        {p.purchaseNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {p.supplierName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {p.branchName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(p.purchaseDateUtc).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {p.items?.map((item, idx) => (
                            <span key={idx} className="block text-[11px] text-slate-300">
                              {item.productName} × <strong className="text-white">{item.quantity}</strong> (${item.unitCost})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        ${p.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">
                        ${p.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        <span className={p.outstandingAmount > 0 ? "text-rose-400" : "text-slate-500"}>
                          ${p.outstandingAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Qabul qilindi
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
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl glass-panel border border-slate-700/80 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-4">
                Yangi Ta'minot Xarid Hujjati Yaratish
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Yetkazib Beruvchi *</label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Qabul Qiluvchi Filial *</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Kirim Mahsulotlari
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
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                        >
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>{prod.name} (Tannarx: ${prod.costPrice})</option>
                          ))}
                        </select>

                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                            placeholder="Miqdor"
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white text-right"
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(idx, "unitCost", Number(e.target.value))}
                            placeholder="Tannarx ($)"
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white text-right"
                          />
                        </div>

                        <div className="w-24 text-right font-mono text-xs font-bold text-indigo-300">
                          ${(item.quantity * item.unitCost).toLocaleString()}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Jami Xarid Qiymati:</span>
                    <span className="text-base font-bold text-white">${totalPurchaseCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">To'lov Usuli</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="BankTransfer">Bank o'tkazmasi (Hisob raqam)</option>
                      <option value="Cash">Naqd pul</option>
                      <option value="Card">Korporativ Karta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Hozir To'langan Summa ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="To'liq yoki avans miqdori"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Qolgan summa (${Math.max(0, totalPurchaseCost - paidAmount).toLocaleString()}) avtomatik Supplier Qarziga yoziladi.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Izoh / Shartnoma Raqami</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Masalan: Shartnoma #PO-941 asosida"
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
                    Xaridni Tasdiqlash & Omborga Kirim Qilish
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
