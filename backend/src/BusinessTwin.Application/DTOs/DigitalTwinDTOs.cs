namespace BusinessTwin.Application.DTOs;

public record DigitalTwinSnapshotDto(
    Guid CompanyId,
    string CompanyName,
    string Currency,
    decimal MonthlyRevenue,
    decimal MonthlyCogs,
    decimal MonthlyGrossProfit,
    decimal GrossMarginPercent,
    decimal MonthlyOpex,
    decimal MonthlyNetProfit,
    decimal NetMarginPercent,
    decimal CashRunwayMonths,
    decimal BreakevenMonthlyRevenue,
    int TotalEmployees,
    decimal MonthlyPayroll,
    decimal RevenuePerEmployee,
    int TotalBranches,
    int ActiveCustomers,
    int LowStockProductCount,
    List<BranchFinancialSummaryDto> Branches,
    List<ProductPerformanceDto> TopProducts,
    List<MonthlyTrendPointDto> HistoricalTrends,
    DateTime CalculatedAtUtc
);

public record BranchFinancialSummaryDto(
    Guid Id,
    string Name,
    string Code,
    decimal MonthlyRevenue,
    decimal MonthlyExpenses,
    decimal NetProfit,
    int EmployeeCount,
    bool IsMainBranch
);

public record ProductPerformanceDto(
    Guid Id,
    string Name,
    string? Sku,
    string Category,
    decimal CostPrice,
    decimal SellingPrice,
    decimal GrossMarginPercent,
    decimal MonthlySalesUnits,
    decimal MonthlyRevenue,
    decimal StockQuantity,
    bool IsLowStock
);

public record MonthlyTrendPointDto(
    string MonthLabel,
    decimal Revenue,
    decimal Expenses,
    decimal NetProfit,
    int OrderCount
);

public record DigitalTwinNodeGraphDto(
    List<TwinNodeDto> Nodes,
    List<TwinEdgeDto> Edges
);

public record TwinNodeDto(
    string Id,
    string Type, // "company", "branch", "product", "sales", "expenses", "staff"
    string Label,
    decimal Value,
    string Unit,
    string Status // "healthy", "warning", "critical", "neutral"
);

public record TwinEdgeDto(
    string Source,
    string Target,
    string Label,
    decimal FlowValue
);
