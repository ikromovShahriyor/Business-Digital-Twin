using BusinessTwin.Domain.Entities;
using BusinessTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BusinessTwin.Application.Common.Interfaces;

public interface ICurrentTenantService
{
    Guid? CompanyId { get; }
    Guid? UserId { get; }
    string? UserEmail { get; }
    UserRole? Role { get; }
    void SetTenant(Guid companyId, Guid? userId = null, string? userEmail = null, UserRole? role = null);
}

public interface IApplicationDbContext
{
    DbSet<Company> Companies { get; }
    DbSet<User> Users { get; }
    DbSet<UserCompanyRole> UserCompanyRoles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Branch> Branches { get; }
    DbSet<Employee> Employees { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<Product> Products { get; }
    DbSet<InventoryItem> InventoryItems { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<Sale> Sales { get; }
    DbSet<SaleItem> SaleItems { get; }
    DbSet<Purchase> Purchases { get; }
    DbSet<PurchaseItem> PurchaseItems { get; }
    DbSet<DebtRecord> DebtRecords { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Expense> Expenses { get; }
    DbSet<Scenario> Scenarios { get; }
    DbSet<ScenarioAssumption> ScenarioAssumptions { get; }
    DbSet<ScenarioMetric> ScenarioMetrics { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<CompanySetting> CompanySettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, Guid companyId, UserRole role);
    RefreshToken GenerateRefreshToken(Guid userId, string? ipAddress);
}

public interface IRedisCacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default);
}
