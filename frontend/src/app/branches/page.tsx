"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Branch } from "@/types";
import { GitBranch, Plus, Trash2, MapPin, Phone, User, DollarSign } from "lucide-react";

export default function BranchesPage() {
  const { t } = useI18n();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    managerName: "",
    isMainBranch: false,
    monthlyRent: 0,
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const list = await api.getBranches();
      setBranches(list);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBranch(formData);
      setShowModal(false);
      setFormData({
        name: "",
        code: "",
        address: "",
        phone: "",
        managerName: "",
        isMainBranch: false,
        monthlyRent: 0,
      });
      loadBranches();
    } catch (err: any) {
      alert(err.message || "Failed to create branch");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{t("branches_title")}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t("branches_subtitle")}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t("new_branch_btn")}</span>
          </button>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => (
              <div key={b.id} className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <GitBranch className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{b.name}</h3>
                      <span className="text-[10px] font-mono text-indigo-400">{b.code}</span>
                    </div>
                  </div>
                  {b.isMainBranch && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      HQ
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  {b.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </div>
                  )}
                  {b.managerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{b.managerName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span>{t("monthly_rent")}:</span>
                    <span className="font-bold text-slate-200">${b.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("workforce")}:</span>
                    <span className="font-bold text-slate-200">{b.employeeCount} {t("staff_label")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-700 w-full max-w-md space-y-4 my-auto max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-100">{t("create_branch_modal_title")}</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t("branch_name")}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                    placeholder="Chilonzor Filiali"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">{t("branch_code")}</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                      placeholder="BR-03"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">{t("monthly_rent")} ($)</label>
                    <input
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t("branch_address")}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                    placeholder="Amir Temur 12, Toshkent"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t("branch_phone")}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                    placeholder="+998 71 200 0000"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t("branch_manager")}</label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                    placeholder="Rustam Karimov"
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
