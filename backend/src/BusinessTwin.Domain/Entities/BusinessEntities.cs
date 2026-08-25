using BusinessTwin.Domain.Common;
using BusinessTwin.Domain.Enums;

namespace BusinessTwin.Domain.Entities;

public class Branch : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? ManagerName { get; set; }
    public bool IsMainBranch { get; set; } = false;
    public decimal MonthlyRent { get; set; } = 0m;
    public bool IsActive { get; set; } = true;

    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}

public class Employee : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = "Savdo";
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal MonthlySalary { get; set; }
    public DateTime HireDateUtc { get; set; } = DateTime.UtcNow;
    public DateTime? TerminationDateUtc { get; set; }
    public bool IsActive { get; set; } = true;

    public string FullName => $"{FirstName} {LastName}".Trim();

    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}

public class Customer : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; } // STIR / INN
    public CustomerSegment Segment { get; set; } = CustomerSegment.New;
    public decimal TotalSpent { get; set; } = 0m;
    public int TotalOrders { get; set; } = 0;
    public decimal OutstandingDebt { get; set; } = 0m; // Nasiya qarzi
    public DateTime? FirstPurchaseAtUtc { get; set; }
    public DateTime? LastPurchaseAtUtc { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<DebtRecord> DebtRecords { get; set; } = new List<DebtRecord>();
}

public class Supplier : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string Category { get; set; } = "Elektronika";
    public decimal TotalPurchases { get; set; } = 0m;
    public decimal OutstandingDebt { get; set; } = 0m; // Yetkazib beruvchiga qarzimiz
    public bool IsActive { get; set; } = true;

    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
    public ICollection<DebtRecord> DebtRecords { get; set; } = new List<DebtRecord>();
}

public class Product : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public string Category { get; set; } = "General";
    public string Unit { get; set; } = "dona"; // dona, kg, metr, quti
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal MinStockThreshold { get; set; } = 5m;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public decimal GrossMarginAmount => SellingPrice - CostPrice;
    public decimal GrossMarginPercent => SellingPrice > 0 ? ((SellingPrice - CostPrice) / SellingPrice) * 100 : 0;

    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}

public class InventoryItem : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal QuantityOnHand { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal ReorderPoint { get; set; } = 10m;
    public DateTime? LastRestockedAtUtc { get; set; }

    public decimal AvailableQuantity => Math.Max(0, QuantityOnHand - ReservedQuantity);
    public bool IsLowStock => QuantityOnHand <= ReorderPoint;
}

public class StockMovement : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public StockMovementType Type { get; set; } = StockMovementType.Adjustment;
    public decimal Quantity { get; set; } // O'zgarish miqdori (+ yoki -)
    public decimal PreviousQuantity { get; set; }
    public decimal NewQuantity { get; set; }
    public string? ReferenceNumber { get; set; } // Sotuv yoki Xarid raqami
    public string? Reason { get; set; }
    public Guid? PerformedByUserId { get; set; }
    public DateTime MovementDateUtc { get; set; } = DateTime.UtcNow;
}

public class Sale : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public string SaleNumber { get; set; } = string.Empty;
    public DateTime SaleDateUtc { get; set; } = DateTime.UtcNow;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalCostAmount { get; set; } // Total COGS
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount => Math.Max(0, TotalAmount - PaidAmount);

    public SaleChannel Channel { get; set; } = SaleChannel.DirectRetail;
    public SaleStatus Status { get; set; } = SaleStatus.Completed;
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, BankTransfer, Payme, Click, Nasiya
    public string? Notes { get; set; }

    public decimal NetProfitAmount => TotalAmount - TotalCostAmount;

    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<DebtRecord> DebtRecords { get; set; } = new List<DebtRecord>();
}

public class SaleItem : BaseEntity
{
    public Guid SaleId { get; set; }
    public Sale Sale { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal CostPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
    public decimal TotalCost => Quantity * CostPrice;
}

public class Purchase : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public string PurchaseNumber { get; set; } = string.Empty;
    public DateTime PurchaseDateUtc { get; set; } = DateTime.UtcNow;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal OutstandingAmount => Math.Max(0, TotalAmount - PaidAmount);

    public PurchaseStatus Status { get; set; } = PurchaseStatus.Received;
    public string PaymentMethod { get; set; } = "BankTransfer";
    public string? Notes { get; set; }

    public ICollection<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<DebtRecord> DebtRecords { get; set; } = new List<DebtRecord>();
}

public class PurchaseItem : BaseEntity
{
    public Guid PurchaseId { get; set; }
    public Purchase Purchase { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalPrice => Quantity * UnitCost;
}

public class DebtRecord : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public DebtType Type { get; set; } = DebtType.CustomerDebt; // CustomerDebt (Receivable) or SupplierDebt (Payable)

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public Guid? SaleId { get; set; }
    public Sale? Sale { get; set; }

    public Guid? PurchaseId { get; set; }
    public Purchase? Purchase { get; set; }

    public string Title { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount => Math.Max(0, TotalAmount - PaidAmount);
    public DateTime? DueDateUtc { get; set; }
    public DebtStatus Status { get; set; } = DebtStatus.Active;
    public string? Notes { get; set; }

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class Payment : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public Guid? SaleId { get; set; }
    public Sale? Sale { get; set; }

    public Guid? PurchaseId { get; set; }
    public Purchase? Purchase { get; set; }

    public Guid? DebtRecordId { get; set; }
    public DebtRecord? DebtRecord { get; set; }

    public PaymentType Type { get; set; } = PaymentType.InflowSale;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, BankTransfer, Payme, Click, Uzum
    public string? TransactionReference { get; set; }
    public DateTime PaymentDateUtc { get; set; } = DateTime.UtcNow;
    public string? PayerOrPayee { get; set; }
    public string? Notes { get; set; }
}

public class Expense : BaseEntity, IHasCompany
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;
    public decimal Amount { get; set; }
    public DateTime ExpenseDateUtc { get; set; } = DateTime.UtcNow;
    public string Payee { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string PaymentMethod { get; set; } = "BankTransfer";
    public bool IsRecurring { get; set; } = false;
    public string? RecurringFrequency { get; set; } // Monthly, Quarterly, Annual
}
