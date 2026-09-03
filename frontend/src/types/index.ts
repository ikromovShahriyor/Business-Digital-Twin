export type UserRole = "Owner" | "Admin" | "Manager" | "Analyst" | "Viewer";

export type Language = "en" | "uz" | "ru";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredLanguage: string;
  role: UserRole;
}

export interface Company {
  id: string;
  name: string;
  taxNumber: string;
  industry: string;
  currency: string;
  defaultTaxRate: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface CompanySummary {
  id: string;
  name: string;
  role: UserRole;
  currency: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: User;
  currentCompany: Company;
  availableCompanies: CompanySummary[];
}

export interface BranchFinancialSummary {
  id: string;
  name: string;
  code: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  employeeCount: number;
  isMainBranch: boolean;
}

export interface ProductPerformance {
  id: string;
  name: string;
  sku?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  grossMarginPercent: number;
  monthlySalesUnits: number;
  monthlyRevenue: number;
  stockQuantity: number;
  isLowStock: boolean;
}

export interface MonthlyTrendPoint {
  monthLabel: string;
  revenue: number;
  expenses?: number;
  cogs?: number;
  opex?: number;
  netProfit: number;
  orderCount?: number;
}

export interface DigitalTwinSnapshot {
  companyId: string;
  companyName: string;
  currency: string;
  monthlyRevenue: number;
  monthlyCogs: number;
  monthlyGrossProfit: number;
  grossMarginPercent: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  netMarginPercent: number;
  cashRunwayMonths: number;
  breakevenMonthlyRevenue: number;
  breakEvenRevenue?: number;
  monthlyRent?: number;
  monthlyPayroll: number;
  totalEmployees: number;
  totalEmployeeCount?: number;
  revenuePerEmployee: number;
  totalBranches: number;
  totalBranchCount?: number;
  totalInventoryValue?: number;
  totalReceivables?: number;
  totalPayables?: number;
  activeCustomers: number;
  lowStockProductCount: number;
  branches: BranchFinancialSummary[];
  topProducts: ProductPerformance[];
  historicalTrends: MonthlyTrendPoint[];
  calculatedAtUtc?: string;
}

export interface TwinNode {
  id: string;
  type: string;
  label: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical" | "neutral";
}

export interface TwinEdge {
  source: string;
  target: string;
  label: string;
  flowValue: number;
}

export interface DigitalTwinNodeGraph {
  nodes: TwinNode[];
  edges: TwinEdge[];
}

export interface MetricDelta {
  metricName: string;
  baselineValue: number;
  simulatedValue: number;
  absoluteChange: number;
  percentageChange: number;
  unit: string;
}

export interface MonthlyProjection {
  monthIndex: number;
  monthLabel: string;
  baselineRevenue: number;
  baselineExpenses: number;
  baselineProfit: number;
  simulatedRevenue: number;
  simulatedExpenses: number;
  simulatedProfit: number;
  p10Profit: number;
  p50Profit: number;
  p90Profit: number;
}

export interface SimulationResult {
  scenarioId?: string;
  scenarioName: string;
  isSimulated: boolean;
  confidenceScore: number;
  confidenceRationale: string;
  assumptionsApplied: string[];
  riskFactors: string[];
  opportunities: string[];
  summaryMetrics: Record<string, MetricDelta>;
  monthlyProjections: MonthlyProjection[];
  breakevenMonths?: number;
  roiPercent?: number;
  calculatedAtUtc: string;
}

export interface SimulateScenarioParams {
  scenarioName: string;
  description?: string;
  priceChangePercent: number;
  priceElasticity?: number;
  expectedSalesVolumeChangePercent?: number;
  employeeHeadcountChange?: number;
  averageNewEmployeeSalary?: number;
  existingEmployeeSalaryChangePercent?: number;
  newBranchesCount?: number;
  capexPerNewBranch?: number;
  monthlyOpexPerNewBranch?: number;
  expectedMonthlyRevenuePerNewBranch?: number;
  marketingBudgetMonthly?: number;
  marketingCustomerAcquisitionCost?: number;
  marketingRevenuePerAcquiredCustomer?: number;
  inventoryBufferTargetPercent?: number;
  projectionMonths?: number;
  saveScenario?: boolean;
}

export interface ScenarioSummary {
  id: string;
  name: string;
  description?: string;
  confidenceScore: number;
  projectedMonthlyRevenue: number;
  projectedMonthlyProfit: number;
  monthlyProfitDelta: number;
  breakevenMonths?: number;
  roiPercent?: number;
  createdAtUtc: string;
  createdByUserName: string;
}

export interface AdvisorDiagnosticItem {
  category: string;
  severity: "INFO" | "WARNING" | "OPPORTUNITY" | "CRITICAL";
  title: string;
  finding: string;
  actionableRecommendation: string;
}

export interface AdvisorAnalysis {
  overallHealthScore: number;
  executiveSummary: string;
  diagnostics: AdvisorDiagnosticItem[];
  revenueDrivers: string[];
  costHotspots: string[];
  recommendedScenarios: string[];
  analyzedAtUtc: string;
}

export interface AdvisorChatResponse {
  reply: string;
  engine: string;
  groundedInRealData: boolean;
  repliedAtUtc: string;
}

export interface Branch {
  id: string;
  companyId?: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  managerName?: string;
  isMainBranch: boolean;
  monthlyRent: number;
  isActive: boolean;
  employeeCount?: number;
  totalSales?: number;
  createdAtUtc?: string;
}

export interface Employee {
  id: string;
  companyId?: string;
  branchId?: string;
  branchName?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  position: string;
  department: string;
  phone?: string;
  email?: string;
  monthlySalary: number;
  hireDateUtc: string;
  isActive: boolean;
  totalSalesGenerated?: number;
  createdAtUtc?: string;
}

export interface Customer {
  id: string;
  companyId?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  segment: "New" | "Regular" | "VIP" | "AtRisk" | "Inactive" | string;
  totalSpent?: number;
  totalOrders?: number;
  outstandingDebt?: number;
  averageOrderValue?: number;
  totalPurchasesAmount?: number;
  currentDebtAmount?: number;
  firstPurchaseAtUtc?: string;
  lastPurchaseAtUtc?: string;
  isActive?: boolean;
  createdAtUtc?: string;
}

export interface Supplier {
  id: string;
  companyId?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  category: string;
  totalPurchases?: number;
  outstandingDebt?: number;
  isActive: boolean;
  totalOrders?: number;
  totalPurchasesAmount?: number;
  currentDebtAmount?: number;
  createdAtUtc?: string;
}

export interface Product {
  id: string;
  companyId?: string;
  name: string;
  sku?: string;
  barcode?: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  grossMarginAmount?: number;
  grossMarginPercent: number;
  minStockThreshold: number;
  currentStock?: number;
  totalStockOnHand?: number;
  description?: string;
  isActive: boolean;
  createdAtUtc?: string;
}

export interface InventoryItem {
  id: string;
  companyId?: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  productSku?: string;
  productCategory?: string;
  category?: string;
  unit?: string;
  unitCost?: number;
  costPrice?: number;
  unitPrice?: number;
  sellingPrice?: number;
  quantityOnHand: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  totalValuation?: number;
  totalCostValue?: number;
  totalRetailValue?: number;
  reorderPoint: number;
  isLowStock: boolean;
  lastRestockedAtUtc?: string;
}

export interface StockMovement {
  id: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  productSku?: string;
  type: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceNumber?: string;
  reason?: string;
  movementDateUtc: string;
}

export interface SaleItem {
  id: string;
  saleId?: string;
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  totalPrice?: number;
  totalAmount?: number;
  grossMargin?: number;
}

export interface Sale {
  id: string;
  companyId?: string;
  branchId?: string;
  branchName?: string;
  branchCode?: string;
  customerId?: string;
  customerName?: string;
  employeeId?: string;
  employeeName?: string;
  saleNumber: string;
  saleDateUtc: string;
  subTotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  totalCostAmount?: number;
  netProfitAmount?: number;
  paidAmount: number;
  remainingAmount?: number;
  debtRemainingAmount?: number;
  channel: string | number;
  status: string | number;
  paymentMethod: string;
  notes?: string;
  items: SaleItem[];
  createdAtUtc?: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId?: string;
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  totalPrice?: number;
  totalAmount?: number;
}

export interface Purchase {
  id: string;
  companyId?: string;
  supplierId: string;
  supplierName?: string;
  branchId: string;
  branchName?: string;
  branchCode?: string;
  purchaseNumber: string;
  purchaseDateUtc: string;
  subTotal?: number;
  taxAmount?: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount?: number;
  debtRemainingAmount?: number;
  status: string | number;
  paymentMethod: string;
  notes?: string;
  items: PurchaseItem[];
  createdAtUtc?: string;
}

export interface DebtRecord {
  id: string;
  companyId?: string;
  type: "CustomerDebt" | "SupplierDebt" | number;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  saleId?: string;
  purchaseId?: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDateUtc?: string;
  status?: string | number;
  isOverdue?: boolean;
  daysUntilDue?: number;
  notes?: string;
  createdAtUtc?: string;
}

export interface DebtSummary {
  totalCustomerDebt: number;
  totalSupplierDebt: number;
  activeCustomerDebtsCount: number;
  overdueCustomerDebtsCount: number;
  activeSupplierDebtsCount: number;
}

export interface Payment {
  id: string;
  companyId?: string;
  branchId?: string;
  branchName?: string;
  branchCode?: string;
  saleId?: string;
  purchaseId?: string;
  debtRecordId?: string;
  type: string | number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  paymentDateUtc: string;
  payerOrPayee?: string;
  notes?: string;
  createdAtUtc?: string;
}

export interface Expense {
  id: string;
  companyId?: string;
  branchId?: string;
  branchName?: string;
  branchCode?: string;
  category: string | number;
  amount: number;
  expenseDateUtc: string;
  payee: string;
  description?: string;
  paymentMethod: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  createdAtUtc?: string;
}

export interface StockValuation {
  totalInventoryCostValue: number;
  totalInventoryRetailValue: number;
  totalUnitsInStock: number;
  totalActiveProducts: number;
  lowStockProductCount: number;
  branchSummaries: Array<{
    branchId: string;
    branchName: string;
    totalUnits: number;
    totalCostValue: number;
  }>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  entityName: string;
  entityId?: string;
  oldValuesJson?: string;
  newValuesJson?: string;
  ipAddress?: string;
  createdAtUtc: string;
}

export interface IncomeStatement {
  startDateUtc: string;
  endDateUtc: string;
  grossRevenue: number;
  returnsAndDiscounts: number;
  netRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalOpex: number;
  opexByCategory: Record<string, number>;
  operatingIncome: number;
  netIncome: number;
  netMarginPercent: number;
}

export interface CashFlowEstimate {
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  operatingInflows: number;
  debtCollections: number;
  operatingOutflows: number;
  supplierPayments: number;
  cashRunwayMonths: number;
}
