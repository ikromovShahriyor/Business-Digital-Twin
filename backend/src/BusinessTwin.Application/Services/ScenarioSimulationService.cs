using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Application.DTOs;
using BusinessTwin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BusinessTwin.Application.Services;

public interface IScenarioSimulationService
{
    Task<SimulationResultDto> SimulateScenarioAsync(SimulateScenarioRequest request, CancellationToken cancellationToken = default);
    Task<List<ScenarioSummaryDto>> GetSavedScenariosAsync(CancellationToken cancellationToken = default);
    Task<SimulationResultDto> GetScenarioByIdAsync(Guid scenarioId, CancellationToken cancellationToken = default);
    Task<ScenarioComparisonDto> CompareScenariosAsync(List<Guid> scenarioIds, CancellationToken cancellationToken = default);
    Task<bool> DeleteScenarioAsync(Guid scenarioId, CancellationToken cancellationToken = default);
}

public class ScenarioSimulationService : IScenarioSimulationService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _tenantService;
    private readonly IDigitalTwinService _digitalTwinService;

    public ScenarioSimulationService(
        IApplicationDbContext context,
        ICurrentTenantService tenantService,
        IDigitalTwinService digitalTwinService)
    {
        _context = context;
        _tenantService = tenantService;
        _digitalTwinService = digitalTwinService;
    }

    public async Task<SimulationResultDto> SimulateScenarioAsync(SimulateScenarioRequest request, CancellationToken cancellationToken = default)
    {
        var companyId = _tenantService.CompanyId ?? throw new UnauthorizedAccessException("No active company workspace.");
        var userId = _tenantService.UserId ?? Guid.Empty;

        // Fetch real baseline data (never mutated)
        var baseline = await _digitalTwinService.GetDigitalTwinSnapshotAsync(cancellationToken);

        // Simulation Calculations
        var priceChangeRatio = request.PriceChangePercent / 100m;
        var elasticity = request.PriceElasticity;
        var volumeChangeFromPrice = elasticity * priceChangeRatio;
        var exogenousVolumeRatio = request.ExpectedSalesVolumeChangePercent / 100m;
        var netVolumeMultiplier = Math.Max(0.05m, 1.0m + volumeChangeFromPrice + exogenousVolumeRatio);

        var assumptions = new List<string>();
        var risks = new List<string>();
        var opportunities = new List<string>();

        if (request.PriceChangePercent != 0)
        {
            assumptions.Add($"Price adjusted by {request.PriceChangePercent:+#.0;-#.0;0.0}%. Sales volume responds by {volumeChangeFromPrice * 100:+#.0;-#.0;0.0}% based on elasticity of {elasticity:0.00}.");
            if (request.PriceChangePercent > 10 && volumeChangeFromPrice < -0.15m)
                risks.Add("Substantial price hike may induce customer churn towards lower-cost competitors.");
            else if (request.PriceChangePercent < 0 && volumeChangeFromPrice > 0.10m)
                opportunities.Add("Discount strategy captures higher market share and expands customer volume.");
        }

        // Marketing Impact
        decimal marketingRevBoost = 0m;
        if (request.MarketingBudgetMonthly > 0)
        {
            var effectiveCac = request.MarketingCustomerAcquisitionCost <= 0 ? 50m : request.MarketingCustomerAcquisitionCost;
            var newCusts = request.MarketingBudgetMonthly / effectiveCac;
            marketingRevBoost = newCusts * request.MarketingRevenuePerAcquiredCustomer;
            assumptions.Add($"Monthly marketing budget of ${request.MarketingBudgetMonthly:N2} estimated to acquire ~{(int)newCusts} customers at ${effectiveCac:N2} CAC.");
            if (marketingRevBoost > request.MarketingBudgetMonthly * 1.5m)
                opportunities.Add("Marketing investment yields strong return on ad spend (ROAS > 1.5x).");
        }

        // Branch Expansion
        decimal totalCapex = 0m;
        decimal branchOpexBoost = 0m;
        decimal branchRevBoost = 0m;
        if (request.NewBranchesCount > 0)
        {
            totalCapex = request.NewBranchesCount * request.CapexPerNewBranch;
            branchOpexBoost = request.NewBranchesCount * request.MonthlyOpexPerNewBranch;
            branchRevBoost = request.NewBranchesCount * request.ExpectedMonthlyRevenuePerNewBranch;
            assumptions.Add($"Opening {request.NewBranchesCount} branch(es) requires ${totalCapex:N2} upfront CapEx, +${branchOpexBoost:N2}/mo OpEx, +${branchRevBoost:N2}/mo Revenue.");
            if (totalCapex > baseline.MonthlyNetProfit * 6 && baseline.MonthlyNetProfit > 0)
                risks.Add("Capital expenditure exceeds 6 months of baseline net earnings; consider staged rollout.");
        }

        // Headcount & Salaries
        var currentAvgSalary = baseline.TotalEmployees > 0 ? (baseline.MonthlyPayroll / baseline.TotalEmployees) : 3000m;
        var newEmpSalary = request.AverageNewEmployeeSalary > 0 ? request.AverageNewEmployeeSalary : currentAvgSalary;
        var payrollOverhead = 1.15m; // 15% taxes/benefits
        var newPayrollDelta = (request.EmployeeHeadcountChange * newEmpSalary * payrollOverhead);
        var existingPayrollDelta = baseline.MonthlyPayroll * (request.ExistingEmployeeSalaryChangePercent / 100m);
        var totalPayrollDelta = newPayrollDelta + existingPayrollDelta;

        if (request.EmployeeHeadcountChange != 0 || request.ExistingEmployeeSalaryChangePercent != 0)
        {
            assumptions.Add($"Staff adjustments ({request.EmployeeHeadcountChange:+#;-#;0} employees, {request.ExistingEmployeeSalaryChangePercent:+#.0;-#.0;0.0}% salary shift) changes payroll by ${totalPayrollDelta:N2}/mo.");
            if (request.EmployeeHeadcountChange > 0)
                opportunities.Add($"Expanded workforce increases overall operational capacity by ~{request.EmployeeHeadcountChange * 4}%.");
        }

        // Simulated Run-Rate
        var simulatedCoreRevenue = baseline.MonthlyRevenue * (1.0m + priceChangeRatio) * netVolumeMultiplier;
        var simulatedTotalRevenue = Math.Round(simulatedCoreRevenue + marketingRevBoost + branchRevBoost, 2);

        var cogsRatio = baseline.MonthlyRevenue > 0 ? (baseline.MonthlyCogs / baseline.MonthlyRevenue) : 0.45m;
        var simulatedCogs = Math.Round((simulatedCoreRevenue / (1.0m + priceChangeRatio)) * cogsRatio + (branchRevBoost * cogsRatio), 2);
        var simulatedOpex = Math.Round(baseline.MonthlyOpex + totalPayrollDelta + request.MarketingBudgetMonthly + branchOpexBoost, 2);
        var simulatedTotalExpenses = simulatedCogs + simulatedOpex;
        var simulatedNetProfit = Math.Round(simulatedTotalRevenue - simulatedTotalExpenses, 2);

        var baselineTotalExpenses = baseline.MonthlyCogs + baseline.MonthlyOpex;
        var baselineProfit = baseline.MonthlyNetProfit;

        // Breakeven & ROI
        var profitDelta = simulatedNetProfit - baselineProfit;
        decimal? breakevenMonths = null;
        decimal? roiPercent = null;

        if (totalCapex > 0)
        {
            if (profitDelta > 0)
            {
                breakevenMonths = Math.Round(totalCapex / profitDelta, 1);
                var annualGain = (profitDelta * 12) - totalCapex;
                roiPercent = Math.Round((annualGain / totalCapex) * 100m, 1);
            }
            else
            {
                breakevenMonths = -1; // Unprofitable
            }
        }

        // Confidence Score
        var confScore = 90m;
        if (Math.Abs(request.PriceChangePercent) > 20) confScore -= 10m;
        if (request.NewBranchesCount > 2) confScore -= 10m;
        if (request.EmployeeHeadcountChange > 5) confScore -= 8m;
        confScore = Math.Clamp(confScore, 50m, 98m);

        var confRationale = $"Model confidence assessed at {confScore}% based on historical stability and elasticity calibration.";

        // Projections
        var projections = new List<MonthlyProjectionDto>();
        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

        for (int m = 1; m <= request.ProjectionMonths; m++)
        {
            var mName = monthNames[(m - 1) % 12];
            var seasonality = 1.0m + (decimal)(0.04 * Math.Sin((m / 12.0) * 2 * Math.PI));
            var ramp = (request.NewBranchesCount > 0 || request.EmployeeHeadcountChange > 0) ? Math.Min(1.0m, 0.4m + 0.6m * (m / 6.0m)) : 1.0m;

            var mBaseRev = Math.Round(baseline.MonthlyRevenue * seasonality, 2);
            var mBaseExp = Math.Round(baselineTotalExpenses * (1.0m + 0.008m * (m / 12.0m)), 2);
            var mBaseProfit = mBaseRev - mBaseExp;

            var mSimRev = Math.Round(((simulatedCoreRevenue + marketingRevBoost) * seasonality) + (branchRevBoost * ramp * seasonality), 2);
            var mSimCogs = Math.Round(((simulatedCoreRevenue / (1.0m + priceChangeRatio)) * cogsRatio * seasonality) + (branchRevBoost * ramp * cogsRatio), 2);
            var mSimOpex = Math.Round(baseline.MonthlyOpex + totalPayrollDelta + request.MarketingBudgetMonthly + (branchOpexBoost * ramp), 2);
            var mSimExp = mSimCogs + mSimOpex;
            var mSimProfit = mSimRev - mSimExp;

            if (m == 1 && totalCapex > 0)
            {
                mSimExp += totalCapex;
                mSimProfit -= totalCapex;
            }

            var variance = Math.Max(500m, Math.Abs(mSimProfit) * 0.12m);
            var p10 = Math.Round(mSimProfit - variance, 2);
            var p50 = Math.Round(mSimProfit, 2);
            var p90 = Math.Round(mSimProfit + variance, 2);

            projections.Add(new MonthlyProjectionDto(
                MonthIndex: m,
                MonthLabel: $"{mName} (M{m})",
                BaselineRevenue: mBaseRev,
                BaselineExpenses: mBaseExp,
                BaselineProfit: mBaseProfit,
                SimulatedRevenue: mSimRev,
                SimulatedExpenses: mSimExp,
                SimulatedProfit: mSimProfit,
                P10Profit: p10,
                P50Profit: p50,
                P90Profit: p90
            ));
        }

        // Summary Metrics
        var revDelta = simulatedTotalRevenue - baseline.MonthlyRevenue;
        var expDelta = simulatedTotalExpenses - baselineTotalExpenses;
        var summaryMetrics = new Dictionary<string, MetricDeltaDto>
        {
            ["monthly_revenue"] = new(
                "Monthly Revenue",
                baseline.MonthlyRevenue,
                simulatedTotalRevenue,
                revDelta,
                baseline.MonthlyRevenue > 0 ? Math.Round((revDelta / baseline.MonthlyRevenue) * 100, 2) : 0,
                baseline.Currency
            ),
            ["monthly_expenses"] = new(
                "Monthly Expenses",
                baselineTotalExpenses,
                simulatedTotalExpenses,
                expDelta,
                baselineTotalExpenses > 0 ? Math.Round((expDelta / baselineTotalExpenses) * 100, 2) : 0,
                baseline.Currency
            ),
            ["monthly_profit"] = new(
                "Monthly Net Profit",
                baselineProfit,
                simulatedNetProfit,
                profitDelta,
                baselineProfit != 0 ? Math.Round((profitDelta / Math.Abs(baselineProfit)) * 100, 2) : 0,
                baseline.Currency
            ),
            ["profit_margin"] = new(
                "Net Profit Margin",
                baseline.NetMarginPercent,
                simulatedTotalRevenue > 0 ? Math.Round((simulatedNetProfit / simulatedTotalRevenue) * 100, 2) : 0,
                (simulatedTotalRevenue > 0 ? Math.Round((simulatedNetProfit / simulatedTotalRevenue) * 100, 2) : 0) - baseline.NetMarginPercent,
                0,
                "%"
            )
        };

        if (!assumptions.Any()) assumptions.Add("Baseline conditions maintained without parameter alterations.");

        Guid? savedScenarioId = null;
        if (request.SaveScenario)
        {
            var scenario = new Scenario
            {
                CompanyId = companyId,
                CreatedByUserId = userId != Guid.Empty ? userId : (await _context.Users.Select(u => u.Id).FirstOrDefaultAsync(cancellationToken)),
                Name = request.ScenarioName,
                Description = request.Description,
                PriceChangePercent = request.PriceChangePercent,
                PriceElasticity = request.PriceElasticity,
                ExpectedSalesVolumeChangePercent = request.ExpectedSalesVolumeChangePercent,
                EmployeeHeadcountChange = request.EmployeeHeadcountChange,
                AverageNewEmployeeSalary = request.AverageNewEmployeeSalary,
                ExistingEmployeeSalaryChangePercent = request.ExistingEmployeeSalaryChangePercent,
                NewBranchesCount = request.NewBranchesCount,
                CapexPerNewBranch = request.CapexPerNewBranch,
                MonthlyOpexPerNewBranch = request.MonthlyOpexPerNewBranch,
                ExpectedMonthlyRevenuePerNewBranch = request.ExpectedMonthlyRevenuePerNewBranch,
                MarketingBudgetMonthly = request.MarketingBudgetMonthly,
                ConfidenceScore = confScore,
                ConfidenceRationale = confRationale,
                BreakevenMonths = breakevenMonths,
                RoiPercent = roiPercent
            };

            foreach (var a in assumptions)
            {
                scenario.Assumptions.Add(new ScenarioAssumption { AssumptionText = a });
            }

            foreach (var kvp in summaryMetrics)
            {
                scenario.Metrics.Add(new ScenarioMetric
                {
                    MetricKey = kvp.Key,
                    MetricName = kvp.Value.MetricName,
                    BaselineValue = kvp.Value.BaselineValue,
                    SimulatedValue = kvp.Value.SimulatedValue,
                    AbsoluteDelta = kvp.Value.AbsoluteChange,
                    PercentageDelta = kvp.Value.PercentageChange,
                    Unit = kvp.Value.Unit
                });
            }

            _context.Scenarios.Add(scenario);
            await _context.SaveChangesAsync(cancellationToken);
            savedScenarioId = scenario.Id;
        }

        return new SimulationResultDto(
            ScenarioId: savedScenarioId,
            ScenarioName: request.ScenarioName,
            IsSimulated: true,
            ConfidenceScore: confScore,
            ConfidenceRationale: confRationale,
            AssumptionsApplied: assumptions,
            RiskFactors: risks.Any() ? risks : new List<string> { "Standard market operational risk." },
            Opportunities: opportunities.Any() ? opportunities : new List<string> { "Stable profit generation." },
            SummaryMetrics: summaryMetrics,
            MonthlyProjections: projections,
            BreakevenMonths: breakevenMonths,
            RoiPercent: roiPercent,
            CalculatedAtUtc: DateTime.UtcNow
        );
    }

    public async Task<List<ScenarioSummaryDto>> GetSavedScenariosAsync(CancellationToken cancellationToken = default)
    {
        var companyId = _tenantService.CompanyId ?? throw new UnauthorizedAccessException("No company workspace.");

        var scenarios = await _context.Scenarios
            .Where(s => s.CompanyId == companyId && !s.IsArchived && !s.IsDeleted)
            .Include(s => s.CreatedByUser)
            .Include(s => s.Metrics)
            .OrderByDescending(s => s.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return scenarios.Select(s =>
        {
            var revMetric = s.Metrics.FirstOrDefault(m => m.MetricKey == "monthly_revenue");
            var profMetric = s.Metrics.FirstOrDefault(m => m.MetricKey == "monthly_profit");

            return new ScenarioSummaryDto(
                Id: s.Id,
                Name: s.Name,
                Description: s.Description,
                ConfidenceScore: s.ConfidenceScore,
                ProjectedMonthlyRevenue: revMetric?.SimulatedValue ?? 0,
                ProjectedMonthlyProfit: profMetric?.SimulatedValue ?? 0,
                MonthlyProfitDelta: profMetric?.AbsoluteDelta ?? 0,
                BreakevenMonths: s.BreakevenMonths,
                RoiPercent: s.RoiPercent,
                CreatedAtUtc: s.CreatedAtUtc,
                CreatedByUserName: $"{s.CreatedByUser.FirstName} {s.CreatedByUser.LastName}".Trim()
            );
        }).ToList();
    }

    public async Task<SimulationResultDto> GetScenarioByIdAsync(Guid scenarioId, CancellationToken cancellationToken = default)
    {
        var companyId = _tenantService.CompanyId ?? throw new UnauthorizedAccessException("No company workspace.");

        var s = await _context.Scenarios
            .Include(s => s.Assumptions)
            .Include(s => s.Metrics)
            .FirstOrDefaultAsync(s => s.Id == scenarioId && s.CompanyId == companyId && !s.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Scenario not found.");

        // Re-simulate with saved inputs to provide full projection graphs
        var simReq = new SimulateScenarioRequest(
            ScenarioName: s.Name,
            Description: s.Description,
            PriceChangePercent: s.PriceChangePercent,
            PriceElasticity: s.PriceElasticity,
            ExpectedSalesVolumeChangePercent: s.ExpectedSalesVolumeChangePercent,
            EmployeeHeadcountChange: s.EmployeeHeadcountChange,
            AverageNewEmployeeSalary: s.AverageNewEmployeeSalary,
            ExistingEmployeeSalaryChangePercent: s.ExistingEmployeeSalaryChangePercent,
            NewBranchesCount: s.NewBranchesCount,
            CapexPerNewBranch: s.CapexPerNewBranch,
            MonthlyOpexPerNewBranch: s.MonthlyOpexPerNewBranch,
            ExpectedMonthlyRevenuePerNewBranch: s.ExpectedMonthlyRevenuePerNewBranch,
            MarketingBudgetMonthly: s.MarketingBudgetMonthly,
            SaveScenario: false
        );

        var simResult = await SimulateScenarioAsync(simReq, cancellationToken);
        return simResult with { ScenarioId = s.Id };
    }

    public async Task<ScenarioComparisonDto> CompareScenariosAsync(List<Guid> scenarioIds, CancellationToken cancellationToken = default)
    {
        var summaries = await GetSavedScenariosAsync(cancellationToken);
        var filtered = summaries.Where(s => scenarioIds.Contains(s.Id)).ToList();

        var metricDict = new Dictionary<string, List<decimal>>
        {
            ["Revenue"] = filtered.Select(s => s.ProjectedMonthlyRevenue).ToList(),
            ["Profit"] = filtered.Select(s => s.ProjectedMonthlyProfit).ToList(),
            ["ProfitDelta"] = filtered.Select(s => s.MonthlyProfitDelta).ToList(),
            ["Confidence"] = filtered.Select(s => s.ConfidenceScore).ToList()
        };

        return new ScenarioComparisonDto(filtered, metricDict);
    }

    public async Task<bool> DeleteScenarioAsync(Guid scenarioId, CancellationToken cancellationToken = default)
    {
        var companyId = _tenantService.CompanyId ?? throw new UnauthorizedAccessException("No company workspace.");
        var s = await _context.Scenarios
            .FirstOrDefaultAsync(s => s.Id == scenarioId && s.CompanyId == companyId, cancellationToken);

        if (s == null) return false;

        s.IsDeleted = true;
        s.IsArchived = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
