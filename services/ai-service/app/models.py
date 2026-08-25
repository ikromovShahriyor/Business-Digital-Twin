from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# Baseline business state snapshot for simulation
class BranchSnapshot(BaseModel):
    id: str
    name: str
    monthly_revenue: float
    monthly_expenses: float
    employee_count: int

class ProductSnapshot(BaseModel):
    id: str
    name: str
    sku: Optional[str] = None
    cost_price: float
    selling_price: float
    monthly_sales_units: float
    stock_quantity: float
    category: Optional[str] = "General"

class BusinessStateSnapshot(BaseModel):
    company_id: str
    company_name: str
    currency: str = "USD"
    monthly_revenue: float
    monthly_cogs: float
    monthly_opex: float
    monthly_net_profit: float
    employee_count: int
    monthly_payroll: float
    active_customers: int
    branches: List[BranchSnapshot] = []
    products: List[ProductSnapshot] = []
    historical_monthly_revenue: List[float] = []
    historical_monthly_expenses: List[float] = []

# Scenario parameters
class ScenarioParameters(BaseModel):
    scenario_name: str = "What-If Scenario"
    scenario_description: Optional[str] = None
    price_change_percent: float = Field(0.0, description="Percentage change in selling prices (e.g. +10 for +10%)")
    price_elasticity: float = Field(-1.2, description="Price elasticity of demand (typically negative)")
    expected_sales_volume_change_percent: float = Field(0.0, description="Exogenous sales volume growth %")
    employee_headcount_change: int = Field(0, description="Number of employees to add or remove")
    average_new_employee_salary: float = Field(0.0, description="Monthly salary per new employee")
    existing_employee_salary_change_percent: float = Field(0.0, description="Salary adjustment % for existing staff")
    new_branches_count: int = Field(0, description="Number of new branches to open")
    capex_per_new_branch: float = Field(0.0, description="Upfront setup CapEx per branch")
    monthly_opex_per_new_branch: float = Field(0.0, description="Monthly operating cost per branch")
    expected_monthly_revenue_per_new_branch: float = Field(0.0, description="Estimated monthly sales from new branch")
    marketing_budget_monthly: float = Field(0.0, description="Additional monthly marketing spend")
    marketing_customer_acquisition_cost: float = Field(50.0, description="Estimated CAC per new customer")
    marketing_revenue_per_acquired_customer: float = Field(120.0, description="Expected monthly revenue per acquired customer")
    inventory_buffer_target_percent: float = Field(0.0, description="Target change in inventory holding levels %")
    projection_months: int = Field(12, ge=1, le=36, description="Forecast horizon in months")

# Simulation Result Models
class MonthlyProjection(BaseModel):
    month_index: int
    month_label: str
    baseline_revenue: float
    baseline_expenses: float
    baseline_profit: float
    simulated_revenue: float
    simulated_expenses: float
    simulated_profit: float
    p10_profit: float # Conservative
    p50_profit: float # Expected
    p90_profit: float # Optimistic

class SimulationMetricDelta(BaseModel):
    metric_name: str
    baseline_value: float
    simulated_value: float
    absolute_change: float
    percentage_change: float
    unit: str = "$"

class SimulationResponse(BaseModel):
    scenario_name: str
    is_simulated: bool = True
    confidence_score: float = Field(..., description="Overall model confidence rating (0-100%)")
    confidence_rationale: str
    assumptions_applied: List[str]
    risk_factors: List[str]
    opportunities: List[str]
    summary_metrics: Dict[str, SimulationMetricDelta]
    monthly_projections: List[MonthlyProjection]
    breakeven_months: Optional[float] = None
    roi_percent: Optional[float] = None
    calculated_at: datetime = Field(default_factory=datetime.utcnow)

# AI Advisor Request & Response
class AdvisorChatRequest(BaseModel):
    company_id: str
    query: str
    current_state: BusinessStateSnapshot
    active_scenario: Optional[SimulationResponse] = None
    language: str = "en" # "en", "uz", "ru"

class AdvisorDiagnosticItem(BaseModel):
    category: str # "Revenue", "Expense", "Product", "Customer", "Scenario"
    severity: str # "INFO", "WARNING", "OPPORTUNITY", "CRITICAL"
    title: str
    finding: str
    actionable_recommendation: str

class AdvisorAnalysisResponse(BaseModel):
    overall_health_score: int # 0-100
    executive_summary: str
    diagnostics: List[AdvisorDiagnosticItem]
    revenue_drivers: List[str]
    cost_hotspots: List[str]
    recommended_scenarios: List[str]
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
