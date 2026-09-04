"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard,
  Cpu,
  Sliders,
  Sparkles,
  Menu
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const coreTabs = [
    {
      href: "/dashboard",
      label: t("overview"),
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/digital-twin",
      label: t("digital_twin"),
      icon: Cpu,
      active: pathname === "/digital-twin",
      badge: "Live",
    },
    {
      href: "/simulator",
      label: t("scenario_simulator"),
      icon: Sliders,
      active: pathname === "/simulator",
    },
    {
      href: "/advisor",
      label: t("ai_advisor"),
      icon: Sparkles,
      active: pathname === "/advisor",
    },
  ];

  const isOtherSection = !coreTabs.some((tab) => tab.active);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {coreTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                tab.active
                  ? "text-indigo-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
            >
              {tab.active && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${tab.active ? "scale-110 text-indigo-400" : ""}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMenu}
          aria-label="Open Navigation Menu"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            isOtherSection
              ? "text-cyan-400 font-semibold"
              : "text-slate-400 hover:text-slate-200 active:scale-95"
          }`}
        >
          {isOtherSection && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
          <Menu className={`w-5 h-5 transition-transform ${isOtherSection ? "scale-110 text-cyan-400" : ""}`} />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
            {t("settings").length > 0 ? "Menu" : "Menu"}
          </span>
        </button>
      </div>
    </nav>
  );
}
