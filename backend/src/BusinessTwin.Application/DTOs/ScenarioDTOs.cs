namespace BusinessTwin.Application.DTOs;

public record SimulateScenarioRequest(
    string ScenarioName,
    string? Description,
    decimal PriceChangePercent,
    decimal PriceElasticity = -1.2m,
    decimal ExpectedSalesVolumeChangePercent = 0m,
    int EmployeeHeadcountChange = 0,
    decimal AverageNewEmployeeSalary = 0m,
    decimal ExistingEmployeeSalaryChangePercent = 0m,
    int NewBranchesCount = 0,
    decimal CapexPerNewBranch = 0m,
    decimal MonthlyOpexPerNewBranch = 0m,
    decimal ExpectedMonthlyRevenuePerNewBranch = 0m,
    decimal MarketingBudgetMonthly = 0m,
    decimal MarketingCustomerAcquisitionCost = 50m,
    decimal MarketingRevenuePerAcquiredCustomer = 120m,
    decimal InventoryBufferTargetPercent = 0m,
    int ProjectionMonths = 12,
    bool SaveScenario = false
);

public record SimulationResultDto(
    Guid? ScenarioId,
    string ScenarioName,
    bool IsSimulated,
    decimal ConfidenceScore,
    string ConfidenceRationale,
    List<string> AssumptionsApplied,
    List<string> RiskFactors,
    List<string> Opportunities,
    Dictionary<string, MetricDeltaDto> SummaryMetrics,
    List<MonthlyProjectionDto> MonthlyProjections,
    decimal? BreakevenMonths,
    decimal? RoiPercent,
    DateTime CalculatedAtUtc
);

public record MetricDeltaDto(
    string MetricName,
    decimal BaselineValue,
    decimal SimulatedValue,
    decimal AbsoluteChange,
    decimal PercentageChange,
    string Unit
);

public record MonthlyProjectionDto(
    int MonthIndex,
    string MonthLabel,
    decimal BaselineRevenue,
    decimal BaselineExpenses,
    decimal BaselineProfit,
    decimal SimulatedRevenue,
    decimal SimulatedExpenses,
    decimal SimulatedProfit,
    decimal P10Profit, // Downside / Conservative
    decimal P50Profit, // Expected / Median
    decimal P90Profit  // Upside / Optimistic
);

public record ScenarioSummaryDto(
    Guid Id,
    string Name,
    string? Description,
    decimal ConfidenceScore,
    decimal ProjectedMonthlyRevenue,
    decimal ProjectedMonthlyProfit,
    decimal MonthlyProfitDelta,
    decimal? BreakevenMonths,
    decimal? RoiPercent,
    DateTime CreatedAtUtc,
    string CreatedByUserName
);

public record ScenarioComparisonDto(
    List<ScenarioSummaryDto> Scenarios,
    Dictionary<string, List<decimal>> MetricComparisons
);
