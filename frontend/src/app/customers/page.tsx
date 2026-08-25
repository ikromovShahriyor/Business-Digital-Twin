"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Customer } from "@/types";
import {
  Users,
  Plus,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Search,
  Hourglass,
  Edit2,
  Trash2,
  Loader2
} from "lucide-react";

export default function CustomersPage() {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
    segment: "New" as any,
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const list = await api.getCustomers(search || undefined);
      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, {
          ...formData,
          isActive: true,
        });
      } else {
        await api.createCustomer(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        taxNumber: "",
        segment: "New",
      });
      loadCustomers();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      contactPerson: c.contactPerson || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      taxNumber: c.taxNumber || "",
      segment: c.segment,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteCustomer(id);
      loadCustomers();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-indigo-400" />
              Mijozlar Bazasi (Customers)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Mijozlar ro'yxati, LTV (jami xaridlari), nasiya qarzlari va segmentatsiyasi
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setFormData({
                name: "",
                contactPerson: "",
                email: "",
                phone: "",
                address: "",
                taxNumber: "",
                segment: "New",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Mijoz Qo'shish</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mijoz nomi, telefon yoki elektron pochta bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Customer Cards Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-card border border-slate-800 text-slate-400">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-medium">Mijozlar topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div key={c.id} className="p-5 rounded-xl glass-card border border-slate-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {c.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                        c.segment === "VIP" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        c.segment === "Regular" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                        "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}>
                        {c.segment} Segment
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                    {c.contactPerson && (
                      <div className="text-slate-300 font-medium">{c.contactPerson}</div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Jami Haridlari:</span>
                    <span className="font-bold text-emerald-400 font-mono">${c.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Nasiya Qarzi:</span>
                    <span className={`font-bold font-mono ${c.outstandingDebt > 0 ? "text-amber-400" : "text-slate-500"}`}>
                      ${(c.outstandingDebt || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 shadow-2xl animate-fade-in">
              <h3 className="text-base font-bold text-white mb-4">
                {editingCustomer ? "Mijozni Tahrirlash" : "Yangi Mijoz Qo'shish"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Mijoz / Tashkilot Nomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Masalan: Alpha Tech MCHJ"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Aloqa Shaxsi</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Menejer ismi"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Segment</label>
                    <select
                      value={formData.segment}
                      onChange={(e) => setFormData({ ...formData, segment: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="New">New</option>
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Telefon</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="+998 90 123 4567"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="client@org.uz"
                    />
                  </div>
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
                    {editingCustomer ? "Saqlash" : "Qo'shish"}
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
