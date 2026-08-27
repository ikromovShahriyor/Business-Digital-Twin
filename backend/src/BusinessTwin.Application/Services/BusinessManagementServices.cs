using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Application.DTOs;
using BusinessTwin.Domain.Entities;
using BusinessTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BusinessTwin.Application.Services;

public interface IBusinessManagementService
{
    // Branches
    Task<List<BranchDto>> GetBranchesAsync(CancellationToken cancellationToken = default);
    Task<BranchDto> CreateBranchAsync(CreateBranchDto dto, CancellationToken cancellationToken = default);
    Task<BranchDto> UpdateBranchAsync(Guid id, UpdateBranchDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteBranchAsync(Guid id, CancellationToken cancellationToken = default);

    // Employees
    Task<List<EmployeeDto>> GetEmployeesAsync(Guid? branchId = null, CancellationToken cancellationToken = default);
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, CancellationToken cancellationToken = default);
    Task<EmployeeDto> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteEmployeeAsync(Guid id, CancellationToken cancellationToken = default);

    // Customers
    Task<List<CustomerDto>> GetCustomersAsync(string? search = null, CustomerSegment? segment = null, CancellationToken cancellationToken = default);
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto, CancellationToken cancellationToken = default);
    Task<CustomerDto> UpdateCustomerAsync(Guid id, UpdateCustomerDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteCustomerAsync(Guid id, CancellationToken cancellationToken = default);

    // Suppliers
    Task<List<SupplierDto>> GetSuppliersAsync(string? search = null, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<SupplierDto> UpdateSupplierAsync(Guid id, UpdateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteSupplierAsync(Guid id, CancellationToken cancellationToken = default);

    // Products
    Task<List<ProductDto>> GetProductsAsync(string? search = null, string? category = null, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);

    // Inventory & Stock Movements
    Task<List<InventoryItemDto>> GetInventoryAsync(Guid? branchId = null, string? search = null, bool? isLowStock = null, CancellationToken cancellationToken = default);
    Task<InventoryItemDto> AdjustStockAsync(UpdateInventoryStockDto dto, CancellationToken cancellationToken = default);
    Task<List<StockMovementDto>> GetStockMovementsAsync(Guid? branchId = null, Guid? productId = null, int take = 50, CancellationToken cancellationToken = default);

    // Sales & Orders
    Task<List<SaleDto>> GetSalesAsync(Guid? branchId = null, Guid? customerId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<SaleDto> CreateSaleAsync(CreateSaleDto dto, CancellationToken cancellationToken = default);

    // Purchases & Supplies
    Task<List<PurchaseDto>> GetPurchasesAsync(Guid? supplierId = null, Guid? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto, CancellationToken cancellationToken = default);

    // Debts & Credit Management
    Task<List<DebtRecordDto>> GetDebtsAsync(DebtType? type = null, DebtStatus? status = null, CancellationToken cancellationToken = default);
    Task<DebtRecordDto> CreateDebtAsync(CreateDebtRecordDto dto, CancellationToken cancellationToken = default);
    Task<DebtRecordDto> PayDebtAsync(PayDebtDto dto, CancellationToken cancellationToken = default);
    Task<DebtSummaryDto> GetDebtSummaryAsync(CancellationToken cancellationToken = default);

    // Payments Ledger
    Task<List<PaymentDto>> GetPaymentsAsync(PaymentType? type = null, Guid? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto, CancellationToken cancellationToken = default);

    // Expenses
    Task<List<ExpenseDto>> GetExpensesAsync(Guid? branchId = null, ExpenseCategory? category = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto, CancellationToken cancellationToken = default);
    Task<ExpenseDto> UpdateExpenseAsync(Guid id, UpdateExpenseDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteExpenseAsync(Guid id, CancellationToken cancellationToken = default);

    // Financial Reports
    Task<IncomeStatementDto> GetIncomeStatementAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<CashFlowEstimateDto> GetCashFlowEstimateAsync(CancellationToken cancellationToken = default);
    Task<StockValuationDto> GetStockValuationAsync(CancellationToken cancellationToken = default);

    // Notifications & Audit Logs
    Task<List<NotificationDto>> GetNotificationsAsync(CancellationToken cancellationToken = default);
    Task MarkNotificationReadAsync(Guid notificationId, CancellationToken cancellationToken = default);
    Task<List<AuditLogDto>> GetAuditLogsAsync(int take = 50, CancellationToken cancellationToken = default);
}

public class BusinessManagementService : IBusinessManagementService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _tenantService;
    private readonly IRedisCacheService _cacheService;

    public BusinessManagementService(
        IApplicationDbContext context,
        ICurrentTenantService tenantService,
        IRedisCacheService cacheService)
    {
        _context = context;
        _tenantService = tenantService;
        _cacheService = cacheService;
    }

    private Guid GetCompanyId() => _tenantService.CompanyId ?? throw new UnauthorizedAccessException("No active company workspace.");

    private async Task InvalidateTwinCacheAsync(Guid companyId, CancellationToken cancellationToken)
    {
        await _cacheService.RemoveAsync($"digital_twin_snapshot_{companyId}", cancellationToken);
    }

    // --- BRANCHES ---
    public async Task<List<BranchDto>> GetBranchesAsync(CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var branches = await _context.Branches
            .Where(b => b.CompanyId == companyId && !b.IsDeleted)
            .Include(b => b.Employees)
            .Include(b => b.Sales)
            .OrderByDescending(b => b.IsMainBranch)
            .ThenBy(b => b.Name)
            .ToListAsync(cancellationToken);

        return branches.Select(b => new BranchDto(
            b.Id,
            b.Name,
            b.Code,
            b.Address,
            b.Phone,
            b.ManagerName,
            b.IsMainBranch,
            b.MonthlyRent,
            b.IsActive,
            b.Employees.Count(e => e.IsActive && !e.IsDeleted),
            b.Sales.Where(s => s.Status == SaleStatus.Completed && !s.IsDeleted).Sum(s => s.TotalAmount)
        )).ToList();
    }

    public async Task<BranchDto> CreateBranchAsync(CreateBranchDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var branch = new Branch
        {
            CompanyId = companyId,
            Name = dto.Name.Trim(),
            Code = dto.Code.Trim().ToUpper(),
            Address = dto.Address?.Trim(),
            Phone = dto.Phone?.Trim(),
            ManagerName = dto.ManagerName?.Trim(),
            IsMainBranch = dto.IsMainBranch,
            MonthlyRent = Math.Max(0, dto.MonthlyRent),
            IsActive = true
        };

        _context.Branches.Add(branch);
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new BranchDto(branch.Id, branch.Name, branch.Code, branch.Address, branch.Phone, branch.ManagerName, branch.IsMainBranch, branch.MonthlyRent, true, 0, 0);
    }

    public async Task<BranchDto> UpdateBranchAsync(Guid id, UpdateBranchDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var branch = await _context.Branches
            .Include(b => b.Employees)
            .Include(b => b.Sales)
            .FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId && !b.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Branch not found");

        branch.Name = dto.Name.Trim();
        branch.Code = dto.Code.Trim().ToUpper();
        branch.Address = dto.Address?.Trim();
        branch.Phone = dto.Phone?.Trim();
        branch.ManagerName = dto.ManagerName?.Trim();
        branch.IsMainBranch = dto.IsMainBranch;
        branch.MonthlyRent = Math.Max(0, dto.MonthlyRent);
        branch.IsActive = dto.IsActive;

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new BranchDto(
            branch.Id,
            branch.Name,
            branch.Code,
            branch.Address,
            branch.Phone,
            branch.ManagerName,
            branch.IsMainBranch,
            branch.MonthlyRent,
            branch.IsActive,
            branch.Employees.Count(e => e.IsActive && !e.IsDeleted),
            branch.Sales.Where(s => s.Status == SaleStatus.Completed && !s.IsDeleted).Sum(s => s.TotalAmount)
        );
    }

    public async Task<bool> DeleteBranchAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var branch = await _context.Branches.FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId && !b.IsDeleted, cancellationToken);
        if (branch == null) return false;

        branch.IsDeleted = true;
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- EMPLOYEES ---
    public async Task<List<EmployeeDto>> GetEmployeesAsync(Guid? branchId = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Employees
            .Where(e => e.CompanyId == companyId && !e.IsDeleted)
            .Include(e => e.Branch)
            .Include(e => e.Sales)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(e => e.BranchId == branchId.Value);

        var list = await query.OrderBy(e => e.Department).ThenBy(e => e.FirstName).ToListAsync(cancellationToken);

        return list.Select(e => new EmployeeDto(
            e.Id,
            e.BranchId,
            e.Branch?.Name,
            e.FirstName,
            e.LastName,
            e.FullName,
            e.Position,
            e.Department,
            e.Phone,
            e.Email,
            e.MonthlySalary,
            e.HireDateUtc,
            e.IsActive,
            e.Sales.Where(s => s.Status == SaleStatus.Completed && !s.IsDeleted).Sum(s => s.TotalAmount)
        )).ToList();
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var emp = new Employee
        {
            CompanyId = companyId,
            BranchId = dto.BranchId,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Position = dto.Position.Trim(),
            Department = dto.Department.Trim(),
            Phone = dto.Phone?.Trim(),
            Email = dto.Email?.Trim(),
            MonthlySalary = Math.Max(0, dto.MonthlySalary),
            HireDateUtc = dto.HireDateUtc ?? DateTime.UtcNow,
            IsActive = true
        };

        _context.Employees.Add(emp);
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        string? branchName = null;
        if (dto.BranchId.HasValue)
        {
            var b = await _context.Branches.FindAsync(new object[] { dto.BranchId.Value }, cancellationToken);
            branchName = b?.Name;
        }

        return new EmployeeDto(emp.Id, emp.BranchId, branchName, emp.FirstName, emp.LastName, emp.FullName, emp.Position, emp.Department, emp.Phone, emp.Email, emp.MonthlySalary, emp.HireDateUtc, true, 0m);
    }

    public async Task<EmployeeDto> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var emp = await _context.Employees
            .Include(e => e.Branch)
            .Include(e => e.Sales)
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyId == companyId && !e.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Employee not found");

        emp.BranchId = dto.BranchId;
        emp.FirstName = dto.FirstName.Trim();
        emp.LastName = dto.LastName.Trim();
        emp.Position = dto.Position.Trim();
        emp.Department = dto.Department.Trim();
        emp.Phone = dto.Phone?.Trim();
        emp.Email = dto.Email?.Trim();
        emp.MonthlySalary = Math.Max(0, dto.MonthlySalary);
        emp.IsActive = dto.IsActive;

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new EmployeeDto(
            emp.Id,
            emp.BranchId,
            emp.Branch?.Name,
            emp.FirstName,
            emp.LastName,
            emp.FullName,
            emp.Position,
            emp.Department,
            emp.Phone,
            emp.Email,
            emp.MonthlySalary,
            emp.HireDateUtc,
            emp.IsActive,
            emp.Sales.Where(s => s.Status == SaleStatus.Completed && !s.IsDeleted).Sum(s => s.TotalAmount)
        );
    }

    public async Task<bool> DeleteEmployeeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var emp = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id && e.CompanyId == companyId && !e.IsDeleted, cancellationToken);
        if (emp == null) return false;

        emp.IsDeleted = true;
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- CUSTOMERS ---
    public async Task<List<CustomerDto>> GetCustomersAsync(string? search = null, CustomerSegment? segment = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Customers.Where(c => c.CompanyId == companyId && !c.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || (c.Phone != null && c.Phone.Contains(s)) || (c.Email != null && c.Email.ToLower().Contains(s)));
        }

        var list = (await query.ToListAsync(cancellationToken)).OrderByDescending(c => c.TotalSpent).ToList();

        return list.Select(c => new CustomerDto(
            c.Id,
            c.Name,
            c.ContactPerson,
            c.Email,
            c.Phone,
            c.Address,
            c.TaxNumber,
            c.Segment,
            c.TotalSpent,
            c.TotalOrders,
            c.OutstandingDebt,
            c.TotalOrders > 0 ? Math.Round(c.TotalSpent / c.TotalOrders, 2) : 0m,
            c.FirstPurchaseAtUtc,
            c.LastPurchaseAtUtc
        )).ToList();
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var customer = new Customer
        {
            CompanyId = companyId,
            Name = dto.Name.Trim(),
            ContactPerson = dto.ContactPerson?.Trim(),
            Email = dto.Email?.Trim(),
            Phone = dto.Phone?.Trim(),
            Address = dto.Address?.Trim(),
            TaxNumber = dto.TaxNumber?.Trim(),
            Segment = dto.Segment,
            TotalSpent = 0m,
            TotalOrders = 0,
            OutstandingDebt = 0m,
            IsActive = true
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(cancellationToken);

        return new CustomerDto(customer.Id, customer.Name, customer.ContactPerson, customer.Email, customer.Phone, customer.Address, customer.TaxNumber, customer.Segment, 0, 0, 0, 0, null, null);
    }

    public async Task<CustomerDto> UpdateCustomerAsync(Guid id, UpdateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id && c.CompanyId == companyId && !c.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Customer not found");

        customer.Name = dto.Name.Trim();
        customer.ContactPerson = dto.ContactPerson?.Trim();
        customer.Email = dto.Email?.Trim();
        customer.Phone = dto.Phone?.Trim();
        customer.Address = dto.Address?.Trim();
        customer.TaxNumber = dto.TaxNumber?.Trim();
        customer.Segment = dto.Segment;
        customer.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return new CustomerDto(
            customer.Id,
            customer.Name,
            customer.ContactPerson,
            customer.Email,
            customer.Phone,
            customer.Address,
            customer.TaxNumber,
            customer.Segment,
            customer.TotalSpent,
            customer.TotalOrders,
            customer.OutstandingDebt,
            customer.TotalOrders > 0 ? Math.Round(customer.TotalSpent / customer.TotalOrders, 2) : 0m,
            customer.FirstPurchaseAtUtc,
            customer.LastPurchaseAtUtc
        );
    }

    public async Task<bool> DeleteCustomerAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id && c.CompanyId == companyId && !c.IsDeleted, cancellationToken);
        if (customer == null) return false;

        customer.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- SUPPLIERS ---
    public async Task<List<SupplierDto>> GetSuppliersAsync(string? search = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Suppliers
            .Where(s => s.CompanyId == companyId && !s.IsDeleted)
            .Include(s => s.Purchases)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term) || (s.Phone != null && s.Phone.Contains(term)) || (s.Category.ToLower().Contains(term)));
        }

        var list = (await query.ToListAsync(cancellationToken)).OrderByDescending(s => s.TotalPurchases).ToList();

        return list.Select(s => new SupplierDto(
            s.Id,
            s.Name,
            s.ContactPerson,
            s.Email,
            s.Phone,
            s.Address,
            s.TaxNumber,
            s.Category,
            s.TotalPurchases,
            s.OutstandingDebt,
            s.IsActive,
            s.Purchases.Count(p => !p.IsDeleted)
        )).ToList();
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var supplier = new Supplier
        {
            CompanyId = companyId,
            Name = dto.Name.Trim(),
            ContactPerson = dto.ContactPerson?.Trim(),
            Email = dto.Email?.Trim(),
            Phone = dto.Phone?.Trim(),
            Address = dto.Address?.Trim(),
            TaxNumber = dto.TaxNumber?.Trim(),
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "Elektronika" : dto.Category.Trim(),
            TotalPurchases = 0m,
            OutstandingDebt = 0m,
            IsActive = true
        };

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync(cancellationToken);

        return new SupplierDto(supplier.Id, supplier.Name, supplier.ContactPerson, supplier.Email, supplier.Phone, supplier.Address, supplier.TaxNumber, supplier.Category, 0, 0, true, 0);
    }

    public async Task<SupplierDto> UpdateSupplierAsync(Guid id, UpdateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var supplier = await _context.Suppliers
            .Include(s => s.Purchases)
            .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId && !s.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Supplier not found");

        supplier.Name = dto.Name.Trim();
        supplier.ContactPerson = dto.ContactPerson?.Trim();
        supplier.Email = dto.Email?.Trim();
        supplier.Phone = dto.Phone?.Trim();
        supplier.Address = dto.Address?.Trim();
        supplier.TaxNumber = dto.TaxNumber?.Trim();
        supplier.Category = dto.Category.Trim();
        supplier.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return new SupplierDto(
            supplier.Id,
            supplier.Name,
            supplier.ContactPerson,
            supplier.Email,
            supplier.Phone,
            supplier.Address,
            supplier.TaxNumber,
            supplier.Category,
            supplier.TotalPurchases,
            supplier.OutstandingDebt,
            supplier.IsActive,
            supplier.Purchases.Count(p => !p.IsDeleted)
        );
    }

    public async Task<bool> DeleteSupplierAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId && !s.IsDeleted, cancellationToken);
        if (supplier == null) return false;

        supplier.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- PRODUCTS ---
    public async Task<List<ProductDto>> GetProductsAsync(string? search = null, string? category = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Products
            .Where(p => p.CompanyId == companyId && !p.IsDeleted)
            .Include(p => p.InventoryItems)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) || (p.Sku != null && p.Sku.ToLower().Contains(s)) || (p.Barcode != null && p.Barcode.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category == category);
        }

        var list = await query.OrderBy(p => p.Category).ThenBy(p => p.Name).ToListAsync(cancellationToken);

        return list.Select(p => new ProductDto(
            p.Id,
            p.Name,
            p.Sku,
            p.Barcode,
            p.Category,
            p.Unit,
            p.CostPrice,
            p.SellingPrice,
            p.GrossMarginAmount,
            p.GrossMarginPercent,
            p.MinStockThreshold,
            p.InventoryItems.Sum(i => i.QuantityOnHand),
            p.Description,
            p.IsActive
        )).ToList();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var product = new Product
        {
            CompanyId = companyId,
            Name = dto.Name.Trim(),
            Sku = dto.Sku?.Trim().ToUpper(),
            Barcode = dto.Barcode?.Trim(),
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category.Trim(),
            Unit = string.IsNullOrWhiteSpace(dto.Unit) ? "dona" : dto.Unit.Trim(),
            CostPrice = Math.Max(0, dto.CostPrice),
            SellingPrice = Math.Max(0, dto.SellingPrice),
            MinStockThreshold = Math.Max(1, dto.MinStockThreshold),
            Description = dto.Description?.Trim(),
            IsActive = true
        };

        _context.Products.Add(product);
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new ProductDto(product.Id, product.Name, product.Sku, product.Barcode, product.Category, product.Unit, product.CostPrice, product.SellingPrice, product.GrossMarginAmount, product.GrossMarginPercent, product.MinStockThreshold, 0, product.Description, true);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var product = await _context.Products
            .Include(p => p.InventoryItems)
            .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId && !p.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Product not found");

        product.Name = dto.Name.Trim();
        product.Sku = dto.Sku?.Trim().ToUpper();
        product.Barcode = dto.Barcode?.Trim();
        product.Category = dto.Category.Trim();
        product.Unit = dto.Unit.Trim();
        product.CostPrice = Math.Max(0, dto.CostPrice);
        product.SellingPrice = Math.Max(0, dto.SellingPrice);
        product.MinStockThreshold = Math.Max(1, dto.MinStockThreshold);
        product.Description = dto.Description?.Trim();
        product.IsActive = dto.IsActive;

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new ProductDto(
            product.Id,
            product.Name,
            product.Sku,
            product.Barcode,
            product.Category,
            product.Unit,
            product.CostPrice,
            product.SellingPrice,
            product.GrossMarginAmount,
            product.GrossMarginPercent,
            product.MinStockThreshold,
            product.InventoryItems.Sum(i => i.QuantityOnHand),
            product.Description,
            product.IsActive
        );
    }

    public async Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId && !p.IsDeleted, cancellationToken);
        if (product == null) return false;

        product.IsDeleted = true;
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- INVENTORY & MOVEMENTS ---
    public async Task<List<InventoryItemDto>> GetInventoryAsync(Guid? branchId = null, string? search = null, bool? isLowStock = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.InventoryItems
            .Where(i => i.CompanyId == companyId && !i.IsDeleted)
            .Include(i => i.Branch)
            .Include(i => i.Product)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(i => i.BranchId == branchId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(i => i.Product.Name.ToLower().Contains(s) || (i.Product.Sku != null && i.Product.Sku.ToLower().Contains(s)));
        }

        if (isLowStock == true)
            query = query.Where(i => i.QuantityOnHand <= i.ReorderPoint);

        var list = await query.OrderBy(i => i.Branch.Name).ThenBy(i => i.Product.Name).ToListAsync(cancellationToken);

        return list.Select(i => new InventoryItemDto(
            i.Id,
            i.BranchId,
            i.Branch.Name,
            i.ProductId,
            i.Product.Name,
            i.Product.Sku,
            i.Product.Category,
            i.Product.CostPrice,
            i.Product.SellingPrice,
            i.QuantityOnHand,
            i.ReservedQuantity,
            i.AvailableQuantity,
            Math.Round(i.QuantityOnHand * i.Product.CostPrice, 2),
            i.ReorderPoint,
            i.IsLowStock,
            i.LastRestockedAtUtc
        )).ToList();
    }

    public async Task<InventoryItemDto> AdjustStockAsync(UpdateInventoryStockDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var item = await _context.InventoryItems
            .Include(i => i.Branch)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.CompanyId == companyId && i.BranchId == dto.BranchId && i.ProductId == dto.ProductId && !i.IsDeleted, cancellationToken);

        decimal prevQty = item?.QuantityOnHand ?? 0m;
        decimal newQty = Math.Max(0, prevQty + dto.QuantityChange);

        if (item == null)
        {
            var product = await _context.Products.FindAsync(new object[] { dto.ProductId }, cancellationToken) ?? throw new KeyNotFoundException("Product not found");
            item = new InventoryItem
            {
                CompanyId = companyId,
                BranchId = dto.BranchId,
                ProductId = dto.ProductId,
                QuantityOnHand = newQty,
                ReorderPoint = product.MinStockThreshold,
                LastRestockedAtUtc = DateTime.UtcNow
            };
            _context.InventoryItems.Add(item);
        }
        else
        {
            item.QuantityOnHand = newQty;
            item.LastRestockedAtUtc = DateTime.UtcNow;
        }

        // Log Stock Movement
        var movement = new StockMovement
        {
            CompanyId = companyId,
            BranchId = dto.BranchId,
            ProductId = dto.ProductId,
            Type = dto.Type,
            Quantity = dto.QuantityChange,
            PreviousQuantity = prevQty,
            NewQuantity = newQty,
            Reason = dto.Reason ?? "Manual inventory adjustment",
            PerformedByUserId = _tenantService.UserId,
            MovementDateUtc = DateTime.UtcNow
        };
        _context.StockMovements.Add(movement);

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var reloaded = await _context.InventoryItems
            .Include(i => i.Branch)
            .Include(i => i.Product)
            .FirstAsync(i => i.Id == item.Id, cancellationToken);

        return new InventoryItemDto(
            reloaded.Id,
            reloaded.BranchId,
            reloaded.Branch.Name,
            reloaded.ProductId,
            reloaded.Product.Name,
            reloaded.Product.Sku,
            reloaded.Product.Category,
            reloaded.Product.CostPrice,
            reloaded.Product.SellingPrice,
            reloaded.QuantityOnHand,
            reloaded.ReservedQuantity,
            reloaded.AvailableQuantity,
            Math.Round(reloaded.QuantityOnHand * reloaded.Product.CostPrice, 2),
            reloaded.ReorderPoint,
            reloaded.IsLowStock,
            reloaded.LastRestockedAtUtc
        );
    }

    public async Task<List<StockMovementDto>> GetStockMovementsAsync(Guid? branchId = null, Guid? productId = null, int take = 50, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.StockMovements
            .Where(m => m.CompanyId == companyId && !m.IsDeleted)
            .Include(m => m.Branch)
            .Include(m => m.Product)
            .AsQueryable();

        if (branchId.HasValue) query = query.Where(m => m.BranchId == branchId.Value);
        if (productId.HasValue) query = query.Where(m => m.ProductId == productId.Value);

        var list = await query.OrderByDescending(m => m.MovementDateUtc).Take(take).ToListAsync(cancellationToken);

        return list.Select(m => new StockMovementDto(
            m.Id,
            m.BranchId,
            m.Branch.Name,
            m.ProductId,
            m.Product.Name,
            m.Product.Sku,
            m.Type,
            m.Quantity,
            m.PreviousQuantity,
            m.NewQuantity,
            m.ReferenceNumber,
            m.Reason,
            m.MovementDateUtc
        )).ToList();
    }

    // --- SALES & ORDERS ---
    public async Task<List<SaleDto>> GetSalesAsync(Guid? branchId = null, Guid? customerId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Sales
            .Where(s => s.CompanyId == companyId && !s.IsDeleted)
            .Include(s => s.Branch)
            .Include(s => s.Customer)
            .Include(s => s.Employee)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
            .AsQueryable();

        if (branchId.HasValue) query = query.Where(s => s.BranchId == branchId.Value);
        if (customerId.HasValue) query = query.Where(s => s.CustomerId == customerId.Value);
        if (from.HasValue) query = query.Where(s => s.SaleDateUtc >= from.Value);
        if (to.HasValue) query = query.Where(s => s.SaleDateUtc <= to.Value);

        var list = await query.OrderByDescending(s => s.SaleDateUtc).Take(100).ToListAsync(cancellationToken);

        return list.Select(s => new SaleDto(
            s.Id,
            s.BranchId,
            s.Branch.Name,
            s.CustomerId,
            s.Customer?.Name,
            s.EmployeeId,
            s.Employee?.FullName,
            s.SaleNumber,
            s.SaleDateUtc,
            s.SubTotal,
            s.TaxAmount,
            s.DiscountAmount,
            s.TotalAmount,
            s.TotalCostAmount,
            s.NetProfitAmount,
            s.PaidAmount,
            s.RemainingAmount,
            s.Channel,
            s.Status,
            s.PaymentMethod,
            s.Notes,
            s.Items.Select(i => new SaleItemDto(
                i.Id,
                i.ProductId,
                i.Product?.Name ?? "Product",
                i.Product?.Sku,
                i.Quantity,
                i.UnitPrice,
                i.CostPrice,
                i.TotalPrice,
                i.TotalPrice - i.TotalCost
            )).ToList()
        )).ToList();
    }

    public async Task<SaleDto> CreateSaleAsync(CreateSaleDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id) && p.CompanyId == companyId)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        decimal subTotal = 0m;
        decimal totalCost = 0m;
        var saleItems = new List<SaleItem>();

        foreach (var itemDto in dto.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var prod))
                continue;

            var itemTotal = itemDto.Quantity * itemDto.UnitPrice;
            var itemCost = itemDto.Quantity * prod.CostPrice;
            subTotal += itemTotal;
            totalCost += itemCost;

            saleItems.Add(new SaleItem
            {
                ProductId = prod.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                CostPrice = prod.CostPrice
            });
        }

        var totalAmount = Math.Max(0, subTotal - dto.DiscountAmount);
        var paidAmount = Math.Min(totalAmount, Math.Max(0, dto.PaidAmount));
        var remainingDebt = Math.Max(0, totalAmount - paidAmount);

        var saleNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var saleDate = dto.SaleDateUtc ?? DateTime.UtcNow;

        var status = remainingDebt > 0 ? SaleStatus.OnCredit : SaleStatus.Completed;

        var sale = new Sale
        {
            CompanyId = companyId,
            BranchId = dto.BranchId,
            CustomerId = dto.CustomerId,
            EmployeeId = dto.EmployeeId,
            SaleNumber = saleNumber,
            SaleDateUtc = saleDate,
            SubTotal = subTotal,
            DiscountAmount = dto.DiscountAmount,
            TotalAmount = totalAmount,
            TotalCostAmount = totalCost,
            PaidAmount = paidAmount,
            Channel = dto.Channel,
            Status = status,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            Items = saleItems
        };

        _context.Sales.Add(sale);

        // 1. Automatically Deduct from Inventory & Log StockMovements
        foreach (var sItem in saleItems)
        {
            var inv = await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.CompanyId == companyId && i.BranchId == dto.BranchId && i.ProductId == sItem.ProductId, cancellationToken);

            decimal prevStock = inv?.QuantityOnHand ?? 0m;
            decimal newStock = Math.Max(0, prevStock - sItem.Quantity);

            if (inv != null)
            {
                inv.QuantityOnHand = newStock;
            }
            else
            {
                inv = new InventoryItem
                {
                    CompanyId = companyId,
                    BranchId = dto.BranchId,
                    ProductId = sItem.ProductId,
                    QuantityOnHand = newStock,
                    ReorderPoint = 5m
                };
                _context.InventoryItems.Add(inv);
            }

            var movement = new StockMovement
            {
                CompanyId = companyId,
                BranchId = dto.BranchId,
                ProductId = sItem.ProductId,
                Type = StockMovementType.StockOutSale,
                Quantity = -sItem.Quantity,
                PreviousQuantity = prevStock,
                NewQuantity = newStock,
                ReferenceNumber = saleNumber,
                Reason = $"Sotuv #{saleNumber}",
                PerformedByUserId = _tenantService.UserId,
                MovementDateUtc = saleDate
            };
            _context.StockMovements.Add(movement);
        }

        // 2. Record Payment Entry if PaidAmount > 0
        if (paidAmount > 0)
        {
            var payment = new Payment
            {
                CompanyId = companyId,
                BranchId = dto.BranchId,
                SaleId = sale.Id,
                Type = PaymentType.InflowSale,
                Amount = paidAmount,
                PaymentMethod = dto.PaymentMethod,
                TransactionReference = $"PAY-{saleNumber}",
                PaymentDateUtc = saleDate,
                Notes = $"Sotuv to'lovi #{saleNumber}"
            };
            _context.Payments.Add(payment);
        }

        // 3. Record Debt if Remaining > 0
        if (remainingDebt > 0 && dto.CustomerId.HasValue)
        {
            var debt = new DebtRecord
            {
                CompanyId = companyId,
                Type = DebtType.CustomerDebt,
                CustomerId = dto.CustomerId.Value,
                SaleId = sale.Id,
                Title = $"Nasiya #{saleNumber}",
                TotalAmount = remainingDebt,
                PaidAmount = 0m,
                DueDateUtc = dto.DebtDueDateUtc ?? saleDate.AddDays(30),
                Status = DebtStatus.Active,
                Notes = $"Sotuvdan qolgan nasiya summasi #{saleNumber}"
            };
            _context.DebtRecords.Add(debt);
        }

        // 4. Update Customer Stats
        if (dto.CustomerId.HasValue)
        {
            var customer = await _context.Customers.FindAsync(new object[] { dto.CustomerId.Value }, cancellationToken);
            if (customer != null)
            {
                customer.TotalSpent += totalAmount;
                customer.TotalOrders += 1;
                customer.OutstandingDebt += remainingDebt;
                customer.LastPurchaseAtUtc = saleDate;
                if (!customer.FirstPurchaseAtUtc.HasValue)
                    customer.FirstPurchaseAtUtc = saleDate;
                if (customer.TotalSpent > 20000m)
                    customer.Segment = CustomerSegment.VIP;
                else if (customer.TotalOrders > 2)
                    customer.Segment = CustomerSegment.Regular;
            }
        }

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var branch = await _context.Branches.FindAsync(new object[] { dto.BranchId }, cancellationToken);
        var cust = dto.CustomerId.HasValue ? await _context.Customers.FindAsync(new object[] { dto.CustomerId.Value }, cancellationToken) : null;
        var emp = dto.EmployeeId.HasValue ? await _context.Employees.FindAsync(new object[] { dto.EmployeeId.Value }, cancellationToken) : null;

        return new SaleDto(
            sale.Id,
            sale.BranchId,
            branch?.Name ?? "Branch",
            sale.CustomerId,
            cust?.Name,
            sale.EmployeeId,
            emp?.FullName,
            sale.SaleNumber,
            sale.SaleDateUtc,
            sale.SubTotal,
            sale.TaxAmount,
            sale.DiscountAmount,
            sale.TotalAmount,
            sale.TotalCostAmount,
            sale.NetProfitAmount,
            sale.PaidAmount,
            sale.RemainingAmount,
            sale.Channel,
            sale.Status,
            sale.PaymentMethod,
            sale.Notes,
            sale.Items.Select(i => new SaleItemDto(
                i.Id,
                i.ProductId,
                products.TryGetValue(i.ProductId, out var p) ? p.Name : "Product",
                products.TryGetValue(i.ProductId, out var p2) ? p2.Sku : null,
                i.Quantity,
                i.UnitPrice,
                i.CostPrice,
                i.TotalPrice,
                i.TotalPrice - i.TotalCost
            )).ToList()
        );
    }

    // --- PURCHASES & SUPPLIES ---
    public async Task<List<PurchaseDto>> GetPurchasesAsync(Guid? supplierId = null, Guid? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Purchases
            .Where(p => p.CompanyId == companyId && !p.IsDeleted)
            .Include(p => p.Supplier)
            .Include(p => p.Branch)
            .Include(p => p.Items)
                .ThenInclude(i => i.Product)
            .AsQueryable();

        if (supplierId.HasValue) query = query.Where(p => p.SupplierId == supplierId.Value);
        if (branchId.HasValue) query = query.Where(p => p.BranchId == branchId.Value);
        if (from.HasValue) query = query.Where(p => p.PurchaseDateUtc >= from.Value);
        if (to.HasValue) query = query.Where(p => p.PurchaseDateUtc <= to.Value);

        var list = await query.OrderByDescending(p => p.PurchaseDateUtc).Take(100).ToListAsync(cancellationToken);

        return list.Select(p => new PurchaseDto(
            p.Id,
            p.SupplierId,
            p.Supplier.Name,
            p.BranchId,
            p.Branch.Name,
            p.PurchaseNumber,
            p.PurchaseDateUtc,
            p.SubTotal,
            p.TaxAmount,
            p.TotalAmount,
            p.PaidAmount,
            p.OutstandingAmount,
            p.Status,
            p.PaymentMethod,
            p.Notes,
            p.Items.Select(i => new PurchaseItemDto(
                i.Id,
                i.ProductId,
                i.Product?.Name ?? "Product",
                i.Product?.Sku,
                i.Quantity,
                i.UnitCost,
                i.TotalPrice
            )).ToList()
        )).ToList();
    }

    public async Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id) && p.CompanyId == companyId)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        decimal subTotal = 0m;
        var purchaseItems = new List<PurchaseItem>();

        foreach (var itemDto in dto.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var prod))
                continue;

            var itemTotal = itemDto.Quantity * itemDto.UnitCost;
            subTotal += itemTotal;

            purchaseItems.Add(new PurchaseItem
            {
                ProductId = prod.Id,
                Quantity = itemDto.Quantity,
                UnitCost = itemDto.UnitCost
            });

            // Update Product Cost Price if new batch has updated cost
            if (itemDto.UnitCost > 0)
            {
                prod.CostPrice = itemDto.UnitCost;
            }
        }

        var totalAmount = subTotal;
        var paidAmount = Math.Min(totalAmount, Math.Max(0, dto.PaidAmount));
        var remainingDebt = Math.Max(0, totalAmount - paidAmount);

        var purchaseNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var purchaseDate = dto.PurchaseDateUtc ?? DateTime.UtcNow;

        var purchase = new Purchase
        {
            CompanyId = companyId,
            SupplierId = dto.SupplierId,
            BranchId = dto.BranchId,
            PurchaseNumber = purchaseNumber,
            PurchaseDateUtc = purchaseDate,
            SubTotal = subTotal,
            TotalAmount = totalAmount,
            PaidAmount = paidAmount,
            Status = PurchaseStatus.Received,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            Items = purchaseItems
        };

        _context.Purchases.Add(purchase);

        // 1. Automatically Restock Inventory & Log StockMovements
        foreach (var pItem in purchaseItems)
        {
            var inv = await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.CompanyId == companyId && i.BranchId == dto.BranchId && i.ProductId == pItem.ProductId, cancellationToken);

            decimal prevStock = inv?.QuantityOnHand ?? 0m;
            decimal newStock = prevStock + pItem.Quantity;

            if (inv != null)
            {
                inv.QuantityOnHand = newStock;
                inv.LastRestockedAtUtc = purchaseDate;
            }
            else
            {
                inv = new InventoryItem
                {
                    CompanyId = companyId,
                    BranchId = dto.BranchId,
                    ProductId = pItem.ProductId,
                    QuantityOnHand = newStock,
                    ReorderPoint = 10m,
                    LastRestockedAtUtc = purchaseDate
                };
                _context.InventoryItems.Add(inv);
            }

            var movement = new StockMovement
            {
                CompanyId = companyId,
                BranchId = dto.BranchId,
                ProductId = pItem.ProductId,
                Type = StockMovementType.StockInPurchase,
                Quantity = pItem.Quantity,
                PreviousQuantity = prevStock,
                NewQuantity = newStock,
                ReferenceNumber = purchaseNumber,
                Reason = $"Ta'minot xaridi #{purchaseNumber}",
                PerformedByUserId = _tenantService.UserId,
                MovementDateUtc = purchaseDate
            };
            _context.StockMovements.Add(movement);
        }

        // 2. Record Payment Outflow if PaidAmount > 0
        if (paidAmount > 0)
        {
            var payment = new Payment
            {
                CompanyId = companyId,
                BranchId = dto.BranchId,
                PurchaseId = purchase.Id,
                Type = PaymentType.OutflowPurchase,
                Amount = paidAmount,
                PaymentMethod = dto.PaymentMethod,
                TransactionReference = $"SUPP-{purchaseNumber}",
                PaymentDateUtc = purchaseDate,
                Notes = $"Yetkazib beruvchiga to'lov #{purchaseNumber}"
            };
            _context.Payments.Add(payment);
        }

        // 3. Record Supplier Debt if remaining > 0
        if (remainingDebt > 0)
        {
            var debt = new DebtRecord
            {
                CompanyId = companyId,
                Type = DebtType.SupplierDebt,
                SupplierId = dto.SupplierId,
                PurchaseId = purchase.Id,
                Title = $"Qarzimiz: #{purchaseNumber}",
                TotalAmount = remainingDebt,
                PaidAmount = 0m,
                DueDateUtc = dto.DebtDueDateUtc ?? purchaseDate.AddDays(30),
                Status = DebtStatus.Active,
                Notes = $"Ta'minot xarididan qarzimiz #{purchaseNumber}"
            };
            _context.DebtRecords.Add(debt);
        }

        // 4. Update Supplier Stats
        var supplier = await _context.Suppliers.FindAsync(new object[] { dto.SupplierId }, cancellationToken);
        if (supplier != null)
        {
            supplier.TotalPurchases += totalAmount;
            supplier.OutstandingDebt += remainingDebt;
        }

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var branch = await _context.Branches.FindAsync(new object[] { dto.BranchId }, cancellationToken);

        return new PurchaseDto(
            purchase.Id,
            purchase.SupplierId,
            supplier?.Name ?? "Supplier",
            purchase.BranchId,
            branch?.Name ?? "Branch",
            purchase.PurchaseNumber,
            purchase.PurchaseDateUtc,
            purchase.SubTotal,
            purchase.TaxAmount,
            purchase.TotalAmount,
            purchase.PaidAmount,
            purchase.OutstandingAmount,
            purchase.Status,
            purchase.PaymentMethod,
            purchase.Notes,
            purchase.Items.Select(i => new PurchaseItemDto(
                i.Id,
                i.ProductId,
                products.TryGetValue(i.ProductId, out var p) ? p.Name : "Product",
                products.TryGetValue(i.ProductId, out var p2) ? p2.Sku : null,
                i.Quantity,
                i.UnitCost,
                i.TotalPrice
            )).ToList()
        );
    }

    // --- DEBTS ---
    public async Task<List<DebtRecordDto>> GetDebtsAsync(DebtType? type = null, DebtStatus? status = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.DebtRecords
            .Where(d => d.CompanyId == companyId && !d.IsDeleted)
            .Include(d => d.Customer)
            .Include(d => d.Supplier)
            .AsQueryable();

        if (type.HasValue) query = query.Where(d => d.Type == type.Value);
        if (status.HasValue) query = query.Where(d => d.Status == status.Value);

        var list = await query.OrderByDescending(d => d.CreatedAtUtc).ToListAsync(cancellationToken);

        return list.Select(d => new DebtRecordDto(
            d.Id,
            d.Type,
            d.CustomerId,
            d.Customer?.Name,
            d.SupplierId,
            d.Supplier?.Name,
            d.SaleId,
            d.PurchaseId,
            d.Title,
            d.TotalAmount,
            d.PaidAmount,
            d.RemainingAmount,
            d.DueDateUtc,
            d.Status,
            d.Notes,
            d.CreatedAtUtc
        )).ToList();
    }

    public async Task<DebtRecordDto> CreateDebtAsync(CreateDebtRecordDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var debt = new DebtRecord
        {
            CompanyId = companyId,
            Type = dto.Type,
            CustomerId = dto.CustomerId,
            SupplierId = dto.SupplierId,
            Title = dto.Title.Trim(),
            TotalAmount = Math.Max(0, dto.TotalAmount),
            PaidAmount = 0m,
            DueDateUtc = dto.DueDateUtc ?? DateTime.UtcNow.AddDays(30),
            Status = DebtStatus.Active,
            Notes = dto.Notes?.Trim()
        };

        _context.DebtRecords.Add(debt);

        if (dto.Type == DebtType.CustomerDebt && dto.CustomerId.HasValue)
        {
            var cust = await _context.Customers.FindAsync(new object[] { dto.CustomerId.Value }, cancellationToken);
            if (cust != null) cust.OutstandingDebt += debt.TotalAmount;
        }
        else if (dto.Type == DebtType.SupplierDebt && dto.SupplierId.HasValue)
        {
            var supp = await _context.Suppliers.FindAsync(new object[] { dto.SupplierId.Value }, cancellationToken);
            if (supp != null) supp.OutstandingDebt += debt.TotalAmount;
        }

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var cName = dto.CustomerId.HasValue ? (await _context.Customers.FindAsync(new object[] { dto.CustomerId.Value }, cancellationToken))?.Name : null;
        var sName = dto.SupplierId.HasValue ? (await _context.Suppliers.FindAsync(new object[] { dto.SupplierId.Value }, cancellationToken))?.Name : null;

        return new DebtRecordDto(debt.Id, debt.Type, debt.CustomerId, cName, debt.SupplierId, sName, null, null, debt.Title, debt.TotalAmount, 0, debt.TotalAmount, debt.DueDateUtc, debt.Status, debt.Notes, debt.CreatedAtUtc);
    }

    public async Task<DebtRecordDto> PayDebtAsync(PayDebtDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var debt = await _context.DebtRecords
            .Include(d => d.Customer)
            .Include(d => d.Supplier)
            .FirstOrDefaultAsync(d => d.Id == dto.DebtRecordId && d.CompanyId == companyId && !d.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Debt record not found");

        var payAmt = Math.Min(debt.RemainingAmount, Math.Max(0, dto.PaymentAmount));
        debt.PaidAmount += payAmt;

        if (debt.RemainingAmount <= 0)
        {
            debt.Status = DebtStatus.Paid;
        }

        // Record Payment Transaction
        var pType = debt.Type == DebtType.CustomerDebt ? PaymentType.InflowDebtCollection : PaymentType.OutflowDebtPayment;
        var payment = new Payment
        {
            CompanyId = companyId,
            DebtRecordId = debt.Id,
            Type = pType,
            Amount = payAmt,
            PaymentMethod = dto.PaymentMethod,
            TransactionReference = dto.TransactionReference ?? $"DEBT-PAY-{DateTime.UtcNow:yyyyMMddHHmm}",
            PaymentDateUtc = DateTime.UtcNow,
            PayerOrPayee = debt.Type == DebtType.CustomerDebt ? debt.Customer?.Name : debt.Supplier?.Name,
            Notes = dto.Notes ?? $"Qarz to'lovi: {debt.Title}"
        };
        _context.Payments.Add(payment);

        // Update Outstanding Debt balances
        if (debt.Type == DebtType.CustomerDebt && debt.CustomerId.HasValue)
        {
            var cust = await _context.Customers.FindAsync(new object[] { debt.CustomerId.Value }, cancellationToken);
            if (cust != null) cust.OutstandingDebt = Math.Max(0, cust.OutstandingDebt - payAmt);
        }
        else if (debt.Type == DebtType.SupplierDebt && debt.SupplierId.HasValue)
        {
            var supp = await _context.Suppliers.FindAsync(new object[] { debt.SupplierId.Value }, cancellationToken);
            if (supp != null) supp.OutstandingDebt = Math.Max(0, supp.OutstandingDebt - payAmt);
        }

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new DebtRecordDto(
            debt.Id,
            debt.Type,
            debt.CustomerId,
            debt.Customer?.Name,
            debt.SupplierId,
            debt.Supplier?.Name,
            debt.SaleId,
            debt.PurchaseId,
            debt.Title,
            debt.TotalAmount,
            debt.PaidAmount,
            debt.RemainingAmount,
            debt.DueDateUtc,
            debt.Status,
            debt.Notes,
            debt.CreatedAtUtc
        );
    }

    public async Task<DebtSummaryDto> GetDebtSummaryAsync(CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var debts = await _context.DebtRecords
            .Where(d => d.CompanyId == companyId && !d.IsDeleted)
            .ToListAsync(cancellationToken);

        var custDebts = debts.Where(d => d.Type == DebtType.CustomerDebt && d.Status == DebtStatus.Active).ToList();
        var suppDebts = debts.Where(d => d.Type == DebtType.SupplierDebt && d.Status == DebtStatus.Active).ToList();
        var now = DateTime.UtcNow;

        return new DebtSummaryDto(
            TotalCustomerDebt: custDebts.Sum(d => d.RemainingAmount),
            TotalSupplierDebt: suppDebts.Sum(d => d.RemainingAmount),
            ActiveCustomerDebtsCount: custDebts.Count,
            OverdueCustomerDebtsCount: custDebts.Count(d => d.DueDateUtc.HasValue && d.DueDateUtc.Value < now),
            ActiveSupplierDebtsCount: suppDebts.Count
        );
    }

    // --- PAYMENTS LEDGER ---
    public async Task<List<PaymentDto>> GetPaymentsAsync(PaymentType? type = null, Guid? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Payments
            .Where(p => p.CompanyId == companyId && !p.IsDeleted)
            .Include(p => p.Branch)
            .AsQueryable();

        if (type.HasValue) query = query.Where(p => p.Type == type.Value);
        if (branchId.HasValue) query = query.Where(p => p.BranchId == branchId.Value);
        if (from.HasValue) query = query.Where(p => p.PaymentDateUtc >= from.Value);
        if (to.HasValue) query = query.Where(p => p.PaymentDateUtc <= to.Value);

        var list = await query.OrderByDescending(p => p.PaymentDateUtc).Take(100).ToListAsync(cancellationToken);

        return list.Select(p => new PaymentDto(
            p.Id,
            p.BranchId,
            p.Branch?.Name,
            p.SaleId,
            p.PurchaseId,
            p.DebtRecordId,
            p.Type,
            p.Amount,
            p.PaymentMethod,
            p.TransactionReference,
            p.PaymentDateUtc,
            p.PayerOrPayee,
            p.Notes
        )).ToList();
    }

    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var payment = new Payment
        {
            CompanyId = companyId,
            BranchId = dto.BranchId,
            Type = dto.Type,
            Amount = Math.Max(0, dto.Amount),
            PaymentMethod = dto.PaymentMethod,
            TransactionReference = dto.TransactionReference ?? $"TRX-{DateTime.UtcNow:yyyyMMddHHmmss}",
            PaymentDateUtc = DateTime.UtcNow,
            PayerOrPayee = dto.PayerOrPayee?.Trim(),
            Notes = dto.Notes?.Trim()
        };

        _context.Payments.Add(payment);
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        string? bName = null;
        if (dto.BranchId.HasValue)
        {
            var b = await _context.Branches.FindAsync(new object[] { dto.BranchId.Value }, cancellationToken);
            bName = b?.Name;
        }

        return new PaymentDto(payment.Id, payment.BranchId, bName, null, null, null, payment.Type, payment.Amount, payment.PaymentMethod, payment.TransactionReference, payment.PaymentDateUtc, payment.PayerOrPayee, payment.Notes);
    }

    // --- EXPENSES ---
    public async Task<List<ExpenseDto>> GetExpensesAsync(Guid? branchId = null, ExpenseCategory? category = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var query = _context.Expenses
            .Where(e => e.CompanyId == companyId && !e.IsDeleted)
            .Include(e => e.Branch)
            .AsQueryable();

        if (branchId.HasValue) query = query.Where(e => e.BranchId == branchId.Value);
        if (category.HasValue) query = query.Where(e => e.Category == category.Value);
        if (from.HasValue) query = query.Where(e => e.ExpenseDateUtc >= from.Value);
        if (to.HasValue) query = query.Where(e => e.ExpenseDateUtc <= to.Value);

        var list = await query.OrderByDescending(e => e.ExpenseDateUtc).Take(100).ToListAsync(cancellationToken);

        return list.Select(e => new ExpenseDto(
            e.Id,
            e.BranchId,
            e.Branch?.Name,
            e.Category,
            e.Amount,
            e.ExpenseDateUtc,
            e.Payee,
            e.Description,
            e.PaymentMethod,
            e.IsRecurring,
            e.RecurringFrequency
        )).ToList();
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var expense = new Expense
        {
            CompanyId = companyId,
            BranchId = dto.BranchId,
            Category = dto.Category,
            Amount = Math.Max(0, dto.Amount),
            ExpenseDateUtc = dto.ExpenseDateUtc ?? DateTime.UtcNow,
            Payee = dto.Payee.Trim(),
            Description = dto.Description?.Trim(),
            PaymentMethod = dto.PaymentMethod,
            IsRecurring = dto.IsRecurring,
            RecurringFrequency = dto.RecurringFrequency
        };

        _context.Expenses.Add(expense);

        // Record Payment Outflow
        var payment = new Payment
        {
            CompanyId = companyId,
            BranchId = dto.BranchId,
            Type = PaymentType.OutflowExpense,
            Amount = expense.Amount,
            PaymentMethod = dto.PaymentMethod,
            TransactionReference = $"EXP-{DateTime.UtcNow:yyyyMMddHHmm}",
            PaymentDateUtc = expense.ExpenseDateUtc,
            PayerOrPayee = expense.Payee,
            Notes = $"Xarajat: {expense.Category} — {expense.Description}"
        };
        _context.Payments.Add(payment);

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        string? bName = null;
        if (dto.BranchId.HasValue)
        {
            var b = await _context.Branches.FindAsync(new object[] { dto.BranchId.Value }, cancellationToken);
            bName = b?.Name;
        }

        return new ExpenseDto(expense.Id, expense.BranchId, bName, expense.Category, expense.Amount, expense.ExpenseDateUtc, expense.Payee, expense.Description, expense.PaymentMethod, expense.IsRecurring, expense.RecurringFrequency);
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(Guid id, UpdateExpenseDto dto, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var exp = await _context.Expenses
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyId == companyId && !e.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Expense not found");

        exp.BranchId = dto.BranchId;
        exp.Category = dto.Category;
        exp.Amount = Math.Max(0, dto.Amount);
        exp.ExpenseDateUtc = dto.ExpenseDateUtc;
        exp.Payee = dto.Payee.Trim();
        exp.Description = dto.Description?.Trim();
        exp.PaymentMethod = dto.PaymentMethod;
        exp.IsRecurring = dto.IsRecurring;
        exp.RecurringFrequency = dto.RecurringFrequency;

        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new ExpenseDto(exp.Id, exp.BranchId, exp.Branch?.Name, exp.Category, exp.Amount, exp.ExpenseDateUtc, exp.Payee, exp.Description, exp.PaymentMethod, exp.IsRecurring, exp.RecurringFrequency);
    }

    public async Task<bool> DeleteExpenseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var exp = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.CompanyId == companyId && !e.IsDeleted, cancellationToken);
        if (exp == null) return false;

        exp.IsDeleted = true;
        await InvalidateTwinCacheAsync(companyId, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // --- FINANCIAL REPORTS ---
    public async Task<IncomeStatementDto> GetIncomeStatementAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var sales = await _context.Sales
            .Where(s => s.CompanyId == companyId && s.SaleDateUtc >= start && s.SaleDateUtc <= end && s.Status == SaleStatus.Completed && !s.IsDeleted)
            .ToListAsync(cancellationToken);

        var expenses = await _context.Expenses
            .Where(e => e.CompanyId == companyId && e.ExpenseDateUtc >= start && e.ExpenseDateUtc <= end && !e.IsDeleted)
            .ToListAsync(cancellationToken);

        var grossRev = sales.Sum(s => s.SubTotal);
        var discounts = sales.Sum(s => s.DiscountAmount);
        var netRev = sales.Sum(s => s.TotalAmount);
        var cogs = sales.Sum(s => s.TotalCostAmount);
        var grossProfit = netRev - cogs;
        var grossMarginPct = netRev > 0 ? (grossProfit / netRev) * 100m : 0m;

        var opexByCategory = expenses
            .GroupBy(e => e.Category.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));

        // Add employees payroll if not in expenses
        var employees = await _context.Employees.Where(e => e.CompanyId == companyId && e.IsActive && !e.IsDeleted).ToListAsync(cancellationToken);
        var payrollTotal = employees.Sum(e => e.MonthlySalary);
        if (!opexByCategory.ContainsKey(ExpenseCategory.Salaries.ToString()) && payrollTotal > 0)
        {
            opexByCategory[ExpenseCategory.Salaries.ToString()] = payrollTotal;
        }

        var totalOpex = opexByCategory.Values.Sum();
        var operatingIncome = grossProfit - totalOpex;
        var netIncome = operatingIncome;
        var netMarginPct = netRev > 0 ? (netIncome / netRev) * 100m : 0m;

        return new IncomeStatementDto(
            StartDateUtc: start,
            EndDateUtc: end,
            GrossRevenue: Math.Round(grossRev, 2),
            ReturnsAndDiscounts: Math.Round(discounts, 2),
            NetRevenue: Math.Round(netRev, 2),
            CostOfGoodsSold: Math.Round(cogs, 2),
            GrossProfit: Math.Round(grossProfit, 2),
            GrossMarginPercent: Math.Round(grossMarginPct, 2),
            TotalOpex: Math.Round(totalOpex, 2),
            OpexByCategory: opexByCategory,
            OperatingIncome: Math.Round(operatingIncome, 2),
            NetIncome: Math.Round(netIncome, 2),
            NetMarginPercent: Math.Round(netMarginPct, 2)
        );
    }

    public async Task<CashFlowEstimateDto> GetCashFlowEstimateAsync(CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        var payments = await _context.Payments
            .Where(p => p.CompanyId == companyId && p.PaymentDateUtc >= thirtyDaysAgo && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var salesInflows = payments.Where(p => p.Type == PaymentType.InflowSale).Sum(p => p.Amount);
        var debtInflows = payments.Where(p => p.Type == PaymentType.InflowDebtCollection).Sum(p => p.Amount);
        var totalInflows = salesInflows + debtInflows;

        var expenseOutflows = payments.Where(p => p.Type == PaymentType.OutflowExpense).Sum(p => p.Amount);
        var purchaseOutflows = payments.Where(p => p.Type == PaymentType.OutflowPurchase || p.Type == PaymentType.OutflowDebtPayment).Sum(p => p.Amount);
        var totalOutflows = expenseOutflows + purchaseOutflows;

        var netCashFlow = totalInflows - totalOutflows;
        var runway = totalOutflows > 0 && netCashFlow < 0 ? Math.Round((totalOutflows * 3) / Math.Abs(netCashFlow), 1) : 99m;

        return new CashFlowEstimateDto(
            TotalInflows: Math.Round(totalInflows, 2),
            TotalOutflows: Math.Round(totalOutflows, 2),
            NetCashFlow: Math.Round(netCashFlow, 2),
            OperatingInflows: Math.Round(salesInflows, 2),
            DebtCollections: Math.Round(debtInflows, 2),
            OperatingOutflows: Math.Round(expenseOutflows, 2),
            SupplierPayments: Math.Round(purchaseOutflows, 2),
            CashRunwayMonths: runway
        );
    }

    public async Task<StockValuationDto> GetStockValuationAsync(CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var items = await _context.InventoryItems
            .Where(i => i.CompanyId == companyId && !i.IsDeleted)
            .Include(i => i.Branch)
            .Include(i => i.Product)
            .ToListAsync(cancellationToken);

        var totalCost = items.Sum(i => i.QuantityOnHand * i.Product.CostPrice);
        var totalRetail = items.Sum(i => i.QuantityOnHand * i.Product.SellingPrice);
        var totalUnits = items.Sum(i => i.QuantityOnHand);
        var productsCount = await _context.Products.CountAsync(p => p.CompanyId == companyId && p.IsActive && !p.IsDeleted, cancellationToken);
        var lowStockCount = items.Count(i => i.QuantityOnHand <= i.ReorderPoint);

        var branchSummaries = items
            .GroupBy(i => new { i.BranchId, i.Branch.Name })
            .Select(g => new BranchStockSummaryDto(
                g.Key.BranchId,
                g.Key.Name,
                g.Sum(i => i.QuantityOnHand),
                Math.Round(g.Sum(i => i.QuantityOnHand * i.Product.CostPrice), 2)
            )).ToList();

        return new StockValuationDto(
            TotalInventoryCostValue: Math.Round(totalCost, 2),
            TotalInventoryRetailValue: Math.Round(totalRetail, 2),
            TotalUnitsInStock: Math.Round(totalUnits, 2),
            TotalActiveProducts: productsCount,
            LowStockProductCount: lowStockCount,
            BranchSummaries: branchSummaries
        );
    }

    // --- NOTIFICATIONS & AUDIT ---
    public async Task<List<NotificationDto>> GetNotificationsAsync(CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var list = await _context.Notifications
            .Where(n => n.CompanyId == companyId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(30)
            .ToListAsync(cancellationToken);

        return list.Select(n => new NotificationDto(n.Id, n.Type, n.Title, n.Message, n.LinkUrl, n.IsRead, n.CreatedAtUtc)).ToList();
    }

    public async Task MarkNotificationReadAsync(Guid notificationId, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.CompanyId == companyId, cancellationToken);
        if (notif != null)
        {
            notif.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<List<AuditLogDto>> GetAuditLogsAsync(int take = 50, CancellationToken cancellationToken = default)
    {
        var companyId = GetCompanyId();
        var list = await _context.AuditLogs
            .Where(a => a.CompanyId == companyId)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Take(take)
            .ToListAsync(cancellationToken);

        return list.Select(a => new AuditLogDto(a.Id, a.UserId, a.UserEmail, a.Action, a.EntityName, a.EntityId, a.OldValuesJson, a.NewValuesJson, a.IpAddress, a.CreatedAtUtc)).ToList();
    }
}
