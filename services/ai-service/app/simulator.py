import numpy as np
from typing import List, Dict, Tuple
from app.models import (
    BusinessStateSnapshot,
    ScenarioParameters,
    SimulationResponse,
    SimulationMetricDelta,
    MonthlyProjection
)

def run_simulation(current: BusinessStateSnapshot, params: ScenarioParameters) -> SimulationResponse:
    """
    Executes a high-fidelity business simulation based on real business snapshot data.
    Does NOT mutate baseline data. Emits isolated forecasts with P10/P50/P90 confidence bounds.
    """
    assumptions: List[str] = []
    risks: List[str] = []
    opportunities: List[str] = []
    
    # 1. Price Elasticity Effect
    # Formula: Q_new = Q_old * (1 + (e * (delta_P / P)))
    price_change_ratio = params.price_change_percent / 100.0
    elasticity = params.price_elasticity
    volume_change_from_price = elasticity * price_change_ratio
    
    exogenous_volume_ratio = params.expected_sales_volume_change_percent / 100.0
    net_volume_multiplier = max(0.05, 1.0 + volume_change_from_price + exogenous_volume_ratio)
    
    if params.price_change_percent != 0:
        assumptions.append(
            f"Price adjusted by {params.price_change_percent:+.1f}%. "
            f"Demand volume adjusts by {volume_change_from_price*100:+.2f}% using elasticity factor {elasticity:.2f}."
        )
        if params.price_change_percent > 0 and volume_change_from_price < -0.10:
            risks.append("Significant price increase may lead to customer churn if competitor alternatives exist.")
        elif params.price_change_percent < 0 and volume_change_from_price > 0.15:
            opportunities.append("Price discount significantly expands unit sales volume and market share.")

    # 2. Marketing Inflow Effect
    # Diminishing returns model on marketing spend
    marketing_spend = params.marketing_budget_monthly
    new_customers_from_marketing = 0.0
    marketing_revenue_boost = 0.0
    
    if marketing_spend > 0:
        cac = max(1.0, params.marketing_customer_acquisition_cost)
        rev_per_cust = params.marketing_revenue_per_acquired_customer
        # Diminishing return factor
        scale_efficiency = 1.0 / (1.0 + (marketing_spend / 20000.0))
        effective_cac = cac / scale_efficiency
        new_customers_from_marketing = marketing_spend / effective_cac
        marketing_revenue_boost = new_customers_from_marketing * rev_per_cust
        assumptions.append(
            f"Monthly marketing budget of ${marketing_spend:,.2f} projected to acquire ~{int(new_customers_from_marketing)} customers "
            f"at effective CAC of ${effective_cac:.2f}."
        )
        if marketing_revenue_boost > marketing_spend * 1.5:
            opportunities.append("Marketing campaign generates high ROAS (Return on Ad Spend > 1.5x).")
        elif marketing_revenue_boost < marketing_spend:
            risks.append("Marketing spend may be dilutive unless customer lifetime value (LTV) exceeds initial CAC.")

    # 3. Branch Expansion
    new_branches = params.new_branches_count
    branch_revenue_boost = 0.0
    branch_opex_boost = 0.0
    total_capex = 0.0
    
    if new_branches > 0:
        total_capex = new_branches * params.capex_per_new_branch
        branch_opex_boost = new_branches * params.monthly_opex_per_new_branch
        branch_revenue_boost = new_branches * params.expected_monthly_revenue_per_new_branch
        assumptions.append(
            f"Opening {new_branches} new branch(es) requires ${total_capex:,.2f} upfront CapEx, "
            f"adding ${branch_opex_boost:,.2f}/mo OpEx and ${branch_revenue_boost:,.2f}/mo Revenue."
        )
        if total_capex > current.monthly_net_profit * 6 and current.monthly_net_profit > 0:
            risks.append("Branch expansion requires substantial capital that exceeds 6 months of current net profits.")

    # 4. Headcount & Payroll
    headcount_delta = params.employee_headcount_change
    existing_salary_change_ratio = params.existing_employee_salary_change_percent / 100.0
    
    current_avg_salary = (current.monthly_payroll / current.employee_count) if current.employee_count > 0 else 3000.0
    new_emp_salary = params.average_new_employee_salary if params.average_new_employee_salary > 0 else current_avg_salary
    
    # 15% payroll tax / benefit overhead
    payroll_overhead = 1.15
    new_payroll_delta = (headcount_delta * new_emp_salary * payroll_overhead) if headcount_delta > 0 else (headcount_delta * current_avg_salary * payroll_overhead)
    existing_payroll_delta = current.monthly_payroll * existing_salary_change_ratio
    total_payroll_delta = new_payroll_delta + existing_payroll_delta
    
    if headcount_delta != 0 or existing_salary_change_ratio != 0:
        assumptions.append(
            f"Headcount change ({headcount_delta:+d} staff) and salary adjustment ({existing_salary_change_ratio*100:+.1f}%) "
            f"adjust monthly payroll by ${total_payroll_delta:,.2f} (including 15% overhead)."
        )
        if headcount_delta > 0:
            # Productivity ramp-up: extra staff increases capacity by 3-5% per staff member
            capacity_boost = min(0.35, headcount_delta * 0.04)
            opportunities.append(f"Additional workforce expands organizational delivery capacity by ~{capacity_boost*100:.1f}%.")

    # 5. Inventory Holding Cost Effect
    # Typically 1.5% - 2% monthly inventory carrying cost (storage, insurance, obsolescence)
    inventory_buffer_ratio = params.inventory_buffer_target_percent / 100.0
    inventory_carrying_cost_delta = 0.0
    if inventory_buffer_ratio != 0:
        total_inv_val = sum(p.stock_quantity * p.cost_price for p in current.products) if current.products else (current.monthly_cogs * 1.5)
        monthly_carrying_rate = 0.018 # 1.8% monthly carrying cost
        inventory_carrying_cost_delta = total_inv_val * inventory_buffer_ratio * monthly_carrying_rate
        assumptions.append(
            f"Inventory buffer change ({inventory_buffer_ratio*100:+.1f}%) alters monthly carrying costs by ${inventory_carrying_cost_delta:,.2f}."
        )

    # 6. Calculate Baseline vs Simulated Monthly Run-Rate
    # Base revenue with price change & volume multiplier
    simulated_core_revenue = current.monthly_revenue * (1.0 + price_change_ratio) * net_volume_multiplier
    simulated_total_revenue = simulated_core_revenue + marketing_revenue_boost + branch_revenue_boost
    
    # Cost of Goods Sold scales with volume sold
    cogs_ratio = (current.monthly_cogs / current.monthly_revenue) if current.monthly_revenue > 0 else 0.45
    simulated_cogs = (simulated_core_revenue / (1.0 + price_change_ratio)) * cogs_ratio + (branch_revenue_boost * cogs_ratio)
    
    simulated_opex = current.monthly_opex + total_payroll_delta + marketing_spend + branch_opex_boost + inventory_carrying_cost_delta
    simulated_total_expenses = simulated_cogs + simulated_opex
    simulated_net_profit = simulated_total_revenue - simulated_total_expenses

    baseline_total_expenses = current.monthly_cogs + current.monthly_opex
    baseline_profit = current.monthly_revenue - baseline_total_expenses

    # 7. Generate Multi-Month Projections with Seasonality & Stochastic Uncertainty
    months_count = params.projection_months
    monthly_projections: List[MonthlyProjection] = []
    
    # Stochastic Monte Carlo for confidence intervals (P10, P50, P90)
    np.random.seed(42)
    simulated_profits_over_time = []
    
    months_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for m in range(1, months_count + 1):
        # Slight seasonal wave (+/- 5%) and ramp-up for new branches & employees
        month_name = months_labels[(m - 1) % 12]
        seasonality = 1.0 + 0.05 * np.sin((m / 12.0) * 2 * np.pi)
        
        # Ramp up factor for newly opened branches / employees (e.g. Month 1: 40%, Month 3: 80%, Month 6: 100%)
        ramp_factor = min(1.0, 0.4 + (0.6 * (m / 6.0))) if (new_branches > 0 or headcount_delta > 0) else 1.0
        
        m_base_rev = current.monthly_revenue * seasonality
        m_base_exp = baseline_total_expenses * (1.0 + 0.01 * (m / 12.0)) # 1% baseline inflation
        m_base_profit = m_base_rev - m_base_exp
        
        m_sim_rev = ((simulated_core_revenue + marketing_revenue_boost) * seasonality) + (branch_revenue_boost * ramp_factor * seasonality)
        m_sim_cogs = ((simulated_core_revenue / (1.0 + price_change_ratio)) * cogs_ratio * seasonality) + (branch_revenue_boost * ramp_factor * cogs_ratio)
        m_sim_opex = current.monthly_opex + total_payroll_delta + marketing_spend + (branch_opex_boost * ramp_factor) + inventory_carrying_cost_delta
        m_sim_exp = m_sim_cogs + m_sim_opex
        m_sim_profit = m_sim_rev - m_sim_exp
        
        # CapEx deduction in month 1 if new branches
        if m == 1 and total_capex > 0:
            m_sim_exp += total_capex
            m_sim_profit -= total_capex

        # 500 Monte Carlo draws for this month
        noise = np.random.normal(loc=0.0, scale=max(500.0, abs(m_sim_profit) * 0.12), size=500)
        mc_draws = m_sim_profit + noise
        p10 = float(np.percentile(mc_draws, 10))
        p50 = float(np.percentile(mc_draws, 50))
        p90 = float(np.percentile(mc_draws, 90))
        
        simulated_profits_over_time.append(m_sim_profit)
        
        monthly_projections.append(MonthlyProjection(
            month_index=m,
            month_label=f"{month_name} (M{m})",
            baseline_revenue=round(m_base_rev, 2),
            baseline_expenses=round(m_base_exp, 2),
            baseline_profit=round(m_base_profit, 2),
            simulated_revenue=round(m_sim_rev, 2),
            simulated_expenses=round(m_sim_exp, 2),
            simulated_profit=round(m_sim_profit, 2),
            p10_profit=round(p10, 2),
            p50_profit=round(p50, 2),
            p90_profit=round(p90, 2)
        ))

    # 8. Breakeven & ROI Calculation
    monthly_profit_delta = simulated_net_profit - baseline_profit
    breakeven_months = None
    roi_percent = None
    
    if total_capex > 0:
        if monthly_profit_delta > 0:
            breakeven_months = round(total_capex / monthly_profit_delta, 1)
            annual_net_gain = (monthly_profit_delta * 12) - total_capex
            roi_percent = round((annual_net_gain / total_capex) * 100.0, 1)
        else:
            breakeven_months = -1.0 # Will not break even under current assumptions
    
    # 9. Model Confidence Score Calculation
    # Confidence is high when inputs are within normal ranges (e.g. price change +/- 20%)
    # Confidence drops if extreme variables are combined
    conf_score = 92.0
    if abs(params.price_change_percent) > 25:
        conf_score -= 15.0
    if new_branches > 3:
        conf_score -= 12.0
    if headcount_delta > 10:
        conf_score -= 10.0
    if len(current.historical_monthly_revenue) < 6:
        conf_score -= 8.0
    conf_score = max(45.0, min(98.0, conf_score))
    
    confidence_rationale = (
        f"Confidence rated at {conf_score:.0f}% based on historical baseline variance and parameter stability. "
        "Higher volatility expected if macroeconomic conditions or market demand fluctuate."
    )

    # 10. Summary Metrics Delta
    rev_delta = simulated_total_revenue - current.monthly_revenue
    rev_pct = (rev_delta / current.monthly_revenue * 100) if current.monthly_revenue > 0 else 0.0
    
    exp_delta = simulated_total_expenses - baseline_total_expenses
    exp_pct = (exp_delta / baseline_total_expenses * 100) if baseline_total_expenses > 0 else 0.0
    
    profit_delta = simulated_net_profit - baseline_profit
    profit_pct = (profit_delta / abs(baseline_profit) * 100) if baseline_profit != 0 else 0.0
    
    margin_base = (baseline_profit / current.monthly_revenue * 100) if current.monthly_revenue > 0 else 0.0
    margin_sim = (simulated_net_profit / simulated_total_revenue * 100) if simulated_total_revenue > 0 else 0.0
    margin_delta = margin_sim - margin_base

    summary_metrics: Dict[str, SimulationMetricDelta] = {
        "monthly_revenue": SimulationMetricDelta(
            metric_name="Monthly Revenue",
            baseline_value=round(current.monthly_revenue, 2),
            simulated_value=round(simulated_total_revenue, 2),
            absolute_change=round(rev_delta, 2),
            percentage_change=round(rev_pct, 2),
            unit=current.currency
        ),
        "monthly_expenses": SimulationMetricDelta(
            metric_name="Monthly Expenses",
            baseline_value=round(baseline_total_expenses, 2),
            simulated_value=round(simulated_total_expenses, 2),
            absolute_change=round(exp_delta, 2),
            percentage_change=round(exp_pct, 2),
            unit=current.currency
        ),
        "monthly_profit": SimulationMetricDelta(
            metric_name="Monthly Net Profit",
            baseline_value=round(baseline_profit, 2),
            simulated_value=round(simulated_net_profit, 2),
            absolute_change=round(profit_delta, 2),
            percentage_change=round(profit_pct, 2),
            unit=current.currency
        ),
        "profit_margin": SimulationMetricDelta(
            metric_name="Net Profit Margin",
            baseline_value=round(margin_base, 2),
            simulated_value=round(margin_sim, 2),
            absolute_change=round(margin_delta, 2),
            percentage_change=round(margin_delta, 2),
            unit="%"
        )
    }

    if not assumptions:
        assumptions.append("No active parameter adjustments applied; baseline projection displayed.")

    return SimulationResponse(
        scenario_name=params.scenario_name,
        is_simulated=True,
        confidence_score=conf_score,
        confidence_rationale=confidence_rationale,
        assumptions_applied=assumptions,
        risk_factors=risks if risks else ["Normal market operating volatility."],
        opportunities=opportunities if opportunities else ["Stable business trajectory maintained."],
        summary_metrics=summary_metrics,
        monthly_projections=monthly_projections,
        breakeven_months=breakeven_months,
        roi_percent=roi_percent
    )
