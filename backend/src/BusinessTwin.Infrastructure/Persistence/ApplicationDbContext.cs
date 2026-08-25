using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Domain.Common;
using BusinessTwin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BusinessTwin.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentTenantService? _tenantService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentTenantService? tenantService = null)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserCompanyRole> UserCompanyRoles => Set<UserCompanyRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>();
    public DbSet<DebtRecord> DebtRecords => Set<DebtRecord>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Scenario> Scenarios => Set<Scenario>();
    public DbSet<ScenarioAssumption> ScenarioAssumptions => Set<ScenarioAssumption>();
    public DbSet<ScenarioMetric> ScenarioMetrics => Set<ScenarioMetric>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<CompanySetting> CompanySettings => Set<CompanySetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global multi-tenancy query filters for all IHasCompany entities
        modelBuilder.Entity<Branch>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Employee>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Customer>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Supplier>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Product>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<InventoryItem>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<StockMovement>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Sale>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Purchase>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<DebtRecord>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Payment>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Expense>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Scenario>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<AuditLog>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<Notification>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);
        modelBuilder.Entity<CompanySetting>().HasQueryFilter(e => !_tenantService!.CompanyId.HasValue || e.CompanyId == _tenantService.CompanyId.Value);

        // Decimal precision configurations (18, 2)
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // Indices for fast tenant querying and reporting
        modelBuilder.Entity<Sale>().HasIndex(s => new { s.CompanyId, s.SaleDateUtc });
        modelBuilder.Entity<Purchase>().HasIndex(p => new { p.CompanyId, p.PurchaseDateUtc });
        modelBuilder.Entity<Expense>().HasIndex(e => new { e.CompanyId, e.ExpenseDateUtc });
        modelBuilder.Entity<InventoryItem>().HasIndex(i => new { i.CompanyId, i.BranchId, i.ProductId });
        modelBuilder.Entity<StockMovement>().HasIndex(m => new { m.CompanyId, m.BranchId, m.ProductId, m.MovementDateUtc });
        modelBuilder.Entity<DebtRecord>().HasIndex(d => new { d.CompanyId, d.Type, d.Status });
        modelBuilder.Entity<Payment>().HasIndex(p => new { p.CompanyId, p.PaymentDateUtc });
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        var now = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
