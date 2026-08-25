"use client";

import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { AdvisorAnalysis, AdvisorChatResponse } from "@/types";
import {
  Sparkles,
  Send,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Bot,
  User
} from "lucide-react";

interface Message {
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  isGrounded?: boolean;
}

export function AdvisorTerminal() {
  const { t, language } = useI18n();
  const [analysis, setAnalysis] = useState<AdvisorAnalysis | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDiagnostics();
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await api.getDiagnostics(language);
      setAnalysis(res);
      // Seed initial advisor greeting
      setMessages([
        {
          sender: "advisor",
          text: res.executiveSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isGrounded: true,
        },
      ]);
    } catch {
      // Ignore
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const handleSendMessage = async (customQuery?: string) => {
    const q = customQuery || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputQuery("");
    setLoading(true);

    try {
      const res: AdvisorChatResponse = await api.chatWithAdvisor(q, undefined, language);
      const botMsg: Message = {
        sender: "advisor",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isGrounded: res.groundedInRealData,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const errMsg: Message = {
        sender: "advisor",
        text: `Error connecting to advisor: ${e.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    language === "uz" ? "🏢 Filiallarim bo'yicha tahlil qanday?" : (language === "ru" ? "🏢 Анализ по 2 филиалам" : "🏢 Branch Network Analysis"),
    language === "uz" ? "👥 Xodimlarim samaradorligi va maoshlar qanday?" : (language === "ru" ? "👥 Эффективность сотрудников и ФОТ" : "👥 Staff & Payroll Efficiency"),
    language === "uz" ? "👑 VIP mijozlarim kimlar va qancha xarid qilishgan?" : (language === "ru" ? "👑 VIP клиенты и объем покупок" : "👑 VIP Clients & Spend"),
    language === "uz" ? "📦 Eng yuqori foyda keltiruvchi tovarlar qaysilar?" : (language === "ru" ? "📦 Топ высокомаржинальных товаров" : "📦 Top Margin Products"),
    language === "uz" ? "🔮 Narxlarni 10% oshirsam nima bo'ladi?" : (language === "ru" ? "🔮 Что будет, если поднять цены на 10%?" : "🔮 What if I increase prices by 10%?"),
    language === "uz" ? "📊 Moliyaviy ko'rsatkichlar va zararsizlik nuqtasi qanday?" : (language === "ru" ? "📊 Рентабельность и точка безубыточности" : "📊 Financial Health & Breakeven"),
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              AI Strategic Diagnostic
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            {t("advisor_title")}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {t("advisor_subtitle")}
          </p>
        </div>

        {analysis && (
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {t("health_score")}
              </span>
              <p className="text-lg font-black text-cyan-400">
                {analysis.overallHealthScore} / 100
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              AI
            </div>
          </div>
        )}
      </div>

      {/* Diagnostic Findings Grid */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.diagnostics.map((d, i) => (
            <div
              key={i}
              className={`glass-panel p-4 rounded-xl space-y-2 border ${
                d.severity === "CRITICAL"
                  ? "border-rose-500/30 bg-rose-950/10"
                  : d.severity === "WARNING"
                  ? "border-amber-500/30 bg-amber-950/10"
                  : "border-emerald-500/30 bg-emerald-950/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {d.category}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    d.severity === "CRITICAL"
                      ? "text-rose-400"
                      : d.severity === "WARNING"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {d.severity}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{d.title}</h4>
              <p className="text-[11px] text-slate-300">{d.finding}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{d.actionableRecommendation}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Advisor Terminal */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden flex flex-col h-[520px]">
        {/* Terminal Header */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">
              Interactive Advisor Terminal
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>{t("factual_grounding")}</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line"
                }`}
              >
                <p>{m.text}</p>
                <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400/80">
                  <span>{m.timestamp}</span>
                  {m.isGrounded && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Grounded
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-5 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-slate-300 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            placeholder={t("chat_placeholder")}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
