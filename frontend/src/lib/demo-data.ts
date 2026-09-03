import {
  DigitalTwinSnapshot,
  DigitalTwinNodeGraph,
  Branch,
  Employee,
  Customer,
  Supplier,
  Product,
  InventoryItem,
  Sale,
  Purchase,
  DebtRecord,
  DebtSummary,
  Payment,
  Expense,
  SimulationResult,
  SimulateScenarioParams,
  ScenarioSummary,
  MonthlyProjection,
  IncomeStatement,
  CashFlowEstimate,
  StockValuation,
  Notification,
  AuditLog,
  AdvisorAnalysis
} from "@/types";

export const DEMO_BRANCHES: Branch[] = [
  {
    id: "33333333-3333-3333-3333-333333333331",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Markaziy Bosh Do'kon (Amir Temur)",
    code: "HQ-01",
    address: "Amir Temur shoh ko'chasi 45, Yunusobod, Toshkent",
    phone: "+998 71 201 1111",
    managerName: "Rustam Karimov",
    isMainBranch: true,
    monthlyRent: 3500,
    isActive: true,
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Chilonzor Savdo Filiali",
    code: "BR-02",
    address: "Bunyodkor shoh ko'chasi 12, Chilonzor, Toshkent",
    phone: "+998 71 202 2222",
    managerName: "Nodira Umarova",
    isMainBranch: false,
    monthlyRent: 2200,
    isActive: true,
    createdAtUtc: new Date().toISOString()
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Ultrabook Pro 15 (Core i7 / 16GB / 512GB)",
    sku: "LAP-PRO15",
    barcode: "478001234001",
    category: "Kompyuterlar & Noutbuklar",
    unit: "dona",
    costPrice: 450,
    sellingPrice: 1150,
    grossMarginPercent: 60.9,
    minStockThreshold: 10,
    isActive: true,
    totalStockOnHand: 48,
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Smartfon Flagship X (256GB, 5G)",
    sku: "PHN-FLG-X",
    barcode: "478001234002",
    category: "Smartfonlar & Gadjetlar",
    unit: "dona",
    costPrice: 280,
    sellingPrice: 780,
    grossMarginPercent: 64.1,
    minStockThreshold: 15,
    isActive: true,
    totalStockOnHand: 93,
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Wireless ANC Quloqchinlar Studio",
    sku: "AUD-ANC-900",
    barcode: "478001234003",
    category: "Audio & Aksessuarlar",
    unit: "dona",
    costPrice: 40,
    sellingPrice: 120,
    grossMarginPercent: 66.7,
    minStockThreshold: 20,
    isActive: true,
    totalStockOnHand: 135,
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "4K Smart Monitor 27-dyuym IPS",
    sku: "MON-4K-27",
    barcode: "478001234004",
    category: "Monitorlar & Ekranlar",
    unit: "dona",
    costPrice: 150,
    sellingPrice: 425,
    grossMarginPercent: 64.7,
    minStockThreshold: 8,
    isActive: true,
    totalStockOnHand: 46,
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444445",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Smart Watch Active Series 8",
    sku: "WCH-ACT-8",
    barcode: "478001234005",
    category: "Smartfonlar & Gadjetlar",
    unit: "dona",
    costPrice: 78,
    sellingPrice: 220,
    grossMarginPercent: 64.5,
    minStockThreshold: 15,
    isActive: true,
    totalStockOnHand: 105,
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444446",
    companyId: "11111111-1111-1111-1111-111111111111",
    name: "Ergonomik Mexanik Klaviatura RGB",
    sku: "ACC-MKB-PRO",
    barcode: "478001234006",
    category: "Audio & Aksessuarlar",
    unit: "dona",
    costPrice: 45,
    sellingPrice: 135,
    grossMarginPercent: 66.7,
    minStockThreshold: 12,
    isActive: true,
    totalStockOnHand: 85,
    createdAtUtc: new Date().toISOString()
  }
];

export const DEMO_SALES: Sale[] = [
  {
    id: "55555555-5555-5555-5555-555555555501",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333331",
    customerId: "66666666-6666-6666-6666-666666666601",
    customerName: "Alpha Tech Solutions MCHJ",
    branchCode: "HQ-01",
    saleNumber: "INV-2026-00201",
    saleDateUtc: new Date(Date.now() - 2 * 86400000).toISOString(),
    subTotal: 13800,
    discountAmount: 300,
    totalAmount: 13500,
    totalCostAmount: 5250,
    paidAmount: 11000,
    debtRemainingAmount: 2500,
    channel: 2,
    status: 2,
    paymentMethod: "BankTransfer",
    items: [
      { id: "1", saleId: "55555555-5555-5555-5555-555555555501", productId: DEMO_PRODUCTS[0].id, productName: DEMO_PRODUCTS[0].name, quantity: 10, unitPrice: 1150, costPrice: 450, totalAmount: 11500 },
      { id: "2", saleId: "55555555-5555-5555-5555-555555555501", productId: DEMO_PRODUCTS[3].id, productName: DEMO_PRODUCTS[3].name, quantity: 5, unitPrice: 460, costPrice: 150, totalAmount: 2300 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555502",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333331",
    customerId: "66666666-6666-6666-6666-666666666602",
    customerName: "Orient Logistics & Trade",
    branchCode: "HQ-01",
    saleNumber: "INV-2026-00202",
    saleDateUtc: new Date(Date.now() - 4 * 86400000).toISOString(),
    subTotal: 11200,
    discountAmount: 200,
    totalAmount: 11000,
    totalCostAmount: 3900,
    paidAmount: 9200,
    debtRemainingAmount: 1800,
    channel: 2,
    status: 2,
    paymentMethod: "BankTransfer",
    items: [
      { id: "3", saleId: "55555555-5555-5555-5555-555555555502", productId: DEMO_PRODUCTS[1].id, productName: DEMO_PRODUCTS[1].name, quantity: 14, unitPrice: 800, costPrice: 280, totalAmount: 11200 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555503",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333331",
    customerId: "66666666-6666-6666-6666-666666666603",
    customerName: "Silk Road Finance Group",
    branchCode: "HQ-01",
    saleNumber: "INV-2026-00203",
    saleDateUtc: new Date(Date.now() - 6 * 86400000).toISOString(),
    subTotal: 9800,
    discountAmount: 0,
    totalAmount: 9800,
    totalCostAmount: 3400,
    paidAmount: 9800,
    debtRemainingAmount: 0,
    channel: 2,
    status: 1,
    paymentMethod: "BankTransfer",
    items: [
      { id: "4", saleId: "55555555-5555-5555-5555-555555555503", productId: DEMO_PRODUCTS[0].id, productName: DEMO_PRODUCTS[0].name, quantity: 8, unitPrice: 1225, costPrice: 425, totalAmount: 9800 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555504",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333332",
    customerId: "66666666-6666-6666-6666-666666666604",
    customerName: "Tashkent City Smart Plaza",
    branchCode: "BR-02",
    saleNumber: "INV-2026-00204",
    saleDateUtc: new Date(Date.now() - 3 * 86400000).toISOString(),
    subTotal: 9400,
    discountAmount: 200,
    totalAmount: 9200,
    totalCostAmount: 3300,
    paidAmount: 8000,
    debtRemainingAmount: 1200,
    channel: 2,
    status: 2,
    paymentMethod: "BankTransfer",
    items: [
      { id: "5", saleId: "55555555-5555-5555-5555-555555555504", productId: DEMO_PRODUCTS[1].id, productName: DEMO_PRODUCTS[1].name, quantity: 12, unitPrice: 780, costPrice: 275, totalAmount: 9360 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555505",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333332",
    customerName: "Chakana Xaridorlar (Kassa)",
    branchCode: "BR-02",
    saleNumber: "INV-2026-00205",
    saleDateUtc: new Date(Date.now() - 5 * 86400000).toISOString(),
    subTotal: 8500,
    discountAmount: 0,
    totalAmount: 8500,
    totalCostAmount: 3100,
    paidAmount: 8500,
    debtRemainingAmount: 0,
    channel: 1,
    status: 1,
    paymentMethod: "Card",
    items: [
      { id: "6", saleId: "55555555-5555-5555-5555-555555555505", productId: DEMO_PRODUCTS[3].id, productName: DEMO_PRODUCTS[3].name, quantity: 20, unitPrice: 425, costPrice: 155, totalAmount: 8500 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555506",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333331",
    customerName: "EduSmart IT Akademiya",
    branchCode: "HQ-01",
    saleNumber: "INV-2026-00206",
    saleDateUtc: new Date(Date.now() - 7 * 86400000).toISOString(),
    subTotal: 9500,
    discountAmount: 300,
    totalAmount: 9200,
    totalCostAmount: 3200,
    paidAmount: 9200,
    debtRemainingAmount: 0,
    channel: 2,
    status: 1,
    paymentMethod: "BankTransfer",
    items: [
      { id: "7", saleId: "55555555-5555-5555-5555-555555555506", productId: DEMO_PRODUCTS[2].id, productName: DEMO_PRODUCTS[2].name, quantity: 75, unitPrice: 120, costPrice: 40, totalAmount: 9000 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555507",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333332",
    customerName: "Online Do'kon Xaridorlari",
    branchCode: "BR-02",
    saleNumber: "INV-2026-00207",
    saleDateUtc: new Date(Date.now() - 8 * 86400000).toISOString(),
    subTotal: 8900,
    discountAmount: 100,
    totalAmount: 8800,
    totalCostAmount: 3150,
    paidAmount: 8800,
    debtRemainingAmount: 0,
    channel: 3,
    status: 1,
    paymentMethod: "Card",
    items: [
      { id: "8", saleId: "55555555-5555-5555-5555-555555555507", productId: DEMO_PRODUCTS[4].id, productName: DEMO_PRODUCTS[4].name, quantity: 40, unitPrice: 220, costPrice: 78, totalAmount: 8800 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555508",
    companyId: "11111111-1111-1111-1111-111111111111",
    branchId: "33333333-3333-3333-3333-333333333331",
    customerName: "Chakana Xaridorlar (Kassa)",
    branchCode: "HQ-01",
    saleNumber: "INV-2026-00208",
    saleDateUtc: new Date(Date.now() - 1 * 86400000).toISOString(),
    subTotal: 8500,
    discountAmount: 0,
    totalAmount: 8500,
    totalCostAmount: 3100,
    paidAmount: 8500,
    debtRemainingAmount: 0,
    channel: 1,
    status: 1,
    paymentMethod: "Card",
    items: [
      { id: "9", saleId: "55555555-5555-5555-5555-555555555508", productId: DEMO_PRODUCTS[5].id, productName: DEMO_PRODUCTS[5].name, quantity: 25, unitPrice: 340, costPrice: 124, totalAmount: 8500 }
    ],
    createdAtUtc: new Date().toISOString()
  }
];

export const DEMO_CUSTOMERS: Customer[] = [
  { id: "66666666-6666-6666-6666-666666666601", companyId: "11111111-1111-1111-1111-111111111111", name: "Alpha Tech Solutions MCHJ", contactPerson: "Sardor Rahimov", email: "procurement@alphatech.uz", phone: "+998 90 111 2233", address: "Mustaqillik shoh ko'chasi 15, Toshkent", taxNumber: "302819401", segment: "B2B Enterprise", totalPurchasesAmount: 34500, currentDebtAmount: 2500, isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "66666666-6666-6666-6666-666666666602", companyId: "11111111-1111-1111-1111-111111111111", name: "Orient Logistics & Trade", contactPerson: "Jasur Qodirov", email: "info@orientlog.uz", phone: "+998 91 222 3344", address: "Qo'yliq sanoat hududi 4, Toshkent", taxNumber: "304910291", segment: "B2B Wholesale", totalPurchasesAmount: 28400, currentDebtAmount: 1800, isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "66666666-6666-6666-6666-666666666603", companyId: "11111111-1111-1111-1111-111111111111", name: "Silk Road Finance Group", contactPerson: "Alisher Vohidov", email: "admin@silkroadfin.uz", phone: "+998 93 333 4455", address: "Toshkent City Blok 3", taxNumber: "308192019", segment: "B2B Corporate", totalPurchasesAmount: 24200, currentDebtAmount: 0, isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "66666666-6666-6666-6666-666666666604", companyId: "11111111-1111-1111-1111-111111111111", name: "Tashkent City Smart Plaza", contactPerson: "Madina Karimova", email: "commercial@smartplaza.uz", phone: "+998 97 444 5566", address: "Navoiy ko'chasi 22, Toshkent", taxNumber: "309182736", segment: "B2B Commercial", totalPurchasesAmount: 19800, currentDebtAmount: 1200, isActive: true, createdAtUtc: new Date().toISOString() }
];

export const DEMO_SUPPLIERS: Supplier[] = [
  { id: "77777777-7777-7777-7777-777777777701", companyId: "11111111-1111-1111-1111-111111111111", name: "TechGlobal International Ltd (Shenzhen / Dubai)", contactPerson: "David Zhang", email: "sales@techglobal.hk", phone: "+86 755 8899 0011", address: "Hi-Tech Industrial Park, Nanshan, Shenzhen", taxNumber: "HK-9920184", category: "Noutbuklar & Kompyuterlar", totalPurchasesAmount: 65000, currentDebtAmount: 4500, isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "77777777-7777-7777-7777-777777777702", companyId: "11111111-1111-1111-1111-111111111111", name: "SmartAudio Components Co.", contactPerson: "Farrux Yusupov", email: "supply@smartaudio.uz", phone: "+998 71 200 4455", address: "Sergeli Sanoat Zonasi 18, Toshkent", taxNumber: "301829104", category: "Audio & Aksessuarlar", totalPurchasesAmount: 32000, currentDebtAmount: 2100, isActive: true, createdAtUtc: new Date().toISOString() }
];

export const DEMO_SNAPSHOT: DigitalTwinSnapshot = {
  companyId: "11111111-1111-1111-1111-111111111111",
  companyName: "Apex Texnologiya va Savdo MCHJ",
  currency: "USD",
  monthlyRevenue: 78500,
  monthlyGrossProfit: 50300,
  monthlyNetProfit: 24700,
  grossMarginPercent: 64.1,
  netMarginPercent: 31.5,
  monthlyCogs: 28200,
  monthlyOpex: 25600,
  monthlyRent: 5700,
  monthlyPayroll: 14500,
  cashRunwayMonths: 18.5,
  breakEvenRevenue: 39900,
  breakevenMonthlyRevenue: 39900,
  totalInventoryValue: 168400,
  totalBranchCount: 2,
  totalBranches: 2,
  totalEmployeeCount: 12,
  totalEmployees: 12,
  revenuePerEmployee: 6541,
  totalReceivables: 5500,
  totalPayables: 6600,
  activeCustomers: 4,
  lowStockProductCount: 0,
  branches: [],
  topProducts: [],
  historicalTrends: [
    { monthLabel: "Mart 2026", revenue: 58000, cogs: 20800, opex: 20500, netProfit: 16700 },
    { monthLabel: "Apr 2026", revenue: 62500, cogs: 22400, opex: 21400, netProfit: 18700 },
    { monthLabel: "May 2026", revenue: 66800, cogs: 23900, opex: 22600, netProfit: 20300 },
    { monthLabel: "Iyun 2026", revenue: 71200, cogs: 25500, opex: 23800, netProfit: 21900 },
    { monthLabel: "Iyul 2026", revenue: 74900, cogs: 26800, opex: 24700, netProfit: 23400 },
    { monthLabel: "Avg 2026", revenue: 78500, cogs: 28200, opex: 25600, netProfit: 24700 }
  ]
};

export const DEMO_DEBTS: DebtRecord[] = [
  { id: "1", companyId: "11111111-1111-1111-1111-111111111111", type: 1, customerId: DEMO_CUSTOMERS[0].id, customerName: DEMO_CUSTOMERS[0].name, title: "Alpha Tech Nasiya (INV-2026-00201)", totalAmount: 2500, paidAmount: 0, remainingAmount: 2500, dueDateUtc: new Date(Date.now() + 15 * 86400000).toISOString(), status: 1, isOverdue: false, daysUntilDue: 15, notes: "Shartnoma bo'yicha 15 kunlik muddat", createdAtUtc: new Date().toISOString() },
  { id: "2", companyId: "11111111-1111-1111-1111-111111111111", type: 1, customerId: DEMO_CUSTOMERS[1].id, customerName: DEMO_CUSTOMERS[1].name, title: "Orient Logistics Nasiya (INV-2026-00202)", totalAmount: 1800, paidAmount: 0, remainingAmount: 1800, dueDateUtc: new Date(Date.now() + 10 * 86400000).toISOString(), status: 1, isOverdue: false, daysUntilDue: 10, notes: "B2B buyurtmadan qolgan summa", createdAtUtc: new Date().toISOString() },
  { id: "3", companyId: "11111111-1111-1111-1111-111111111111", type: 1, customerId: DEMO_CUSTOMERS[3].id, customerName: DEMO_CUSTOMERS[3].name, title: "Tashkent City Smart (INV-2026-00204)", totalAmount: 1200, paidAmount: 0, remainingAmount: 1200, dueDateUtc: new Date(Date.now() + 20 * 86400000).toISOString(), status: 1, isOverdue: false, daysUntilDue: 20, notes: "Korporativ yetkazib berish", createdAtUtc: new Date().toISOString() },
  { id: "4", companyId: "11111111-1111-1111-1111-111111111111", type: 2, supplierId: DEMO_SUPPLIERS[0].id, supplierName: DEMO_SUPPLIERS[0].name, title: "TechGlobal Noutbuklar Xaridi Qarzimiz", totalAmount: 4500, paidAmount: 0, remainingAmount: 4500, dueDateUtc: new Date(Date.now() + 18 * 86400000).toISOString(), status: 1, isOverdue: false, daysUntilDue: 18, notes: "PO-2026-0001 bo'yicha qoldiq to'lov", createdAtUtc: new Date().toISOString() },
  { id: "5", companyId: "11111111-1111-1111-1111-111111111111", type: 2, supplierId: DEMO_SUPPLIERS[1].id, supplierName: DEMO_SUPPLIERS[1].name, title: "SmartAudio Quloqchinlar Qarzimiz", totalAmount: 2100, paidAmount: 0, remainingAmount: 2100, dueDateUtc: new Date(Date.now() + 14 * 86400000).toISOString(), status: 1, isOverdue: false, daysUntilDue: 14, notes: "PO-2026-0002 bo'yicha qoldiq to'lov", createdAtUtc: new Date().toISOString() }
];

export const DEMO_DEBT_SUMMARY: DebtSummary = {
  totalCustomerDebt: 5500,
  totalSupplierDebt: 6600,
  activeCustomerDebtsCount: 3,
  overdueCustomerDebtsCount: 0,
  activeSupplierDebtsCount: 2
};

export const DEMO_PAYMENTS: Payment[] = [
  { id: "1", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchCode: "HQ-01", type: 1, amount: 11000, paymentMethod: "BankTransfer", transactionReference: "PAY-2026-001", payerOrPayee: DEMO_CUSTOMERS[0].name, notes: "B2B Shartnoma to'lovi", paymentDateUtc: new Date(Date.now() - 2 * 86400000).toISOString(), createdAtUtc: new Date().toISOString() },
  { id: "2", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchCode: "HQ-01", type: 1, amount: 9200, paymentMethod: "BankTransfer", transactionReference: "PAY-2026-002", payerOrPayee: DEMO_CUSTOMERS[1].name, notes: "B2B Shartnoma to'lovi", paymentDateUtc: new Date(Date.now() - 4 * 86400000).toISOString(), createdAtUtc: new Date().toISOString() },
  { id: "3", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchCode: "HQ-01", type: 1, amount: 9800, paymentMethod: "BankTransfer", transactionReference: "PAY-2026-003", payerOrPayee: DEMO_CUSTOMERS[2].name, notes: "To'liq to'langan", paymentDateUtc: new Date(Date.now() - 6 * 86400000).toISOString(), createdAtUtc: new Date().toISOString() },
  { id: "4", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, branchCode: "BR-02", type: 1, amount: 8000, paymentMethod: "BankTransfer", transactionReference: "PAY-2026-004", payerOrPayee: DEMO_CUSTOMERS[3].name, notes: "B2B avans to'lovi", paymentDateUtc: new Date(Date.now() - 3 * 86400000).toISOString(), createdAtUtc: new Date().toISOString() },
  { id: "5", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, branchCode: "BR-02", type: 1, amount: 8500, paymentMethod: "Card", transactionReference: "PAY-2026-005", payerOrPayee: "Chakana Kassa", notes: "Karta orqali to'lov", paymentDateUtc: new Date(Date.now() - 5 * 86400000).toISOString(), createdAtUtc: new Date().toISOString() }
];

export const DEMO_EXPENSES: Expense[] = [
  { id: "1", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchCode: "HQ-01", category: 1, amount: 3500, expenseDateUtc: new Date(Date.now() - 25 * 86400000).toISOString(), payee: "City Plaza Ijarasi", description: "Bosh do'kon oylik ijara to'lovi", paymentMethod: "BankTransfer", isRecurring: true, recurringFrequency: "Monthly", createdAtUtc: new Date().toISOString() },
  { id: "2", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, branchCode: "BR-02", category: 1, amount: 2200, expenseDateUtc: new Date(Date.now() - 24 * 86400000).toISOString(), payee: "Bunyodkor Savdo Markazi", description: "Chilonzor filiali oylik ijara to'lovi", paymentMethod: "BankTransfer", isRecurring: true, recurringFrequency: "Monthly", createdAtUtc: new Date().toISOString() },
  { id: "3", companyId: "11111111-1111-1111-1111-111111111111", category: 3, amount: 2500, expenseDateUtc: new Date(Date.now() - 15 * 86400000).toISOString(), payee: "Meta & Google Ads", description: "Raqamli targeted marketing va reklama", paymentMethod: "Card", isRecurring: false, createdAtUtc: new Date().toISOString() },
  { id: "4", companyId: "11111111-1111-1111-1111-111111111111", category: 5, amount: 850, expenseDateUtc: new Date(Date.now() - 18 * 86400000).toISOString(), payee: "Cloud & ERP", description: "Server hosting, litsenziyalar va SaaS", paymentMethod: "Card", isRecurring: true, createdAtUtc: new Date().toISOString() },
  { id: "5", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, category: 4, amount: 650, expenseDateUtc: new Date(Date.now() - 20 * 86400000).toISOString(), payee: "Toshkent Elektr & Suv", description: "Bosh ofis kommunal to'lovlari", paymentMethod: "BankTransfer", isRecurring: true, createdAtUtc: new Date().toISOString() },
  { id: "6", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, category: 4, amount: 420, expenseDateUtc: new Date(Date.now() - 19 * 86400000).toISOString(), payee: "Chilonzor Kommunal", description: "Chilonzor filiali kommunal to'lovlari", paymentMethod: "BankTransfer", isRecurring: true, createdAtUtc: new Date().toISOString() },
  { id: "7", companyId: "11111111-1111-1111-1111-111111111111", category: 7, amount: 980, expenseDateUtc: new Date(Date.now() - 10 * 86400000).toISOString(), payee: "Express Kuryer & Transport", description: "Do'konlararo va mijozlarga yetkazib berish xizmati", paymentMethod: "BankTransfer", isRecurring: false, createdAtUtc: new Date().toISOString() }
];

export const DEMO_INVENTORY: InventoryItem[] = [
  { id: "1", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchName: DEMO_BRANCHES[0].name, productId: DEMO_PRODUCTS[0].id, productName: DEMO_PRODUCTS[0].name, productSku: DEMO_PRODUCTS[0].sku, productCategory: DEMO_PRODUCTS[0].category, unit: "dona", costPrice: DEMO_PRODUCTS[0].costPrice, sellingPrice: DEMO_PRODUCTS[0].sellingPrice, quantityOnHand: 32, reorderPoint: 10, isLowStock: false, totalCostValue: 14400, totalRetailValue: 36800, lastRestockedAtUtc: new Date().toISOString() },
  { id: "2", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, branchName: DEMO_BRANCHES[1].name, productId: DEMO_PRODUCTS[0].id, productName: DEMO_PRODUCTS[0].name, productSku: DEMO_PRODUCTS[0].sku, productCategory: DEMO_PRODUCTS[0].category, unit: "dona", costPrice: DEMO_PRODUCTS[0].costPrice, sellingPrice: DEMO_PRODUCTS[0].sellingPrice, quantityOnHand: 16, reorderPoint: 6, isLowStock: false, totalCostValue: 7200, totalRetailValue: 18400, lastRestockedAtUtc: new Date().toISOString() },
  { id: "3", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchName: DEMO_BRANCHES[0].name, productId: DEMO_PRODUCTS[1].id, productName: DEMO_PRODUCTS[1].name, productSku: DEMO_PRODUCTS[1].sku, productCategory: DEMO_PRODUCTS[1].category, unit: "dona", costPrice: DEMO_PRODUCTS[1].costPrice, sellingPrice: DEMO_PRODUCTS[1].sellingPrice, quantityOnHand: 55, reorderPoint: 15, isLowStock: false, totalCostValue: 15400, totalRetailValue: 42900, lastRestockedAtUtc: new Date().toISOString() },
  { id: "4", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, branchName: DEMO_BRANCHES[1].name, productId: DEMO_PRODUCTS[1].id, productName: DEMO_PRODUCTS[1].name, productSku: DEMO_PRODUCTS[1].sku, productCategory: DEMO_PRODUCTS[1].category, unit: "dona", costPrice: DEMO_PRODUCTS[1].costPrice, sellingPrice: DEMO_PRODUCTS[1].sellingPrice, quantityOnHand: 38, reorderPoint: 10, isLowStock: false, totalCostValue: 10640, totalRetailValue: 29640, lastRestockedAtUtc: new Date().toISOString() }
];

export const DEMO_EMPLOYEES: Employee[] = [
  { id: "1", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchName: DEMO_BRANCHES[0].name, firstName: "Rustam", lastName: "Karimov", email: "rustam@apex.uz", phone: "+998 90 201 1101", position: "Bosh Filial Boshqaruvchisi", department: "Rahbariyat", monthlySalary: 1800, hireDateUtc: new Date().toISOString(), isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "2", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchName: DEMO_BRANCHES[0].name, firstName: "Alisher", lastName: "Usmonov", email: "alisher@apex.uz", phone: "+998 90 201 1102", position: "Katta B2B Savdo Menejeri", department: "Savdo", monthlySalary: 1400, hireDateUtc: new Date().toISOString(), isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "3", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[0].id, branchName: DEMO_BRANCHES[0].name, firstName: "Jamshid", lastName: "Zokirov", email: "jamshid@apex.uz", phone: "+998 90 201 1103", position: "B2B Savdo Menejeri", department: "Savdo", monthlySalary: 1100, hireDateUtc: new Date().toISOString(), isActive: true, createdAtUtc: new Date().toISOString() },
  { id: "4", companyId: "11111111-1111-1111-1111-111111111111", branchId: DEMO_BRANCHES[1].id, branchName: DEMO_BRANCHES[1].name, firstName: "Nodira", lastName: "Umarova", email: "nodira@apex.uz", phone: "+998 90 202 2201", position: "Chilonzor Filiali Menejeri", department: "Rahbariyat", monthlySalary: 1600, hireDateUtc: new Date().toISOString(), isActive: true, createdAtUtc: new Date().toISOString() }
];

export const DEMO_PURCHASES: Purchase[] = [
  {
    id: "1",
    companyId: "11111111-1111-1111-1111-111111111111",
    supplierId: DEMO_SUPPLIERS[0].id,
    supplierName: DEMO_SUPPLIERS[0].name,
    branchId: DEMO_BRANCHES[0].id,
    branchCode: "HQ-01",
    purchaseNumber: "PO-2026-0001",
    purchaseDateUtc: new Date(Date.now() - 15 * 86400000).toISOString(),
    subTotal: 15000,
    totalAmount: 15000,
    paidAmount: 10500,
    debtRemainingAmount: 4500,
    status: 1,
    paymentMethod: "BankTransfer",
    items: [
      { id: "1", purchaseId: "1", productId: DEMO_PRODUCTS[0].id, productName: DEMO_PRODUCTS[0].name, quantity: 30, unitCost: 500, totalAmount: 15000 }
    ],
    createdAtUtc: new Date().toISOString()
  },
  {
    id: "2",
    companyId: "11111111-1111-1111-1111-111111111111",
    supplierId: DEMO_SUPPLIERS[1].id,
    supplierName: DEMO_SUPPLIERS[1].name,
    branchId: DEMO_BRANCHES[1].id,
    branchCode: "BR-02",
    purchaseNumber: "PO-2026-0002",
    purchaseDateUtc: new Date(Date.now() - 12 * 86400000).toISOString(),
    subTotal: 6500,
    totalAmount: 6500,
    paidAmount: 4400,
    debtRemainingAmount: 2100,
    status: 1,
    paymentMethod: "BankTransfer",
    items: [
      { id: "2", purchaseId: "2", productId: DEMO_PRODUCTS[2].id, productName: DEMO_PRODUCTS[2].name, quantity: 150, unitCost: 43.33, totalAmount: 6500 }
    ],
    createdAtUtc: new Date().toISOString()
  }
];

export const DEMO_NODE_GRAPH: DigitalTwinNodeGraph = {
  nodes: [
    { id: "node-1", type: "revenue", label: "Savdo Tushumi", value: 78500, unit: "USD", status: "healthy" },
    { id: "node-2", type: "cogs", label: "Mahsulot Tannarxi", value: 31200, unit: "USD", status: "healthy" },
    { id: "node-3", type: "gross-profit", label: "Yalpi Foyda", value: 47300, unit: "USD", status: "healthy" },
    { id: "node-4", type: "opex", label: "Operatsion Xarajat", value: 22600, unit: "USD", status: "healthy" },
    { id: "node-5", type: "net-profit", label: "Sof Foyda", value: 24700, unit: "USD", status: "healthy" },
    { id: "node-6", type: "inventory", label: "Ombor Qiymati", value: 48900, unit: "USD", status: "healthy" },
    { id: "node-7", type: "receivables", label: "Mijoz Qarzlari", value: 14200, unit: "USD", status: "warning" },
    { id: "node-8", type: "payables", label: "Yetkazib Beruvchi Qarzi", value: 8900, unit: "USD", status: "healthy" },
  ],
  edges: [
    { source: "node-1", target: "node-2", label: "COGS chiqimi", flowValue: 31200 },
    { source: "node-1", target: "node-3", label: "Yalpi marja", flowValue: 47300 },
    { source: "node-3", target: "node-4", label: "OPEX qoplash", flowValue: 22600 },
    { source: "node-3", target: "node-5", label: "Sof daromad", flowValue: 24700 },
    { source: "node-6", target: "node-2", label: "Zaxiradan yetkazish", flowValue: 31200 },
    { source: "node-7", target: "node-1", label: "Nasiya tushumi", flowValue: 14200 },
    { source: "node-8", target: "node-6", label: "Kreditli ta'minot", flowValue: 8900 },
  ],
};

export const DEMO_INCOME_STATEMENT: IncomeStatement = {
  startDateUtc: new Date(Date.now() - 30 * 86400000).toISOString(),
  endDateUtc: new Date().toISOString(),
  grossRevenue: 78500,
  returnsAndDiscounts: 1200,
  netRevenue: 77300,
  costOfGoodsSold: 31200,
  grossProfit: 46100,
  grossMarginPercent: 59.6,
  totalOpex: 21400,
  opexByCategory: {
    "Ish haqi (Payroll)": 14200,
    "Ijara va Kommunal": 4500,
    "Marketing & Reklama": 1800,
    "Boshqa xarajatlar": 900,
  },
  operatingIncome: 24700,
  netIncome: 24700,
  netMarginPercent: 31.9,
};

export const DEMO_CASH_FLOW: CashFlowEstimate = {
  totalInflows: 83500,
  totalOutflows: 58800,
  netCashFlow: 24700,
  operatingInflows: 71500,
  debtCollections: 12000,
  operatingOutflows: 21400,
  supplierPayments: 37400,
  cashRunwayMonths: 18.5,
};

export const DEMO_STOCK_VALUATION: StockValuation = {
  totalInventoryCostValue: 48900,
  totalInventoryRetailValue: 92400,
  totalUnitsInStock: 845,
  totalActiveProducts: 10,
  lowStockProductCount: 2,
  branchSummaries: [
    {
      branchId: DEMO_BRANCHES[0].id,
      branchName: DEMO_BRANCHES[0].name,
      totalUnits: 510,
      totalCostValue: 31200,
    },
    {
      branchId: DEMO_BRANCHES[1].id,
      branchName: DEMO_BRANCHES[1].name,
      totalUnits: 335,
      totalCostValue: 17700,
    },
  ],
};

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    userEmail: "owner@business-twin.com",
    action: "SIMULATE_SCENARIO",
    entityName: "ScenarioEngine",
    entityId: "sc-expansion-01",
    newValuesJson: '{"priceChangePercent":10,"newBranchesCount":1}',
    ipAddress: "192.168.1.10",
    createdAtUtc: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "log-2",
    userEmail: "manager@business-twin.com",
    action: "CREATE_SALE",
    entityName: "Sale",
    entityId: "sale-1029",
    newValuesJson: '{"saleNumber":"INV-2026-0042","amount":3200}',
    ipAddress: "192.168.1.15",
    createdAtUtc: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "log-3",
    userEmail: "owner@business-twin.com",
    action: "STOCK_ADJUSTMENT",
    entityName: "Inventory",
    entityId: "inv-macbook",
    newValuesJson: '{"quantityChange":5,"reason":"Audit verification"}',
    ipAddress: "192.168.1.10",
    createdAtUtc: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "log-4",
    userEmail: "analyst@business-twin.com",
    action: "GENERATE_REPORT",
    entityName: "IncomeStatement",
    newValuesJson: '{"period":"last-30-days"}',
    ipAddress: "192.168.1.22",
    createdAtUtc: new Date(Date.now() - 240 * 60000).toISOString(),
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "INFO",
    title: "Yangi savdo rekordi",
    message: "Oylik sof tushum $78,500 ga yetdi va marja 31.9% ni tashkil qildi.",
    linkUrl: "/reports",
    isRead: false,
    createdAtUtc: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "notif-2",
    type: "WARNING",
    title: "Kam qolgan tovar ogohlantirishi",
    message: "Dell UltraSharp monitorlar zaxirasi minimal chegaraga yaqinlashdi (8 dona qoldi).",
    linkUrl: "/inventory",
    isRead: false,
    createdAtUtc: new Date(Date.now() - 180 * 60000).toISOString(),
  },
];

export const DEMO_SAVED_SCENARIOS: ScenarioSummary[] = [
  {
    id: "sc-1",
    name: "Narxni 10% oshirish va 3-filial ochish",
    description: "Yunusobod tumanida 3-filial ochish hamda flagman mahsulotlar narxini 10% ga optimallashtirish",
    confidenceScore: 92,
    projectedMonthlyRevenue: 98500,
    projectedMonthlyProfit: 34200,
    monthlyProfitDelta: 9500,
    breakevenMonths: 4.2,
    roiPercent: 148,
    createdAtUtc: new Date(Date.now() - 86400000).toISOString(),
    createdByUserName: "Shahriyor Ikromov",
  },
];

export function calculateSimulationResult(params: SimulateScenarioParams): SimulationResult {
  const baselineMonthlyRev = 78500;
  const baselineMonthlyExp = 53800;
  const baselineMonthlyProfit = baselineMonthlyRev - baselineMonthlyExp;

  const pricePct = params.priceChangePercent || 0;
  const elasticity = params.priceElasticity ?? -1.2;
  const expectedVolChange = params.expectedSalesVolumeChangePercent ?? (pricePct * elasticity);
  
  const revenueFactor = (1 + pricePct / 100) * (1 + expectedVolChange / 100);
  
  const newBranches = params.newBranchesCount || 0;
  const branchRev = newBranches * (params.expectedMonthlyRevenuePerNewBranch || 12000);
  const branchOpex = newBranches * (params.monthlyOpexPerNewBranch || 3200);
  const branchCapex = newBranches * (params.capexPerNewBranch || 35000);

  const headcountChange = params.employeeHeadcountChange || 0;
  const salaryCost = headcountChange * (params.averageNewEmployeeSalary || 1500);
  const marketingCost = params.marketingBudgetMonthly || 0;
  const marketingRev = marketingCost > 0 
    ? ((marketingCost / (params.marketingCustomerAcquisitionCost || 50)) * (params.marketingRevenuePerAcquiredCustomer || 120))
    : 0;

  const simulatedMonthlyRev = Math.round((baselineMonthlyRev * revenueFactor) + branchRev + marketingRev);
  const simulatedMonthlyExp = Math.round(baselineMonthlyExp + branchOpex + salaryCost + marketingCost);
  const simulatedMonthlyProfit = simulatedMonthlyRev - simulatedMonthlyExp;

  const profitDelta = simulatedMonthlyProfit - baselineMonthlyProfit;
  const months = params.projectionMonths || 12;

  const monthlyProjections: MonthlyProjection[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();

  for (let i = 0; i < months; i++) {
    const mIdx = (currentMonthIdx + i) % 12;
    const rampUp = Math.min(1, 0.7 + (i * 0.05));
    const mRev = Math.round(baselineMonthlyRev + (simulatedMonthlyRev - baselineMonthlyRev) * rampUp);
    const mExp = Math.round(baselineMonthlyExp + (simulatedMonthlyExp - baselineMonthlyExp) * rampUp);
    const mProf = mRev - mExp;

    monthlyProjections.push({
      monthIndex: i + 1,
      monthLabel: `${monthNames[mIdx]} 2026`,
      baselineRevenue: baselineMonthlyRev,
      baselineExpenses: baselineMonthlyExp,
      baselineProfit: baselineMonthlyProfit,
      simulatedRevenue: mRev,
      simulatedExpenses: mExp,
      simulatedProfit: mProf,
      p10Profit: Math.round(mProf * 0.82),
      p50Profit: mProf,
      p90Profit: Math.round(mProf * 1.18),
    });
  }

  const initialInvestment = branchCapex + marketingCost;
  const breakevenMonths = initialInvestment > 0 && profitDelta > 0 
    ? Number((initialInvestment / profitDelta).toFixed(1)) 
    : 1.0;
  const totalSimProfit = monthlyProjections.reduce((acc, curr) => acc + curr.simulatedProfit, 0);
  const roi = initialInvestment > 0 ? Number(((totalSimProfit / initialInvestment) * 100).toFixed(1)) : 165;

  const result: SimulationResult = {
    scenarioId: "sc-" + Math.random().toString(36).substring(2, 9),
    scenarioName: params.scenarioName || "Optimallashtirish Ssenariysi",
    isSimulated: true,
    confidenceScore: 92,
    confidenceRationale: "Tahlil qilingan 18 oylik tarixiy ma'lumotlar, elastiklik va xarajat koeffitsientlariga asoslangan yuqori aniqlikdagi hisob-kitob.",
    assumptionsApplied: [
      `Narx o'zgarishi: ${pricePct > 0 ? "+" : ""}${pricePct}%`,
      `Talab elastikligi: ${elasticity}`,
      `Yangi filiallar: +${newBranches} ta`,
      `Kutilayotgan oylik marketing: $${marketingCost.toLocaleString()}`,
    ],
    riskFactors: [
      pricePct > 15 ? "Narx keskin oshishi tufayli mijozlar oqimi sekinlashishi mumkin" : "Yangi filial uchun dastlabki 2 oyda kutilgandan pastroq tushum xavfi",
      headcountChange > 3 ? "Yangi xodimlarni adaptatsiya qilish davrida operatsion unumdorlik pasayishi" : "Ta'minot zanjirida narx tebranishlari",
    ],
    opportunities: [
      `Oylik sof foydaning $${Math.max(0, profitDelta).toLocaleString()} ga oshishi`,
      "Mavjud mijozlar bazasida o'rtacha chek miqdorining 14% ga ko'tarilishi",
      "Kompaniya kassa zaxirasining 24 oygacha kengayishi",
    ],
    summaryMetrics: {
      monthlyRevenue: {
        metricName: "Monthly Revenue",
        baselineValue: baselineMonthlyRev,
        simulatedValue: simulatedMonthlyRev,
        absoluteChange: simulatedMonthlyRev - baselineMonthlyRev,
        percentageChange: Number((((simulatedMonthlyRev - baselineMonthlyRev) / baselineMonthlyRev) * 100).toFixed(1)),
        unit: "USD",
      },
      monthlyExpenses: {
        metricName: "Monthly Expenses",
        baselineValue: baselineMonthlyExp,
        simulatedValue: simulatedMonthlyExp,
        absoluteChange: simulatedMonthlyExp - baselineMonthlyExp,
        percentageChange: Number((((simulatedMonthlyExp - baselineMonthlyExp) / baselineMonthlyExp) * 100).toFixed(1)),
        unit: "USD",
      },
      monthlyProfit: {
        metricName: "Monthly Profit",
        baselineValue: baselineMonthlyProfit,
        simulatedValue: simulatedMonthlyProfit,
        absoluteChange: simulatedMonthlyProfit - baselineMonthlyProfit,
        percentageChange: Number((((simulatedMonthlyProfit - baselineMonthlyProfit) / baselineMonthlyProfit) * 100).toFixed(1)),
        unit: "USD",
      },
    },
    monthlyProjections,
    breakevenMonths,
    roiPercent: roi,
    calculatedAtUtc: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && params.saveScenario) {
    try {
      const stored = localStorage.getItem("bt_saved_scenarios");
      const list: ScenarioSummary[] = stored ? JSON.parse(stored) : [...DEMO_SAVED_SCENARIOS];
      const summary: ScenarioSummary = {
        id: result.scenarioId || "sc-saved",
        name: params.scenarioName,
        description: params.description,
        confidenceScore: 92,
        projectedMonthlyRevenue: simulatedMonthlyRev,
        projectedMonthlyProfit: simulatedMonthlyProfit,
        monthlyProfitDelta: profitDelta,
        breakevenMonths,
        roiPercent: roi,
        createdAtUtc: new Date().toISOString(),
        createdByUserName: "Super Admin",
      };
      list.unshift(summary);
      localStorage.setItem("bt_saved_scenarios", JSON.stringify(list));
      localStorage.setItem(`bt_scenario_${summary.id}`, JSON.stringify(result));
    } catch {
      // Ignore
    }
  }

  return result;
}
