namespace BusinessTwin.Domain.Enums;

public enum UserRole
{
    Owner = 1,
    Admin = 2,
    Manager = 3,
    Analyst = 4,
    Viewer = 5
}

public enum ExpenseCategory
{
    Rent = 1,
    Salaries = 2,
    Marketing = 3,
    Utilities = 4,
    SoftwareAndSaaS = 5,
    InventorySupplies = 6,
    LogisticsAndDelivery = 7,
    LegalAndTax = 8,
    MaintenanceAndEquipment = 9,
    Other = 10
}

public enum SaleChannel
{
    DirectRetail = 1,
    Wholesale = 2,
    OnlineECommerce = 3,
    B2BContract = 4
}

public enum SaleStatus
{
    Completed = 1,
    Pending = 2,
    Cancelled = 3,
    Refunded = 4,
    OnCredit = 5
}

public enum CustomerSegment
{
    New = 1,
    Regular = 2,
    VIP = 3,
    AtRisk = 4,
    Inactive = 5
}

public enum NotificationType
{
    System = 1,
    ScenarioAlert = 2,
    InventoryLow = 3,
    ExpenseAnomaly = 4,
    ChurnWarning = 5,
    DebtDueAlert = 6
}

public enum StockMovementType
{
    StockInPurchase = 1,
    StockOutSale = 2,
    Adjustment = 3,
    TransferIn = 4,
    TransferOut = 5,
    Return = 6,
    InitialStock = 7
}

public enum DebtType
{
    CustomerDebt = 1, // Receivables (Nasiya berilgan)
    SupplierDebt = 2  // Payables (Yetkazib beruvchidan qarzimiz)
}

public enum DebtStatus
{
    Active = 1,
    Paid = 2,
    Overdue = 3,
    Cancelled = 4
}

public enum PaymentType
{
    InflowSale = 1,
    InflowDebtCollection = 2,
    OutflowExpense = 3,
    OutflowPurchase = 4,
    OutflowDebtPayment = 5
}

public enum PurchaseStatus
{
    Received = 1,
    Pending = 2,
    Cancelled = 3
}
