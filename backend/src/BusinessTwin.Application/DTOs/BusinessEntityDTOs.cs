using BusinessTwin.Domain.Enums;

namespace BusinessTwin.Application.DTOs;

// Generic Paged Result
public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);

// Branches
public record BranchDto(
    Guid Id,
    string Name,
    string Code,
    string? Address,
    string? Phone,
    string? ManagerName,
    bool IsMainBranch,
    decimal MonthlyRent,
    bool IsActive,
    int EmployeeCount,
    decimal TotalSales
);

public record CreateBranchDto(
    string Name,
    string Code,
    string? Address,
    string? Phone,
    string? ManagerName,
    bool IsMainBranch,
    decimal MonthlyRent
);

public record UpdateBranchDto(
    string Name,
    string Code,
    string? Address,
    string? Phone,
    string? ManagerName,
    bool IsMainBranch,
    decimal MonthlyRent,
    bool IsActive
);

// Employees
public record EmployeeDto(
    Guid Id,
    Guid? BranchId,
    string? BranchName,
    string FirstName,
    string LastName,
    string FullName,
    string Position,
    string Department,
    string? Phone,
    string? Email,
    decimal MonthlySalary,
    DateTime HireDateUtc,
    bool IsActive,
    decimal TotalSalesGenerated = 0m
);

public record CreateEmployeeDto(
    Guid? BranchId,
    string FirstName,
    string LastName,
    string Position,
    string Department,
    string? Phone,
    string? Email,
    decimal MonthlySalary,
    DateTime? HireDateUtc
);

public record UpdateEmployeeDto(
    Guid? BranchId,
    string FirstName,
    string LastName,
    string Position,
    string Department,
    string? Phone,
    string? Email,
    decimal MonthlySalary,
    bool IsActive
);

// Customers
public record CustomerDto(
    Guid Id,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? TaxNumber,
    CustomerSegment Segment,
    decimal TotalSpent,
    int TotalOrders,
    decimal OutstandingDebt,
    decimal AverageOrderValue,
    DateTime? FirstPurchaseAtUtc,
    DateTime? LastPurchaseAtUtc
);

public record CreateCustomerDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? TaxNumber,
    CustomerSegment Segment = CustomerSegment.New
);

public record UpdateCustomerDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? TaxNumber,
    CustomerSegment Segment,
    bool IsActive
);

// Suppliers
public record SupplierDto(
    Guid Id,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? TaxNumber,
    string Category,
    decimal TotalPurchases,
    decimal OutstandingDebt,
    bool IsActive,
    int TotalOrders = 0
);

public record CreateSupplierDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? TaxNumber,
    string Category = "Elektronika"
);

public record UpdateSupplierDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? TaxNumber,
    string Category,
    bool IsActive
);

// Products
public record ProductDto(
    Guid Id,
    string Name,
    string? Sku,
    string? Barcode,
    string Category,
    string Unit,
    decimal CostPrice,
    decimal SellingPrice,
    decimal GrossMarginAmount,
    decimal GrossMarginPercent,
    decimal MinStockThreshold,
    decimal CurrentStock,
    string? Description,
    bool IsActive
);

public record CreateProductDto(
    string Name,
    string? Sku,
    string? Barcode,
    string Category,
    string Unit,
    decimal CostPrice,
    decimal SellingPrice,
    decimal MinStockThreshold,
    string? Description
);

public record UpdateProductDto(
    string Name,
    string? Sku,
    string? Barcode,
    string Category,
    string Unit,
    decimal CostPrice,
    decimal SellingPrice,
    decimal MinStockThreshold,
    string? Description,
    bool IsActive
);

// Inventory & Stock Movements
public record InventoryItemDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    string? ProductSku,
    string Category,
    decimal UnitCost,
    decimal UnitPrice,
    decimal QuantityOnHand,
    decimal ReservedQuantity,
    decimal AvailableQuantity,
    decimal TotalValuation,
    decimal ReorderPoint,
    bool IsLowStock,
    DateTime? LastRestockedAtUtc
);

public record UpdateInventoryStockDto(
    Guid BranchId,
    Guid ProductId,
    decimal QuantityChange, // positive for stock in, negative for adjustment/reduction
    string? Reason,
    StockMovementType Type = StockMovementType.Adjustment
);

public record StockMovementDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    string? ProductSku,
    StockMovementType Type,
    decimal Quantity,
    decimal PreviousQuantity,
    decimal NewQuantity,
    string? ReferenceNumber,
    string? Reason,
    DateTime MovementDateUtc
);

// Sales
public record SaleItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? Sku,
    decimal Quantity,
    decimal UnitPrice,
    decimal CostPrice,
    decimal TotalPrice,
    decimal GrossMargin
);

public record SaleDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    Guid? CustomerId,
    string? CustomerName,
    Guid? EmployeeId,
    string? EmployeeName,
    string SaleNumber,
    DateTime SaleDateUtc,
    decimal SubTotal,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    decimal TotalCostAmount,
    decimal NetProfitAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    SaleChannel Channel,
    SaleStatus Status,
    string PaymentMethod,
    string? Notes,
    List<SaleItemDto> Items
);

public record CreateSaleItemDto(
    Guid ProductId,
    decimal Quantity,
    decimal UnitPrice
);

public record CreateSaleDto(
    Guid BranchId,
    Guid? CustomerId,
    Guid? EmployeeId,
    SaleChannel Channel,
    string PaymentMethod,
    decimal DiscountAmount,
    decimal PaidAmount, // if PaidAmount < TotalAmount, records Debt / Nasiya
    DateTime? SaleDateUtc,
    DateTime? DebtDueDateUtc,
    string? Notes,
    List<CreateSaleItemDto> Items
);

// Purchases
public record PurchaseItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? Sku,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalPrice
);

public record PurchaseDto(
    Guid Id,
    Guid SupplierId,
    string SupplierName,
    Guid BranchId,
    string BranchName,
    string PurchaseNumber,
    DateTime PurchaseDateUtc,
    decimal SubTotal,
    decimal TaxAmount,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal OutstandingAmount,
    PurchaseStatus Status,
    string PaymentMethod,
    string? Notes,
    List<PurchaseItemDto> Items
);

public record CreatePurchaseItemDto(
    Guid ProductId,
    decimal Quantity,
    decimal UnitCost
);

public record CreatePurchaseDto(
    Guid SupplierId,
    Guid BranchId,
    string PaymentMethod,
    decimal PaidAmount, // if PaidAmount < TotalAmount, records Supplier Debt
    DateTime? PurchaseDateUtc,
    DateTime? DebtDueDateUtc,
    string? Notes,
    List<CreatePurchaseItemDto> Items
);

// Debts (Nasiya & Majburiyatlar)
public record DebtRecordDto(
    Guid Id,
    DebtType Type,
    Guid? CustomerId,
    string? CustomerName,
    Guid? SupplierId,
    string? SupplierName,
    Guid? SaleId,
    Guid? PurchaseId,
    string Title,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    DateTime? DueDateUtc,
    DebtStatus Status,
    string? Notes,
    DateTime CreatedAtUtc
);

public record CreateDebtRecordDto(
    DebtType Type,
    Guid? CustomerId,
    Guid? SupplierId,
    string Title,
    decimal TotalAmount,
    DateTime? DueDateUtc,
    string? Notes
);

public record PayDebtDto(
    Guid DebtRecordId,
    decimal PaymentAmount,
    string PaymentMethod,
    string? TransactionReference,
    string? Notes
);

// Payments Ledger
public record PaymentDto(
    Guid Id,
    Guid? BranchId,
    string? BranchName,
    Guid? SaleId,
    Guid? PurchaseId,
    Guid? DebtRecordId,
    PaymentType Type,
    decimal Amount,
    string PaymentMethod,
    string? TransactionReference,
    DateTime PaymentDateUtc,
    string? PayerOrPayee,
    string? Notes
);

public record CreatePaymentDto(
    Guid? BranchId,
    PaymentType Type,
    decimal Amount,
    string PaymentMethod,
    string? TransactionReference,
    string? PayerOrPayee,
    string? Notes
);

// Expenses
public record ExpenseDto(
    Guid Id,
    Guid? BranchId,
    string? BranchName,
    ExpenseCategory Category,
    decimal Amount,
    DateTime ExpenseDateUtc,
    string Payee,
    string? Description,
    string PaymentMethod,
    bool IsRecurring,
    string? RecurringFrequency
);

public record CreateExpenseDto(
    Guid? BranchId,
    ExpenseCategory Category,
    decimal Amount,
    DateTime? ExpenseDateUtc,
    string Payee,
    string? Description,
    string PaymentMethod = "BankTransfer",
    bool IsRecurring = false,
    string? RecurringFrequency = null
);

public record UpdateExpenseDto(
    Guid? BranchId,
    ExpenseCategory Category,
    decimal Amount,
    DateTime ExpenseDateUtc,
    string Payee,
    string? Description,
    string PaymentMethod,
    bool IsRecurring,
    string? RecurringFrequency
);

// Financial Reports & Analytics DTOs
public record IncomeStatementDto(
    DateTime StartDateUtc,
    DateTime EndDateUtc,
    decimal GrossRevenue,
    decimal ReturnsAndDiscounts,
    decimal NetRevenue,
    decimal CostOfGoodsSold,
    decimal GrossProfit,
    decimal GrossMarginPercent,
    decimal TotalOpex,
    Dictionary<string, decimal> OpexByCategory,
    decimal OperatingIncome,
    decimal NetIncome,
    decimal NetMarginPercent
);

public record CashFlowEstimateDto(
    decimal TotalInflows,
    decimal TotalOutflows,
    decimal NetCashFlow,
    decimal OperatingInflows,
    decimal DebtCollections,
    decimal OperatingOutflows,
    decimal SupplierPayments,
    decimal CashRunwayMonths
);

public record StockValuationDto(
    decimal TotalInventoryCostValue,
    decimal TotalInventoryRetailValue,
    decimal TotalUnitsInStock,
    int TotalActiveProducts,
    int LowStockProductCount,
    List<BranchStockSummaryDto> BranchSummaries
);

public record BranchStockSummaryDto(
    Guid BranchId,
    string BranchName,
    decimal TotalUnits,
    decimal TotalCostValue
);

public record DebtSummaryDto(
    decimal TotalCustomerDebt, // Receivables (Kutilayotgan nasiya)
    decimal TotalSupplierDebt, // Payables (Bizning qarzimiz)
    int ActiveCustomerDebtsCount,
    int OverdueCustomerDebtsCount,
    int ActiveSupplierDebtsCount
);
