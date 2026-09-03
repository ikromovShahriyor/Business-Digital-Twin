"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { AuditLog } from "@/types";
import { ShieldAlert, Activity, User } from "lucide-react";

export default function AuditPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t("audit_logs_title")}</h1>
          <p className="text-xs text-slate-400">{t("audit_logs_subtitle")}</p>
        </div>

        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t("actions")}</th>
                  <th className="py-3.5 px-4">{t("entity_lbl")}</th>
                  <th className="py-3.5 px-4">{t("user_lbl")}</th>
                  <th className="py-3.5 px-4">{t("ip_address_lbl")}</th>
                  <th className="py-3.5 px-4">{t("timestamp_lbl")}</th>
                  <th className="py-3.5 px-4">{t("details_lbl")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {t("empty_audit")}
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px]">
                          {l.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{l.entityName}</td>
                      <td className="py-3 px-4 text-slate-300">{l.userEmail}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{l.ipAddress || "127.0.0.1"}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(l.createdAtUtc).toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                        {l.newValuesJson || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
