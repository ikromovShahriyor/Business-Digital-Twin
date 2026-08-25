using BusinessTwin.Domain.Common;
using BusinessTwin.Domain.Enums;

namespace BusinessTwin.Domain.Entities;

public class Scenario : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Changed variables / input levers
    public decimal PriceChangePercent { get; set; } = 0m;
    public decimal PriceElasticity { get; set; } = -1.2m;
    public decimal ExpectedSalesVolumeChangePercent { get; set; } = 0m;
    public int EmployeeHeadcountChange { get; set; } = 0;
    public decimal AverageNewEmployeeSalary { get; set; } = 0m;
    public decimal ExistingEmployeeSalaryChangePercent { get; set; } = 0m;
    public int NewBranchesCount { get; set; } = 0;
    public decimal CapexPerNewBranch { get; set; } = 0m;
    public decimal MonthlyOpexPerNewBranch { get; set; } = 0m;
    public decimal ExpectedMonthlyRevenuePerNewBranch { get; set; } = 0m;
    public decimal MarketingBudgetMonthly { get; set; } = 0m;
    public decimal MarketingCustomerAcquisitionCost { get; set; } = 50m;
    public decimal MarketingRevenuePerAcquiredCustomer { get; set; } = 120m;
    public decimal InventoryBufferTargetPercent { get; set; } = 0m;
    public int ProjectionMonths { get; set; } = 12;

    // Simulation outcomes & metadata
    public decimal ConfidenceScore { get; set; } = 85m;
    public string? ConfidenceRationale { get; set; }
    public decimal? BreakevenMonths { get; set; }
    public decimal? RoiPercent { get; set; }
    public bool IsArchived { get; set; } = false;

    public ICollection<ScenarioAssumption> Assumptions { get; set; } = new List<ScenarioAssumption>();
    public ICollection<ScenarioMetric> Metrics { get; set; } = new List<ScenarioMetric>();
}

public class ScenarioAssumption : BaseEntity
{
    public Guid ScenarioId { get; set; }
    public Scenario Scenario { get; set; } = null!;

    public string Category { get; set; } = "General"; // Pricing, Headcount, Expansion, Marketing
    public string AssumptionText { get; set; } = string.Empty;
}

public class ScenarioMetric : BaseEntity
{
    public Guid ScenarioId { get; set; }
    public Scenario Scenario { get; set; } = null!;

    public string MetricKey { get; set; } = string.Empty; // monthly_revenue, monthly_expenses, monthly_profit, profit_margin
    public string MetricName { get; set; } = string.Empty;
    public decimal BaselineValue { get; set; }
    public decimal SimulatedValue { get; set; }
    public decimal AbsoluteDelta { get; set; }
    public decimal PercentageDelta { get; set; }
    public string Unit { get; set; } = "$";
}

public class AuditLog : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? UserId { get; set; }
    public string UserEmail { get; set; } = "System";
    public string Action { get; set; } = string.Empty; // CREATE, UPDATE, DELETE, SIMULATE, EXPORT
    public string EntityName { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class Notification : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? UserId { get; set; }
    public NotificationType Type { get; set; } = NotificationType.System;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAtUtc { get; set; }
}

public class CompanySetting : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
