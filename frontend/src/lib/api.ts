import {
  AuthResponse,
  DigitalTwinSnapshot,
  DigitalTwinNodeGraph,
  SimulationResult,
  SimulateScenarioParams,
  ScenarioSummary,
  AdvisorAnalysis,
  AdvisorChatResponse,
  Branch,
  Product,
  InventoryItem,
  StockMovement,
  Customer,
  Supplier,
  Sale,
  Purchase,
  DebtRecord,
  DebtSummary,
  Payment,
  Expense,
  Employee,
  Notification,
  AuditLog,
  IncomeStatement,
  CashFlowEstimate,
  StockValuation,
  User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bt_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("bt_refresh_token");
      if (refreshToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (res.ok) {
            const data: AuthResponse = await res.json();
            localStorage.setItem("bt_access_token", data.accessToken);
            localStorage.setItem("bt_refresh_token", data.refreshToken);
            localStorage.setItem("bt_user", JSON.stringify(data.user));
            localStorage.setItem("bt_company", JSON.stringify(data.currentCompany));
            localStorage.setItem("bt_available_companies", JSON.stringify(data.availableCompanies));
          } else {
            this.handleUnauthorized();
            return {} as T;
          }
        } catch {
          this.handleUnauthorized();
          return {} as T;
        }
      } else {
        this.handleUnauthorized();
        return {} as T;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized();
        return {} as T;
      }
      const errorText = await response.text();
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const json = JSON.parse(errorText);
        errorMsg = json.detail || json.title || json.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private handleUnauthorized(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bt_access_token");
      localStorage.removeItem("bt_refresh_token");
      localStorage.removeItem("bt_user");
      localStorage.removeItem("bt_company");
      localStorage.removeItem("bt_available_companies");
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    currency?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async switchCompany(companyId: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/switch-company`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ companyId }),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(res);
  }

  // --- DIGITAL TWIN ---
  async getTwinSnapshot(): Promise<DigitalTwinSnapshot> {
    const res = await fetch(`${API_BASE}/digital-twin/snapshot`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DigitalTwinSnapshot>(res);
  }

  async getTwinNodeGraph(): Promise<DigitalTwinNodeGraph> {
    const res = await fetch(`${API_BASE}/digital-twin/node-graph`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DigitalTwinNodeGraph>(res);
  }

  // --- SCENARIO SIMULATOR ---
  async simulateScenario(params: SimulateScenarioParams): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/scenarios/simulate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<SimulationResult>(res);
  }

  async getSavedScenarios(): Promise<ScenarioSummary[]> {
    const res = await fetch(`${API_BASE}/scenarios`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ScenarioSummary[]>(res);
  }

  async getScenarioById(id: string): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/scenarios/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<SimulationResult>(res);
  }

  async deleteScenario(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/scenarios/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- AI ADVISOR ---
  async getDiagnostics(language: string = "uz"): Promise<AdvisorAnalysis> {
    const res = await fetch(`${API_BASE}/advisor/diagnostics?language=${language}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdvisorAnalysis>(res);
  }

  async getAdvisorDiagnostics(language: string = "uz"): Promise<AdvisorAnalysis> {
    return this.getDiagnostics(language);
  }

  async chatWithAdvisor(
    message: string,
    language: string = "uz",
    activeScenarioContext?: string
  ): Promise<AdvisorChatResponse> {
    const res = await fetch(`${API_BASE}/advisor/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ message, language, activeScenarioContext }),
    });
    return this.handleResponse<AdvisorChatResponse>(res);
  }

  // --- BRANCHES ---
  async getBranches(): Promise<Branch[]> {
    const res = await fetch(`${API_BASE}/branches`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Branch[]>(res);
  }

  async createBranch(params: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    managerName?: string;
    isMainBranch: boolean;
    monthlyRent: number;
  }): Promise<Branch> {
    const res = await fetch(`${API_BASE}/branches`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Branch>(res);
  }

  async updateBranch(id: string, params: Partial<Branch>): Promise<Branch> {
    const res = await fetch(`${API_BASE}/branches/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Branch>(res);
  }

  async deleteBranch(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/branches/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- EMPLOYEES ---
  async getEmployees(branchId?: string): Promise<Employee[]> {
    const url = branchId ? `${API_BASE}/employees?branchId=${branchId}` : `${API_BASE}/employees`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<Employee[]>(res);
  }

  async createEmployee(params: {
    branchId?: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    phone?: string;
    email?: string;
    monthlySalary: number;
    hireDateUtc?: string;
  }): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Employee>(res);
  }

  async updateEmployee(id: string, params: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Employee>(res);
  }

  async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- CUSTOMERS ---
  async getCustomers(search?: string, segment?: string): Promise<Customer[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (segment) params.append("segment", segment);
    const res = await fetch(`${API_BASE}/customers?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Customer[]>(res);
  }

  async createCustomer(params: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxNumber?: string;
    segment?: string;
  }): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Customer>(res);
  }

  async updateCustomer(id: string, params: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Customer>(res);
  }

  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- SUPPLIERS ---
  async getSuppliers(search?: string): Promise<Supplier[]> {
    const url = search ? `${API_BASE}/suppliers?search=${encodeURIComponent(search)}` : `${API_BASE}/suppliers`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<Supplier[]>(res);
  }

  async createSupplier(params: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxNumber?: string;
    category?: string;
  }): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Supplier>(res);
  }

  async updateSupplier(id: string, params: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Supplier>(res);
  }

  async deleteSupplier(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- PRODUCTS ---
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Product[]>(res);
  }

  async createProduct(params: {
    name: string;
    sku?: string;
    barcode?: string;
    category: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    minStockThreshold: number;
    description?: string;
  }): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Product>(res);
  }

  async updateProduct(id: string, params: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Product>(res);
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- INVENTORY & MOVEMENTS ---
  async getInventory(branchId?: string, search?: string, isLowStock?: boolean): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (search) params.append("search", search);
    if (isLowStock) params.append("isLowStock", "true");
    const res = await fetch(`${API_BASE}/inventory?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<InventoryItem[]>(res);
  }

  async adjustStock(params: {
    branchId: string;
    productId: string;
    quantityChange: number;
    reason?: string;
    type?: number;
  }): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<InventoryItem>(res);
  }

  async getStockMovements(branchId?: string, productId?: string, take: number = 50): Promise<StockMovement[]> {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (productId) params.append("productId", productId);
    params.append("take", take.toString());
    const res = await fetch(`${API_BASE}/inventory/movements?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<StockMovement[]>(res);
  }

  // --- SALES ---
  async getSales(branchId?: string, customerId?: string, from?: string, to?: string): Promise<Sale[]> {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (customerId) params.append("customerId", customerId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(`${API_BASE}/sales?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Sale[]>(res);
  }

  async createSale(params: {
    branchId: string;
    customerId?: string;
    employeeId?: string;
    channel: number;
    paymentMethod: string;
    discountAmount: number;
    paidAmount: number;
    debtDueDateUtc?: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  }): Promise<Sale> {
    const res = await fetch(`${API_BASE}/sales`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Sale>(res);
  }

  // --- PURCHASES ---
  async getPurchases(supplierId?: string, branchId?: string, from?: string, to?: string): Promise<Purchase[]> {
    const params = new URLSearchParams();
    if (supplierId) params.append("supplierId", supplierId);
    if (branchId) params.append("branchId", branchId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(`${API_BASE}/purchases?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Purchase[]>(res);
  }

  async createPurchase(params: {
    supplierId: string;
    branchId: string;
    paymentMethod: string;
    paidAmount: number;
    debtDueDateUtc?: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number; unitCost: number }>;
  }): Promise<Purchase> {
    const res = await fetch(`${API_BASE}/purchases`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Purchase>(res);
  }

  // --- DEBTS ---
  async getDebts(type?: number, status?: number): Promise<DebtRecord[]> {
    const params = new URLSearchParams();
    if (type) params.append("type", type.toString());
    if (status) params.append("status", status.toString());
    const res = await fetch(`${API_BASE}/debts?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DebtRecord[]>(res);
  }

  async createDebt(params: {
    type: number;
    customerId?: string;
    supplierId?: string;
    title: string;
    totalAmount: number;
    dueDateUtc?: string;
    notes?: string;
  }): Promise<DebtRecord> {
    const res = await fetch(`${API_BASE}/debts`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<DebtRecord>(res);
  }

  async payDebt(params: {
    debtRecordId: string;
    paymentAmount: number;
    paymentMethod: string;
    transactionReference?: string;
    notes?: string;
  }): Promise<DebtRecord> {
    const res = await fetch(`${API_BASE}/debts/pay`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<DebtRecord>(res);
  }

  async getDebtSummary(): Promise<DebtSummary> {
    const res = await fetch(`${API_BASE}/debts/summary`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DebtSummary>(res);
  }

  // --- PAYMENTS LEDGER ---
  async getPayments(type?: number, branchId?: string, from?: string, to?: string): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (type) params.append("type", type.toString());
    if (branchId) params.append("branchId", branchId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(`${API_BASE}/payments?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Payment[]>(res);
  }

  async createPayment(params: {
    branchId?: string;
    type: number;
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
    payerOrPayee?: string;
    notes?: string;
  }): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Payment>(res);
  }

  // --- EXPENSES ---
  async getExpenses(branchId?: string, category?: number, from?: string, to?: string): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (category) params.append("category", category.toString());
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(`${API_BASE}/expenses?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Expense[]>(res);
  }

  async createExpense(params: {
    branchId?: string;
    category: number;
    amount: number;
    expenseDateUtc?: string;
    payee: string;
    description?: string;
    paymentMethod?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
  }): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<Expense>(res);
  }

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- REPORTS ---
  async getIncomeStatement(startDate?: string, endDate?: string): Promise<IncomeStatement> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const res = await fetch(`${API_BASE}/reports/income-statement?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<IncomeStatement>(res);
  }

  async getCashFlow(): Promise<CashFlowEstimate> {
    const res = await fetch(`${API_BASE}/reports/cash-flow`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<CashFlowEstimate>(res);
  }

  async getStockValuation(): Promise<StockValuation> {
    const res = await fetch(`${API_BASE}/reports/stock-valuation`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<StockValuation>(res);
  }

  // --- AUDIT & NOTIFICATIONS ---
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/audit/notifications`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Notification[]>(res);
  }

  async markNotificationRead(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/audit/notifications/${id}/read`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  async getAuditLogs(take: number = 50): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit/logs?take=${take}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AuditLog[]>(res);
  }
}

export const api = new ApiClient();
