"use client";

import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  variant?: "indigo" | "emerald" | "amber" | "cyan" | "rose" | "purple";
  badge?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "indigo",
  badge,
}: StatCardProps) {
  const variantStyles = {
    indigo: "border-indigo-500/20 text-indigo-400 bg-indigo-500/10 shadow-indigo-500/5",
    emerald: "border-emerald-500/20 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/5",
    amber: "border-amber-500/20 text-amber-400 bg-amber-500/10 shadow-amber-500/5",
    cyan: "border-cyan-500/20 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/5",
    rose: "border-rose-500/20 text-rose-400 bg-rose-500/10 shadow-rose-500/5",
    purple: "border-purple-500/20 text-purple-400 bg-purple-500/10 shadow-purple-500/5",
  };

  const isPositive = trend && trend.value > 0;
  const isNeutral = trend && trend.value === 0;

  return (
    <div className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient accent */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${
          variant === "emerald" ? "bg-emerald-500" :
          variant === "cyan" ? "bg-cyan-500" :
          variant === "amber" ? "bg-amber-500" :
          variant === "rose" ? "bg-rose-500" : "bg-indigo-500"
        }`}
      />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
        {trend && (
          <div className="flex items-center gap-1 font-medium">
            {isNeutral ? (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span
              className={
                isNeutral
                  ? "text-slate-400"
                  : isPositive
                  ? "text-emerald-400"
                  : "text-rose-400"
              }
            >
              {isPositive ? `+${trend.value}%` : `${trend.value}%`}
            </span>
            {trend.label && (
              <span className="text-slate-500 text-[11px] ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {subtitle && !trend && (
          <span className="text-slate-400 text-xs">{subtitle}</span>
        )}

        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
