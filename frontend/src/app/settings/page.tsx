"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Settings, Building2, Globe, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const { currentCompany } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t("settings_title")}</h1>
          <p className="text-xs text-slate-400">{t("settings_subtitle")}</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">{t("company_profile")}</h2>
              <p className="text-xs text-slate-400">{t("company_profile_subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t("company_name")}</label>
                <input
                  type="text"
                  defaultValue={currentCompany?.name || "Apex Retail & Tech Solutions"}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t("tax_number")}</label>
                <input
                  type="text"
                  defaultValue={currentCompany?.taxNumber || "TAX-994821"}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t("industry")}</label>
                <input
                  type="text"
                  defaultValue={currentCompany?.industry || "Retail / Commerce"}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t("default_tax_rate")}</label>
                <input
                  type="number"
                  defaultValue={12}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t("address")}</label>
              <input
                type="text"
                defaultValue={currentCompany?.address || "100 Innovation Blvd, Tashkent"}
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t("phone")}</label>
                <input
                  type="text"
                  defaultValue={currentCompany?.phone || "+998 71 200 0000"}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t("website")}</label>
                <input
                  type="text"
                  defaultValue={currentCompany?.website || "https://apex-twin.uz"}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {saved && (
                <span className="text-xs font-bold text-emerald-400 animate-pulse">
                  {t("saved_success")}
                </span>
              )}
              <button
                type="submit"
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{t("update_settings_btn")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
