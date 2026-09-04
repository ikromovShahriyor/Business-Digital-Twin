"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import {
  SimulationResult,
  SimulateScenarioParams,
  ScenarioSummary,
} from "@/types";
import {
  Sliders,
  Play,
  Save,
  Trash2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export function ScenarioStudio() {
  const { t } = useI18n();
  const [params, setParams] = useState<SimulateScenarioParams>({
    scenarioName: "Expansion & Price Optimization",
    description: "Simulating +10% price, +1 branch, and $2k marketing budget",
    priceChangePercent: 10,
    priceElasticity: -1.2,
    expectedSalesVolumeChangePercent: 0,
    employeeHeadcountChange: 2,
    averageNewEmployeeSalary: 1500,
    existingEmployeeSalaryChangePercent: 5,
    newBranchesCount: 1,
    capexPerNewBranch: 35000,
    monthlyOpexPerNewBranch: 3200,
    expectedMonthlyRevenuePerNewBranch: 12000,
    marketingBudgetMonthly: 2000,
    marketingCustomerAcquisitionCost: 50,
    marketingRevenuePerAcquiredCustomer: 120,
    inventoryBufferTargetPercent: 0,
    projectionMonths: 12,
    saveScenario: false,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<ScenarioSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSaved();
    handleRunSimulation();
  }, []);

  const loadSaved = async () => {
    try {
      const list = await api.getSavedScenarios();
      setSavedScenarios(list);
    } catch {
      // Ignore
    }
  };

  const handleRunSimulation = async (save = false) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await api.simulateScenario({ ...params, saveScenario: save });
      setResult(res);
      if (save) {
        setSaveSuccess(true);
        loadSaved();
      }
    } catch (e: any) {
      alert(`Simulation Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    if (confirm("Delete this saved scenario?")) {
      await api.deleteScenario(id);
      loadSaved();
    }
  };

  const handleLoadSaved = async (id: string) => {
    setLoading(true);
    try {
      const s = await api.getScenarioById(id);
      setResult(s);
      setParams((prev) => ({
        ...prev,
        scenarioName: s.scenarioName,
      }));
    } catch (e: any) {
      alert(`Error loading scenario: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Digital Twin Sandbox
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            {t("simulator_title")}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            {t("simulator_subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleRunSimulation(false)}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? "Calculating..." : t("run_simulation_btn")}</span>
          </button>
          <button
            onClick={() => handleRunSimulation(true)}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? "Saved!" : t("save_scenario_btn")}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Parameters (Left) vs Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Levers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {t("scenario_params_title")}
            </h3>

            {/* Scenario Name & Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300">
                {t("scenario_name")}
              </label>
              <input
                type="text"
                value={params.scenarioName}
                onChange={(e) =>
                  setParams({ ...params, scenarioName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            {/* Lever 1: Price Change % */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {t("price_change_pct")}
                </span>
                <span className="font-bold text-indigo-400">
                  {params.priceChangePercent > 0
                    ? `+${params.priceChangePercent}%`
                    : `${params.priceChangePercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="1"
                value={params.priceChangePercent}
                onChange={(e) =>
                  setParams({
                    ...params,
                    priceChangePercent: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-50% ({t("discounts_lbl")})</span>
                <span>0%</span>
                <span>+100% ({t("premium_lbl")})</span>
              </div>
            </div>

            {/* Lever 2: Headcount & Salaries */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {t("employee_headcount")}
                </span>
                <span className="font-bold text-cyan-400">
                  {(params.employeeHeadcountChange ?? 0) > 0
                    ? `+${params.employeeHeadcountChange} ${t("staff_label")}`
                    : `${params.employeeHeadcountChange ?? 0} ${t("staff_label")}`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="20"
                step="1"
                value={params.employeeHeadcountChange ?? 0}
                onChange={(e) =>
                  setParams({
                    ...params,
                    employeeHeadcountChange: parseInt(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {t("new_emp_salary")} ($)
                  </span>
                  <input
                    type="number"
                    value={params.averageNewEmployeeSalary ?? 0}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        averageNewEmployeeSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 rounded glass-input text-xs mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {t("salary_change_pct")}
                  </span>
                  <input
                    type="number"
                    value={params.existingEmployeeSalaryChangePercent ?? 0}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        existingEmployeeSalaryChangePercent:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 rounded glass-input text-xs mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Lever 3: New Branches & CapEx */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {t("new_branches_count")}
                </span>
                <span className="font-bold text-emerald-400">
                  +{(params.newBranchesCount ?? 0)} {t("branches")}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={params.newBranchesCount ?? 0}
                onChange={(e) =>
                  setParams({
                    ...params,
                    newBranchesCount: parseInt(e.target.value),
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />

              {(params.newBranchesCount ?? 0) > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 block truncate">
                      CapEx ($)
                    </span>
                    <input
                      type="number"
                      value={params.capexPerNewBranch ?? 0}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          capexPerNewBranch: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 rounded glass-input text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block truncate">
                      OpEx ($/{t("month_short")})
                    </span>
                    <input
                      type="number"
                      value={params.monthlyOpexPerNewBranch ?? 0}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          monthlyOpexPerNewBranch:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 rounded glass-input text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block truncate">
                      Sales ($/{t("month_short")})
                    </span>
                    <input
                      type="number"
                      value={params.expectedMonthlyRevenuePerNewBranch ?? 0}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          expectedMonthlyRevenuePerNewBranch:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 rounded glass-input text-xs mt-0.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lever 4: Marketing Budget */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {t("marketing_budget")}
                </span>
                <span className="font-bold text-purple-400">
                  ${(params.marketingBudgetMonthly ?? 0).toLocaleString()}/{t("month_short")}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="500"
                value={params.marketingBudgetMonthly ?? 0}
                onChange={(e) =>
                  setParams({
                    ...params,
                    marketingBudgetMonthly: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Saved Scenarios List */}
          {savedScenarios.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {t("saved_scenarios")} ({savedScenarios.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {savedScenarios.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                  >
                    <div
                      onClick={() => handleLoadSaved(s.id)}
                      className="cursor-pointer min-w-0 flex-1 pr-2"
                    >
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t("profit_label")}: ${s.projectedMonthlyProfit.toLocaleString()} (
                        {s.monthlyProfitDelta >= 0 ? "+" : ""}
                        ${s.monthlyProfitDelta.toLocaleString()})
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSaved(s.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Simulation Output & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Confidence and Disclaimer Banner */}
              <div className="glass-panel p-4 rounded-xl border-amber-500/30 bg-amber-950/20 flex items-start gap-3 text-xs">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">
                    {t("confidence_rating")}: {result.confidenceScore}% —{" "}
                    <span className="font-normal text-amber-200">
                      {result.confidenceRationale}
                    </span>
                  </p>
                  <p className="text-[11px] text-amber-400/80 mt-1 italic">
                    {t("estimate_warning")}
                  </p>
                </div>
              </div>

              {/* Baseline vs Scenario Metric Comparison Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(result.summaryMetrics).map(([key, metric]) => {
                  const isPositive = metric.absoluteChange >= 0;
                  return (
                    <div
                      key={key}
                      className="glass-panel p-3.5 rounded-xl border-slate-800 flex flex-col justify-between"
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 truncate">
                        {metric.metricName}
                      </span>
                      <div className="my-1.5">
                        <p className="text-xs text-slate-400">
                          Base: ${metric.baselineValue.toLocaleString()}
                        </p>
                        <p className="text-base font-black text-slate-100">
                          ${metric.simulatedValue.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {metric.percentageChange.toFixed(1)}% (
                        {isPositive ? "+" : ""}
                        ${metric.absoluteChange.toLocaleString()})
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 12-Month Projection Chart with P10/P50/P90 Confidence Bounds */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    {t("projection_chart")}
                  </h4>
                  {result.breakevenMonths && result.breakevenMonths > 0 && (
                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      Breakeven: ~{result.breakevenMonths} months
                    </span>
                  )}
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={result.monthlyProjections}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorP90"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#06b6d4"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#06b6d4"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorSim"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#64748b"
                        fontSize={10}
                      />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Area
                        type="monotone"
                        dataKey="p90Profit"
                        name={t("optimistic_p90")}
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#colorP90)"
                        strokeDasharray="3 3"
                      />
                      <Area
                        type="monotone"
                        dataKey="simulatedProfit"
                        name={t("expected_p50")}
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorSim)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="p10Profit"
                        name={t("conservative_p10")}
                        stroke="#f43f5e"
                        fillOpacity={0}
                        strokeDasharray="3 3"
                      />
                      <Area
                        type="monotone"
                        dataKey="baselineProfit"
                        name={t("baseline")}
                        stroke="#94a3b8"
                        fillOpacity={0}
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Assumptions & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Assumptions */}
                <div className="glass-panel p-4 rounded-xl space-y-2 border-indigo-500/20">
                  <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    {t("assumptions_applied")}
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {result.assumptionsApplied.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Indicators */}
                <div className="glass-panel p-4 rounded-xl space-y-2 border-rose-500/20">
                  <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {t("risk_factors")}
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {result.riskFactors.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
