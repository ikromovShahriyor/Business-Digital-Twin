using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Application.DTOs;
using BusinessTwin.Application.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace BusinessTwin.Tests.Unit;

public class ScenarioSimulatorTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ICurrentTenantService> _mockTenantService;
    private readonly Mock<IDigitalTwinService> _mockTwinService;
    private readonly ScenarioSimulationService _simulator;

    public ScenarioSimulatorTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockTenantService = new Mock<ICurrentTenantService>();
        _mockTwinService = new Mock<IDigitalTwinService>();

        var testCompanyId = Guid.NewGuid();
        _mockTenantService.Setup(t => t.CompanyId).Returns(testCompanyId);
        _mockTenantService.Setup(t => t.UserId).Returns(Guid.NewGuid());

        // Baseline: 100M revenue, 40M COGS, 30M OPEX, 30M Profit, 10 employees
        var baseline = new DigitalTwinSnapshotDto(
            CompanyId: testCompanyId,
            CompanyName: "Test Enterprises",
            Currency: "USD",
            MonthlyRevenue: 100000m,
            MonthlyCogs: 40000m,
            MonthlyGrossProfit: 60000m,
            GrossMarginPercent: 60m,
            MonthlyOpex: 30000m,
            MonthlyNetProfit: 30000m,
            NetMarginPercent: 30m,
            CashRunwayMonths: 99m,
            BreakevenMonthlyRevenue: 50000m,
            TotalEmployees: 10,
            MonthlyPayroll: 18000m,
            RevenuePerEmployee: 10000m,
            TotalBranches: 2,
            ActiveCustomers: 500,
            LowStockProductCount: 0,
            Branches: new List<BranchFinancialSummaryDto>(),
            TopProducts: new List<ProductPerformanceDto>(),
            HistoricalTrends: new List<MonthlyTrendPointDto>(),
            CalculatedAtUtc: DateTime.UtcNow
        );

        _mockTwinService.Setup(t => t.GetDigitalTwinSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(baseline);

        _simulator = new ScenarioSimulationService(_mockContext.Object, _mockTenantService.Object, _mockTwinService.Object);
    }

    [Fact]
    public async Task Simulate_PriceIncrease10Percent_CalculatesAccuratelyWithElasticity()
    {
        // Arrange: +10% price increase, -1.2 elasticity => volume change = -12%
        var request = new SimulateScenarioRequest(
            ScenarioName: "Price Hike +10%",
            Description: "Testing margin expansion",
            PriceChangePercent: 10m,
            PriceElasticity: -1.2m,
            SaveScenario: false
        );

        // Act
        var result = await _simulator.SimulateScenarioAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.IsSimulated.Should().BeTrue();
        result.SummaryMetrics.Should().ContainKey("monthly_revenue");
        result.SummaryMetrics.Should().ContainKey("monthly_profit");

        // Price: 1.10, Volume: (1 - 0.12) = 0.88 => 1.10 * 0.88 = 0.968 of base = 96,800
        var simRev = result.SummaryMetrics["monthly_revenue"].SimulatedValue;
        simRev.Should().BeGreaterThan(80000m);
        result.AssumptionsApplied.Should().NotBeEmpty();
        result.ConfidenceScore.Should().BeGreaterThanOrEqualTo(70m);
    }

    [Fact]
    public async Task Simulate_BranchExpansion_IncludesCapexAndOpex()
    {
        // Arrange: 1 new branch, $50k Capex, $5k/mo Opex, $15k/mo expected revenue
        var request = new SimulateScenarioRequest(
            ScenarioName: "New Branch Expansion",
            Description: "Testing expansion payback",
            PriceChangePercent: 0m,
            NewBranchesCount: 1,
            CapexPerNewBranch: 50000m,
            MonthlyOpexPerNewBranch: 5000m,
            ExpectedMonthlyRevenuePerNewBranch: 15000m,
            ProjectionMonths: 12,
            SaveScenario: false
        );

        // Act
        var result = await _simulator.SimulateScenarioAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.BreakevenMonths.Should().NotBeNull();
        result.MonthlyProjections.Should().HaveCount(12);
        result.AssumptionsApplied.Should().Contain(a => a.Contains("CapEx"));
    }

    [Fact]
    public async Task Simulate_ZeroAdjustments_MatchesBaseline()
    {
        // Arrange: No adjustments
        var request = new SimulateScenarioRequest(
            ScenarioName: "Status Quo",
            Description: "Current run-rate projection",
            PriceChangePercent: 0m,
            SaveScenario: false
        );

        // Act
        var result = await _simulator.SimulateScenarioAsync(request);

        // Assert
        result.SummaryMetrics["monthly_revenue"].SimulatedValue.Should().Be(100000m);
        result.SummaryMetrics["monthly_expenses"].SimulatedValue.Should().Be(70000m);
        result.SummaryMetrics["monthly_profit"].SimulatedValue.Should().Be(30000m);
    }
}
