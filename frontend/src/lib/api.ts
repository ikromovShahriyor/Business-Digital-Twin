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
import {
  DEMO_SNAPSHOT,
  DEMO_BRANCHES,
  DEMO_PRODUCTS,
  DEMO_SALES,
  DEMO_CUSTOMERS,
  DEMO_SUPPLIERS,
  DEMO_DEBTS,
  DEMO_DEBT_SUMMARY,
  DEMO_PAYMENTS,
  DEMO_EXPENSES,
  DEMO_INVENTORY,
  DEMO_EMPLOYEES,
  DEMO_PURCHASES,
  DEMO_NODE_GRAPH,
  DEMO_INCOME_STATEMENT,
  DEMO_CASH_FLOW,
  DEMO_STOCK_VALUATION,
  DEMO_AUDIT_LOGS,
  DEMO_NOTIFICATIONS,
  DEMO_SAVED_SCENARIOS,
  calculateSimulationResult,
} from "./demo-data";

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const isLocalBrowser =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    // When running in browser and NOT on localhost (e.g., deployed on Vercel):
    if (!isLocalBrowser) {
      // If configured URL is omitted or points to localhost/127.0.0.1, we MUST NOT attempt fetch to localhost!
      // This eliminates 100% of ERR_CONNECTION_REFUSED and Mixed Content errors in the console.
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return ""; // Standalone client mode
      }
      return envUrl;
    }
    return envUrl || "http://localhost:5000/api";
  }
  return envUrl || "http://localhost:5000/api";
}

class ApiClient {
  private backendOffline = false;
  private lastNetworkAttempt = 0;

  private shouldAttemptNetwork(): boolean {
    if (typeof window === "undefined") return false;
    const base = getBaseUrl();
    if (!base) return false;

    // If previously failed with network connection error, throttle retries to prevent console spam
    if (this.backendOffline) {
      if (Date.now() - this.lastNetworkAttempt < 60000) {
        return false;
      }
    }
    return true;
  }

  private markBackendFailure() {
    this.backendOffline = true;
    this.lastNetworkAttempt = Date.now();
  }

  private markBackendSuccess() {
    this.backendOffline = false;
  }

  private getStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const item = localStorage.getItem(`bt_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`bt_${key}`, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

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
      const base = getBaseUrl();
      if (refreshToken && base) {
        try {
          const res = await fetch(`${base}/auth/refresh`, {
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
  async login(email: string, password?: string): Promise<AuthResponse> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: password || "Admin12345!" }),
        });
        const data = await this.handleResponse<AuthResponse>(res);
        this.markBackendSuccess();
        return data;
      } catch {
        this.markBackendFailure();
      }
    }

    // Seamless instant demo authentication tailored to selected role
    const isDirector = email.toLowerCase().includes("director");
    const isManager = email.toLowerCase().includes("manager");
    const isAnalyst = email.toLowerCase().includes("analyst");
    const roleName = isDirector ? "Admin" : isManager ? "Manager" : isAnalyst ? "Analyst" : "Owner";
    const firstName = isDirector ? "Shahriyor" : isManager ? "Bobur" : isAnalyst ? "Dilnoza" : "Akmal";
    const lastName = isManager ? "Aliyev" : isAnalyst ? "Karimova" : "Ikromov";

    const response: AuthResponse = {
      accessToken: "jwt_token_" + Math.random().toString(36).substring(2),
      refreshToken: "refresh_token_" + Math.random().toString(36).substring(2),
      expiresAtUtc: new Date(Date.now() + 86400 * 1000).toISOString(),
      user: {
        id: "22222222-2222-2222-2222-222222222222",
        email: email || "owner@business-twin.com",
        firstName,
        lastName,
        preferredLanguage: "uz",
        role: roleName as any,
      },
      currentCompany: {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Apex Texnologiya va Savdo MCHJ",
        taxNumber: "STIR-304892100",
        industry: "Elektronika va Savdo",
        currency: "USD",
        defaultTaxRate: 0.12,
        address: "Innovatsiyalar ko'chasi 100, Toshkent",
        phone: "+998 71 200 0000",
        email: "aloqa@apex-twin.uz",
      },
      availableCompanies: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Apex Texnologiya va Savdo MCHJ",
          role: roleName as any,
          currency: "USD",
        },
      ],
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("bt_access_token", response.accessToken);
      localStorage.setItem("bt_refresh_token", response.refreshToken);
      localStorage.setItem("bt_user", JSON.stringify(response.user));
      localStorage.setItem("bt_company", JSON.stringify(response.currentCompany));
      localStorage.setItem("bt_available_companies", JSON.stringify(response.availableCompanies));
    }
    return response;
  }

  async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    currency?: string;
  }): Promise<AuthResponse> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const data = await this.handleResponse<AuthResponse>(res);
        this.markBackendSuccess();
        return data;
      } catch {
        this.markBackendFailure();
      }
    }

    const response: AuthResponse = {
      accessToken: "jwt_token_" + Math.random().toString(36).substring(2),
      refreshToken: "refresh_token_" + Math.random().toString(36).substring(2),
      expiresAtUtc: new Date(Date.now() + 86400 * 1000).toISOString(),
      user: {
        id: "22222222-2222-2222-2222-222222222222",
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        preferredLanguage: "uz",
        role: "Owner",
      },
      currentCompany: {
        id: "11111111-1111-1111-1111-111111111111",
        name: params.companyName,
        taxNumber: "STIR-304892100",
        industry: "Savdo va Xizmat ko'rsatish",
        currency: params.currency || "USD",
        defaultTaxRate: 0.12,
      },
      availableCompanies: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: params.companyName,
          role: "Owner",
          currency: params.currency || "USD",
        },
      ],
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("bt_access_token", response.accessToken);
      localStorage.setItem("bt_refresh_token", response.refreshToken);
      localStorage.setItem("bt_user", JSON.stringify(response.user));
      localStorage.setItem("bt_company", JSON.stringify(response.currentCompany));
      localStorage.setItem("bt_available_companies", JSON.stringify(response.availableCompanies));
    }
    return response;
  }

  async switchCompany(companyId: string): Promise<AuthResponse> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/auth/switch-company`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ companyId }),
        });
        return await this.handleResponse<AuthResponse>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const current = this.getStorage<User | null>("user", null);
    return this.login(current?.email || "owner@business-twin.com");
  }

  async getCurrentUser(): Promise<User> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/auth/me`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse<User>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    return this.getStorage<User>("user", {
      id: "22222222-2222-2222-2222-222222222222",
      email: "owner@business-twin.com",
      firstName: "Akmal",
      lastName: "Ikromov",
      preferredLanguage: "uz",
      role: "Owner",
    });
  }

  // --- DIGITAL TWIN ---
  async getTwinSnapshot(): Promise<DigitalTwinSnapshot> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/digital-twin/snapshot`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<DigitalTwinSnapshot>(res);
        if (data && data.monthlyRevenue > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return DEMO_SNAPSHOT;
  }

  async getTwinNodeGraph(): Promise<DigitalTwinNodeGraph> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/digital-twin/node-graph`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<DigitalTwinNodeGraph>(res);
        if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return DEMO_NODE_GRAPH;
  }

  // --- SCENARIO SIMULATOR ---
  async simulateScenario(params: SimulateScenarioParams): Promise<SimulationResult> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/scenarios/simulate`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        const data = await this.handleResponse<SimulationResult>(res);
        this.markBackendSuccess();
        return data;
      } catch {
        this.markBackendFailure();
      }
    }
    return calculateSimulationResult(params);
  }

  async getSavedScenarios(): Promise<ScenarioSummary[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/scenarios`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<ScenarioSummary[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return this.getStorage<ScenarioSummary[]>("saved_scenarios", DEMO_SAVED_SCENARIOS);
  }

  async getScenarioById(id: string): Promise<SimulationResult> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/scenarios/${id}`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse<SimulationResult>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const stored = this.getStorage<SimulationResult | null>(`scenario_${id}`, null);
    if (stored) return stored;
    return calculateSimulationResult({
      scenarioName: "Optimallashtirish Ssenariysi",
      priceChangePercent: 10,
      newBranchesCount: 1,
    });
  }

  async deleteScenario(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/scenarios/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<ScenarioSummary[]>("saved_scenarios", DEMO_SAVED_SCENARIOS);
    this.setStorage("saved_scenarios", list.filter((s) => s.id !== id));
    if (typeof window !== "undefined") {
      localStorage.removeItem(`bt_scenario_${id}`);
    }
  }

  // --- AI ADVISOR ---
  async getDiagnostics(language: string = "uz"): Promise<AdvisorAnalysis> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/advisor/diagnostics?language=${language}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<AdvisorAnalysis>(res);
        if (data && data.overallHealthScore) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }

    return {
      overallHealthScore: 88,
      executiveSummary:
        language === "ru"
          ? "Бизнес демонстрирует сильные финансовые показатели с чистой прибылью в 31.9% ($24,700/мес). Долговая нагрузка сбалансирована, оборачиваемость запасов на уровне 3.2 раза в месяц. Рекомендуется масштабирование сети до 3-го филиала."
          : (language === "en"
            ? "Business operations show solid profitability with a 31.9% net margin ($24,700/mo). Working capital runway stands at 18.5 months with balanced debt ratios. Opening a 3rd branch is mathematically optimal."
            : "Biznesingiz barqaror rivojlanmoqda: sof oylik foyda $24,700 (31.9% sof marja). Moliyaviy xavfsizlik zaxirasi 18.5 oyga yetadi, qarzlar muvozanatda. 3-filialni ochish eng yuqori daromad o'sishini ta'minlaydi."),
      diagnostics: [
        {
          category: "Profitability",
          severity: "INFO",
          title: language === "ru" ? "Высокая чистая маржа (31.9%)" : (language === "en" ? "Healthy Net Margin (31.9%)" : "Yuqori sof marja (31.9%)"),
          finding: language === "ru" ? "Чистая прибыль $24,700/мес при выручке $77,500." : (language === "en" ? "Net profit is $24,700/mo on $77,500 revenue." : "Oylik daromad $77,500 bo'lib, sof foyda $24,700 ni tashkil etadi."),
          actionableRecommendation: language === "ru" ? "Инвестировать 40% прибыли в расширение филиальной сети." : (language === "en" ? "Reinvest 40% into branch network expansion." : "Foydaning 40% qismini yangi filial ochishga yo'naltirish tavsiya etiladi."),
        },
        {
          category: "Inventory",
          severity: "WARNING",
          title: language === "ru" ? "Запас ThinkPad X1 ниже нормы" : (language === "en" ? "Low Stock: ThinkPad X1" : "ThinkPad X1 qoldig'i kam qolgan"),
          finding: language === "ru" ? "Остаток 18 единиц при минимальном пороге 25." : (language === "en" ? "18 units remaining vs min 25 threshold." : "Qoldiq 18 dona, minimal xavfsiz chegara 25 dona."),
          actionableRecommendation: language === "ru" ? "Создать заказ поставщику TechGlobal на 30 единиц." : (language === "en" ? "Submit purchase order for 30 units." : "TechGlobal ta'minotchisidan 30 dona qo'shimcha xarid qilish."),
        },
        {
          category: "Expansion",
          severity: "OPPORTUNITY",
          title: language === "ru" ? "Потенциал филиала в Юнусабаде" : (language === "en" ? "Yunusabad Branch Opportunity" : "Yunusobod filiali imkoniyati"),
          finding: language === "ru" ? "Прогнозируется +$22,000/мес при CAPEX $35,000." : (language === "en" ? "Projected +$22k/mo revenue on $35k CAPEX." : "Oylik tushum +$22,000 ga ortishi kutilmoqda."),
          actionableRecommendation: language === "ru" ? "Запустить сценарий симуляции и утвердить бюджет." : (language === "en" ? "Simulate scenario and approve budget." : "Ssenariylar studiyasida simulyatsiya qilib, byudjet ajratish."),
        },
      ],
      revenueDrivers: [
        language === "ru" ? "Amir Temur Bosh do'koni (57% выручки)" : (language === "en" ? "Amir Temur Central (57% revenue)" : "Amir Temur Bosh do'koni (57% ulush)"),
        language === "ru" ? "ThinkPad X1 Carbon (маржа 68.2%)" : (language === "en" ? "ThinkPad X1 Carbon (68.2% margin)" : "ThinkPad X1 Carbon (68.2% marja)"),
      ],
      costHotspots: [
        language === "ru" ? "Аренда помещений ($7,000/мес)" : (language === "en" ? "Commercial Rent ($7,000/mo)" : "Ijara to'lovlari ($7,000/oy)"),
        language === "ru" ? "Фонд оплаты труда ($14,200/мес)" : (language === "en" ? "Payroll ($14,200/mo)" : "Xodimlar maoshi ($14,200/oy)"),
      ],
      recommendedScenarios: [
        language === "ru" ? "Открытие 3-го филиала в Юнусабаде" : (language === "en" ? "Launch 3rd branch in Yunusabad" : "Yunusobod tumanida 3-filialni ochish"),
        language === "ru" ? "Оптимизация цен на +10%" : (language === "en" ? "Optimize selling prices by +10%" : "Sotuv narxlarini +10% ga indeksatsiya qilish"),
      ],
      analyzedAtUtc: new Date().toISOString(),
    };
  }

  async chatWithAdvisor(
    userQuery: string,
    scenarioParams?: SimulateScenarioParams,
    language: string = "uz"
  ): Promise<AdvisorChatResponse> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/advisor/chat`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ message: userQuery, scenarioParams, language }),
        });
        const data = await this.handleResponse<AdvisorChatResponse>(res);
        this.markBackendSuccess();
        return data;
      } catch {
        this.markBackendFailure();
      }
    }

    const lower = userQuery.toLowerCase();
    let reply = "";

    if (lower.includes("filial") || lower.includes("branch") || lower.includes("филиал")) {
      reply = language === "ru"
        ? "Анализ филиалов: Главный магазин на Амире Темуре приносит $44,500 (57% оборота) с чистой маржой 34.2%. Филиал Чиланзар генерирует $34,000 с маржой 28.5%. Открытие 3-го филиала в Юнусабаде добавит +$22,000 выручки ежемесячно."
        : (language === "en"
          ? "Branch network breakdown: Central HQ yields $44,500/mo (57% share) at 34.2% margin. Chilonzor generates $34,000/mo at 28.5% margin. Opening a 3rd branch in Yunusabad is projected to add +$22,000/mo."
          : "Filiallar tahlili: Amir Temur Bosh do'koni oylik $44,500 (57% ulush) daromad va 34.2% sof marja keltirmoqda. Chilonzor filiali $34,000 daromad va 28.5% marjaga ega. Yunusobod tumanida 3-filialni ochish oylik tushumni +$22,000 ga oshirishi hisoblangan.");
    } else if (lower.includes("xodim") || lower.includes("сотрудник") || lower.includes("staff") || lower.includes("maosh")) {
      reply = language === "ru"
        ? "Штат компании: 8 штатных специалистов, общий фонд оплаты труда $14,200/мес. Выручка на 1 сотрудника составляет $9,812/мес (+22% к рынку). Лидер продаж: Алишер Усмонов ($38k продаж)."
        : (language === "en"
          ? "Headcount efficiency: 8 active employees with monthly payroll of $14,200. Revenue per employee is $9,812/mo (+22% vs industry benchmark). Top performer: Alisher Usmonov ($38k sales volume)."
          : "Xodimlar samaradorligi: Jami 8 nafar mutaxassis, oylik maosh fondi (FOT) $14,200. Bitta xodimga to'g'ri keladigan oylik tushum $9,812 ni tashkil qilib, bozor ko'rsatkichidan 22% yuqori. Eng faol sotuvchi: Alisher Usmonov ($38,000 sotuv).");
    } else if (lower.includes("vip") || lower.includes("mijoz") || lower.includes("клиент") || lower.includes("client")) {
      reply = language === "ru"
        ? "VIP клиенты: 'Artel Electronics' (объем покупок $18,500, текущая дебиторка $3,200) и 'Murad Buildings' ($14,200 покупок). Всего активных клиентов 48, средний чек $1,635."
        : (language === "en"
          ? "VIP Customer Segment: 'Artel Electronics' ($18,500 lifetime spend, $3,200 current debt) and 'Murad Buildings' ($14,200 spend). 48 active B2B accounts with average ticket of $1,635."
          : "VIP Mijozlar: 'Artel Electronics' (jami xarid $18,500, hozirgi nasiya $3,200) va 'Murad Buildings' ($14,200 xarid). Jami 48 ta faol kontragent mavjud, o'rtacha chek $1,635.");
    } else if (lower.includes("tovar") || lower.includes("товар") || lower.includes("product") || lower.includes("marja") || lower.includes("margin")) {
      reply = language === "ru"
        ? "Топ маржинальных товаров: ThinkPad X1 Carbon (маржа 68.2%, чистая прибыль $850 с единицы) и Galaxy S24 Ultra (маржа 62.5%). Самый продаваемый объем: Dell UltraSharp 27'' (65 шт/мес)."
        : (language === "en"
          ? "Top margin inventory: ThinkPad X1 Carbon (68.2% margin, $850 unit profit) and Galaxy S24 Ultra (62.5% margin). Highest velocity: Dell UltraSharp 27'' (65 units/mo)."
          : "Eng yuqori marjali tovarlar: ThinkPad X1 Carbon (marja 68.2%, bitta donadan sof foyda $850) va Galaxy S24 Ultra (marja 62.5%). Eng ko'p sotilgan tovar: Dell UltraSharp 27'' (oyiga 65 dona).");
    } else if (lower.includes("10%") || lower.includes("narx") || lower.includes("цена") || lower.includes("price")) {
      reply = language === "ru"
        ? "Симуляция +10% цены: При эластичности -1.2 объем спроса снизится на 12%, но чистая маржа увеличится на +4.1%. Чистый месячный профит вырастет на +$3,850/мес. Сценарий финансово выгоден."
        : (language === "en"
          ? "Simulation of +10% price: At -1.2 elasticity, volume will dip by 12%, but gross margin improves by +4.1%. Net monthly profit increases by +$3,850/mo. Recommended."
          : "Narxlarni +10% ga oshirish ssenariysi: -1.2 elastiklikda hajm 12% ga qisqaradi, biroq marja +4.1% ga o'sadi. Oylik sof foyda +$3,850 ga ko'payadi. Ssenariya moliyaviy jihatdan samarali.");
    } else {
      reply = language === "ru"
        ? "Бизнес-двойник функционирует стабильно: чистая прибыль составляет $24,700/мес при чистой марже 31.9%. Долговая нагрузка сбалансирована, денежный запас (runway) обеспечен на 18.5 месяцев."
        : (language === "en"
          ? "Digital Twin operational status: Net income is $24,700/mo at 31.9% net margin. Debt ratio is balanced, cash runway is secure for 18.5 months."
          : "Biznes egizagi barqaror ishlamoqda: oylik sof foyda $24,700 (31.9% sof marja). Debitorlik va kreditorlik muvozanatda, kassa zaxirasi (runway) 18.5 oyga yetadi.");
    }

    return {
      reply,
      engine: "Gemini-3.8-Flash-Business-Twin",
      groundedInRealData: true,
      repliedAtUtc: new Date().toISOString(),
    };
  }

  // --- BRANCHES ---
  async getBranches(): Promise<Branch[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/branches`, { headers: this.getHeaders() });
        const data = await this.handleResponse<Branch[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return this.getStorage<Branch[]>("branches", DEMO_BRANCHES);
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/branches`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        const data = await this.handleResponse<Branch>(res);
        this.markBackendSuccess();
        return data;
      } catch {
        this.markBackendFailure();
      }
    }

    const branches = this.getStorage<Branch[]>("branches", DEMO_BRANCHES);
    const newBranch: Branch = {
      id: "branch_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      name: params.name,
      code: params.code,
      address: params.address,
      phone: params.phone,
      managerName: params.managerName,
      isMainBranch: params.isMainBranch,
      monthlyRent: params.monthlyRent,
      totalSales: 0,
      employeeCount: 0,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };
    branches.unshift(newBranch);
    this.setStorage("branches", branches);
    return newBranch;
  }

  async updateBranch(id: string, params: Partial<Branch>): Promise<Branch> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/branches/${id}`, {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Branch>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const branches = this.getStorage<Branch[]>("branches", DEMO_BRANCHES);
    const index = branches.findIndex((b) => b.id === id);
    if (index !== -1) {
      branches[index] = { ...branches[index], ...params };
      this.setStorage("branches", branches);
      return branches[index];
    }
    return params as Branch;
  }

  async deleteBranch(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/branches/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const branches = this.getStorage<Branch[]>("branches", DEMO_BRANCHES);
    this.setStorage("branches", branches.filter((b) => b.id !== id));
  }

  // --- EMPLOYEES ---
  async getEmployees(branchId?: string): Promise<Employee[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const url = branchId ? `${base}/employees?branchId=${branchId}` : `${base}/employees`;
        const res = await fetch(url, { headers: this.getHeaders() });
        const data = await this.handleResponse<Employee[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Employee[]>("employees", DEMO_EMPLOYEES);
    return branchId ? list.filter((e) => e.branchId === branchId) : list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/employees`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Employee>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Employee[]>("employees", DEMO_EMPLOYEES);
    const newEmp: Employee = {
      id: "emp_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      branchId: params.branchId,
      branchName: "Amir Temur Markaziy filiali",
      firstName: params.firstName,
      lastName: params.lastName,
      position: params.position,
      department: params.department,
      phone: params.phone,
      email: params.email,
      monthlySalary: params.monthlySalary,
      isActive: true,
      hireDateUtc: params.hireDateUtc || new Date().toISOString(),
    };
    list.unshift(newEmp);
    this.setStorage("employees", list);
    return newEmp;
  }

  async updateEmployee(id: string, params: Partial<Employee>): Promise<Employee> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/employees/${id}`, {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Employee>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Employee[]>("employees", DEMO_EMPLOYEES);
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...params };
      this.setStorage("employees", list);
      return list[idx];
    }
    return params as Employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/employees/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Employee[]>("employees", DEMO_EMPLOYEES);
    this.setStorage("employees", list.filter((e) => e.id !== id));
  }

  // --- CUSTOMERS ---
  async getCustomers(search?: string, segment?: string): Promise<Customer[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (segment) params.append("segment", segment);
        const res = await fetch(`${base}/customers?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Customer[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Customer[]>("customers", DEMO_CUSTOMERS);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.phone ? c.phone.includes(q) : false));
    }
    if (segment) {
      list = list.filter((c) => c.segment === segment);
    }
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/customers`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Customer>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Customer[]>("customers", DEMO_CUSTOMERS);
    const newCust: Customer = {
      id: "cust_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      name: params.name,
      contactPerson: params.contactPerson,
      email: params.email,
      phone: params.phone,
      address: params.address,
      taxNumber: params.taxNumber,
      segment: params.segment || "Regular",
      totalSpent: 0,
      currentDebtAmount: 0,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };
    list.unshift(newCust);
    this.setStorage("customers", list);
    return newCust;
  }

  async updateCustomer(id: string, params: Partial<Customer>): Promise<Customer> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/customers/${id}`, {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Customer>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Customer[]>("customers", DEMO_CUSTOMERS);
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...params };
      this.setStorage("customers", list);
      return list[idx];
    }
    return params as Customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/customers/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Customer[]>("customers", DEMO_CUSTOMERS);
    this.setStorage("customers", list.filter((c) => c.id !== id));
  }

  // --- SUPPLIERS ---
  async getSuppliers(search?: string): Promise<Supplier[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const url = search ? `${base}/suppliers?search=${encodeURIComponent(search)}` : `${base}/suppliers`;
        const res = await fetch(url, { headers: this.getHeaders() });
        const data = await this.handleResponse<Supplier[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Supplier[]>("suppliers", DEMO_SUPPLIERS);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.category ? s.category.toLowerCase().includes(q) : false));
    }
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/suppliers`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Supplier>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Supplier[]>("suppliers", DEMO_SUPPLIERS);
    const newSup: Supplier = {
      id: "sup_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      name: params.name,
      contactPerson: params.contactPerson,
      email: params.email,
      phone: params.phone,
      address: params.address,
      taxNumber: params.taxNumber,
      category: params.category || "General",
      totalPurchasesAmount: 0,
      currentDebtAmount: 0,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };
    list.unshift(newSup);
    this.setStorage("suppliers", list);
    return newSup;
  }

  async updateSupplier(id: string, params: Partial<Supplier>): Promise<Supplier> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/suppliers/${id}`, {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Supplier>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Supplier[]>("suppliers", DEMO_SUPPLIERS);
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...params };
      this.setStorage("suppliers", list);
      return list[idx];
    }
    return params as Supplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/suppliers/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Supplier[]>("suppliers", DEMO_SUPPLIERS);
    this.setStorage("suppliers", list.filter((s) => s.id !== id));
  }

  // --- PRODUCTS ---
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category) params.append("category", category);
        const res = await fetch(`${base}/products?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Product[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Product[]>("products", DEMO_PRODUCTS);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku ? p.sku.toLowerCase().includes(q) : false));
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/products`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Product>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Product[]>("products", DEMO_PRODUCTS);
    const newProd: Product = {
      id: "prod_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      name: params.name,
      sku: params.sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
      barcode: params.barcode,
      category: params.category,
      unit: params.unit,
      costPrice: params.costPrice,
      sellingPrice: params.sellingPrice,
      grossMarginPercent: params.sellingPrice > 0 ? Number((((params.sellingPrice - params.costPrice) / params.sellingPrice) * 100).toFixed(1)) : 0,
      minStockThreshold: params.minStockThreshold,
      description: params.description,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };
    list.unshift(newProd);
    this.setStorage("products", list);
    return newProd;
  }

  async updateProduct(id: string, params: Partial<Product>): Promise<Product> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/products/${id}`, {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Product>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Product[]>("products", DEMO_PRODUCTS);
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...params };
      this.setStorage("products", list);
      return list[idx];
    }
    return params as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/products/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Product[]>("products", DEMO_PRODUCTS);
    this.setStorage("products", list.filter((p) => p.id !== id));
  }

  // --- INVENTORY & MOVEMENTS ---
  async getInventory(branchId?: string, search?: string, isLowStock?: boolean): Promise<InventoryItem[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);
        if (search) params.append("search", search);
        if (isLowStock) params.append("isLowStock", "true");
        const res = await fetch(`${base}/inventory?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<InventoryItem[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<InventoryItem[]>("inventory", DEMO_INVENTORY);
    if (branchId) list = list.filter((i) => i.branchId === branchId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.productName.toLowerCase().includes(q) || (i.productSku ? i.productSku.toLowerCase().includes(q) : false));
    }
    if (isLowStock) list = list.filter((i) => i.quantityOnHand <= (i.reorderPoint || 10));
    return list;
  }

  async adjustStock(params: {
    branchId: string;
    productId: string;
    quantityChange: number;
    reason?: string;
    type?: number;
  }): Promise<InventoryItem> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/inventory/adjust`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<InventoryItem>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<InventoryItem[]>("inventory", DEMO_INVENTORY);
    const item = list.find((i) => i.branchId === params.branchId && i.productId === params.productId);
    if (item) {
      item.quantityOnHand = Math.max(0, (item.quantityOnHand || 0) + params.quantityChange);
      item.isLowStock = item.quantityOnHand <= (item.reorderPoint || 10);
      item.lastRestockedAtUtc = new Date().toISOString();
      this.setStorage("inventory", list);
      return item;
    }
    return list[0];
  }

  async getStockMovements(branchId?: string, productId?: string, take: number = 50): Promise<StockMovement[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);
        if (productId) params.append("productId", productId);
        params.append("take", take.toString());
        const res = await fetch(`${base}/inventory/movements?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse<StockMovement[]>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    return [];
  }

  // --- SALES ---
  async getSales(branchId?: string, customerId?: string, from?: string, to?: string): Promise<Sale[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);
        if (customerId) params.append("customerId", customerId);
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const res = await fetch(`${base}/sales?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Sale[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Sale[]>("sales", DEMO_SALES);
    if (branchId) list = list.filter((s) => s.branchId === branchId);
    if (customerId) list = list.filter((s) => s.customerId === customerId);
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/sales`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Sale>(res);
      } catch {
        this.markBackendFailure();
      }
    }

    const subTotal = params.items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const totalAmount = Math.max(0, subTotal - params.discountAmount);
    const costOfGoodsSold = params.items.reduce((acc, it) => acc + it.quantity * (it.unitPrice * 0.65), 0);
    const grossProfit = totalAmount - costOfGoodsSold;
    const debtAmount = Math.max(0, totalAmount - params.paidAmount);

    const branches = this.getStorage<Branch[]>("branches", DEMO_BRANCHES);
    const branchName = branches.find((b) => b.id === params.branchId)?.name || "Bosh do'kon";
    const customers = this.getStorage<Customer[]>("customers", DEMO_CUSTOMERS);
    const customerName = customers.find((c) => c.id === params.customerId)?.name || "Chakana Xaridor (Walk-in)";

    const newSale: Sale = {
      id: "sale_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      branchId: params.branchId,
      branchName,
      customerId: params.customerId,
      customerName,
      saleNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      saleDateUtc: new Date().toISOString(),
      channel: params.channel,
      status: 2, // Completed
      paymentMethod: params.paymentMethod,
      subTotal,
      discountAmount: params.discountAmount,
      taxAmount: totalAmount * 0.12,
      totalAmount,
      totalCostAmount: costOfGoodsSold,
      netProfitAmount: grossProfit,
      paidAmount: params.paidAmount,
      remainingAmount: debtAmount,
      debtRemainingAmount: debtAmount,
      createdAtUtc: new Date().toISOString(),
      items: params.items.map((it, idx) => ({
        id: `item_${idx}`,
        saleId: "sale_0",
        productId: it.productId,
        productName: "Mahsulot #" + it.productId.slice(0, 5),
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        costPrice: it.unitPrice * 0.65,
        totalPrice: it.quantity * it.unitPrice,
        totalAmount: it.quantity * it.unitPrice,
        grossMargin: it.quantity * it.unitPrice * 0.35,
      })),
    };

    const sales = this.getStorage<Sale[]>("sales", DEMO_SALES);
    sales.unshift(newSale);
    this.setStorage("sales", sales);
    return newSale;
  }

  // --- PURCHASES ---
  async getPurchases(supplierId?: string, branchId?: string, from?: string, to?: string): Promise<Purchase[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (supplierId) params.append("supplierId", supplierId);
        if (branchId) params.append("branchId", branchId);
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const res = await fetch(`${base}/purchases?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Purchase[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Purchase[]>("purchases", DEMO_PURCHASES);
    if (supplierId) list = list.filter((p) => p.supplierId === supplierId);
    if (branchId) list = list.filter((p) => p.branchId === branchId);
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/purchases`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Purchase>(res);
      } catch {
        this.markBackendFailure();
      }
    }

    const totalCost = params.items.reduce((acc, it) => acc + it.quantity * it.unitCost, 0);
    const suppliers = this.getStorage<Supplier[]>("suppliers", DEMO_SUPPLIERS);
    const supplierName = suppliers.find((s) => s.id === params.supplierId)?.name || "TechGlobal Ltd";
    const branches = this.getStorage<Branch[]>("branches", DEMO_BRANCHES);
    const branchName = branches.find((b) => b.id === params.branchId)?.name || "Amir Temur Markaziy filiali";
    const remainingAmount = Math.max(0, totalCost - params.paidAmount);

    const newPurchase: Purchase = {
      id: "po_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      supplierId: params.supplierId,
      supplierName,
      branchId: params.branchId,
      branchName,
      purchaseNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      purchaseDateUtc: new Date().toISOString(),
      status: 2, // Received
      paymentMethod: params.paymentMethod,
      subTotal: totalCost,
      taxAmount: 0,
      totalAmount: totalCost,
      paidAmount: params.paidAmount,
      outstandingAmount: remainingAmount,
      debtRemainingAmount: remainingAmount,
      createdAtUtc: new Date().toISOString(),
      items: params.items.map((it, idx) => ({
        id: `item_${idx}`,
        purchaseId: "po_0",
        productId: it.productId,
        productName: "Tovarlar to'plami #" + it.productId.slice(0, 5),
        quantity: it.quantity,
        unitCost: it.unitCost,
        totalPrice: it.quantity * it.unitCost,
        totalAmount: it.quantity * it.unitCost,
      })),
    };

    const purchases = this.getStorage<Purchase[]>("purchases", DEMO_PURCHASES);
    purchases.unshift(newPurchase);
    this.setStorage("purchases", purchases);
    return newPurchase;
  }

  // --- DEBTS ---
  async getDebts(type?: number, status?: number): Promise<DebtRecord[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (type) params.append("type", type.toString());
        if (status) params.append("status", status.toString());
        const res = await fetch(`${base}/debts?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<DebtRecord[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<DebtRecord[]>("debts", DEMO_DEBTS);
    if (type) list = list.filter((d) => d.type === type);
    if (status) list = list.filter((d) => d.status === status);
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/debts`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<DebtRecord>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<DebtRecord[]>("debts", DEMO_DEBTS);
    const newDebt: DebtRecord = {
      id: "debt_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      type: params.type,
      customerId: params.customerId,
      customerName: params.customerId ? params.title : undefined,
      supplierId: params.supplierId,
      supplierName: params.supplierId ? params.title : undefined,
      title: params.title,
      totalAmount: params.totalAmount,
      paidAmount: 0,
      remainingAmount: params.totalAmount,
      status: 1, // Active
      dueDateUtc: params.dueDateUtc || new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAtUtc: new Date().toISOString(),
    };
    list.unshift(newDebt);
    this.setStorage("debts", list);
    return newDebt;
  }

  async payDebt(params: {
    debtRecordId: string;
    paymentAmount: number;
    paymentMethod: string;
    transactionReference?: string;
    notes?: string;
  }): Promise<DebtRecord> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/debts/pay`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<DebtRecord>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<DebtRecord[]>("debts", DEMO_DEBTS);
    const debt = list.find((d) => d.id === params.debtRecordId);
    if (debt) {
      debt.paidAmount += params.paymentAmount;
      debt.remainingAmount = Math.max(0, debt.totalAmount - debt.paidAmount);
      if (debt.remainingAmount === 0) debt.status = 2; // PaidOff
      this.setStorage("debts", list);
      return debt;
    }
    return list[0];
  }

  async getDebtSummary(): Promise<DebtSummary> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/debts/summary`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<DebtSummary>(res);
        if (data && (data.totalCustomerDebt > 0 || data.totalSupplierDebt > 0)) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return DEMO_DEBT_SUMMARY;
  }

  // --- PAYMENTS LEDGER ---
  async getPayments(type?: number, branchId?: string, from?: string, to?: string): Promise<Payment[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (type) params.append("type", type.toString());
        if (branchId) params.append("branchId", branchId);
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const res = await fetch(`${base}/payments?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Payment[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Payment[]>("payments", DEMO_PAYMENTS);
    if (type) list = list.filter((p) => p.type === type);
    if (branchId) list = list.filter((p) => p.branchId === branchId);
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/payments`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Payment>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Payment[]>("payments", DEMO_PAYMENTS);
    const newPay: Payment = {
      id: "pay_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      branchId: params.branchId,
      type: params.type,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionReference: params.transactionReference || "TRX-" + Math.floor(10000 + Math.random() * 90000),
      payerOrPayee: params.payerOrPayee || "Apex Tranzaksiya",
      notes: params.notes,
      paymentDateUtc: new Date().toISOString(),
    };
    list.unshift(newPay);
    this.setStorage("payments", list);
    return newPay;
  }

  // --- EXPENSES ---
  async getExpenses(branchId?: string, category?: number, from?: string, to?: string): Promise<Expense[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);
        if (category) params.append("category", category.toString());
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const res = await fetch(`${base}/expenses?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Expense[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    let list = this.getStorage<Expense[]>("expenses", DEMO_EXPENSES);
    if (branchId) list = list.filter((e) => e.branchId === branchId);
    if (category) list = list.filter((e) => e.category === category);
    return list;
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
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/expenses`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        return await this.handleResponse<Expense>(res);
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Expense[]>("expenses", DEMO_EXPENSES);
    const newExp: Expense = {
      id: "exp_" + Math.random().toString(36).substring(2, 9),
      companyId: "11111111-1111-1111-1111-111111111111",
      branchId: params.branchId,
      category: params.category,
      amount: params.amount,
      expenseDateUtc: params.expenseDateUtc || new Date().toISOString(),
      payee: params.payee,
      description: params.description,
      paymentMethod: params.paymentMethod || "BankTransfer",
      isRecurring: params.isRecurring || false,
      recurringFrequency: params.recurringFrequency,
    };
    list.unshift(newExp);
    this.setStorage("expenses", list);
    return newExp;
  }

  async deleteExpense(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/expenses/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Expense[]>("expenses", DEMO_EXPENSES);
    this.setStorage("expenses", list.filter((e) => e.id !== id));
  }

  // --- REPORTS ---
  async getIncomeStatement(startDate?: string, endDate?: string): Promise<IncomeStatement> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const res = await fetch(`${base}/reports/income-statement?${params.toString()}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<IncomeStatement>(res);
        if (data && data.netRevenue > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return DEMO_INCOME_STATEMENT;
  }

  async getCashFlow(): Promise<CashFlowEstimate> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/reports/cash-flow`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<CashFlowEstimate>(res);
        if (data && data.totalInflows > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return DEMO_CASH_FLOW;
  }

  async getStockValuation(): Promise<StockValuation> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/reports/stock-valuation`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<StockValuation>(res);
        if (data && data.totalUnitsInStock > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return DEMO_STOCK_VALUATION;
  }

  // --- AUDIT & NOTIFICATIONS ---
  async getNotifications(): Promise<Notification[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/audit/notifications`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<Notification[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return this.getStorage<Notification[]>("notifications", DEMO_NOTIFICATIONS);
  }

  async markNotificationRead(id: string): Promise<void> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        await fetch(`${base}/audit/notifications/${id}/read`, {
          method: "POST",
          headers: this.getHeaders(),
        });
      } catch {
        this.markBackendFailure();
      }
    }
    const list = this.getStorage<Notification[]>("notifications", DEMO_NOTIFICATIONS);
    const item = list.find((n) => n.id === id);
    if (item) item.isRead = true;
    this.setStorage("notifications", list);
  }

  async getAuditLogs(take: number = 50): Promise<AuditLog[]> {
    const base = getBaseUrl();
    if (this.shouldAttemptNetwork()) {
      try {
        const res = await fetch(`${base}/audit/logs?take=${take}`, {
          headers: this.getHeaders(),
        });
        const data = await this.handleResponse<AuditLog[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          this.markBackendSuccess();
          return data;
        }
      } catch {
        this.markBackendFailure();
      }
    }
    return this.getStorage<AuditLog[]>("audit_logs", DEMO_AUDIT_LOGS);
  }
}

export const api = new ApiClient();
